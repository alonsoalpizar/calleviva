package creator

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

// DBExecutor interface abstracts pgxpool.Pool for testing
type DBExecutor interface {
	Query(ctx context.Context, sql string, args ...any) (pgx.Rows, error)
	QueryRow(ctx context.Context, sql string, args ...any) pgx.Row
	Exec(ctx context.Context, sql string, args ...any) (pgconn.CommandTag, error)
}

type Handler struct {
	db DBExecutor
}

func NewHandler(db DBExecutor) *Handler {
	return &Handler{db: db}
}

// SetupPublicRoutes mounts public creator routes (no auth required)
func (h *Handler) SetupPublicRoutes(r chi.Router) {
	r.Route("/creator", func(r chi.Router) {
		r.Post("/submit", h.Submit)
		r.Get("/my-creations", h.MyCreations)
		r.Delete("/creations/{id}", h.Delete)
		r.Get("/agent-options", h.GetAgentOptions)
	})

	r.Route("/game/content", func(r chi.Router) {
		r.Get("/{type}", h.GetApprovedContent)
		r.Get("/random/{type}", h.GetRandomContent)
	})
}

// SetupAdminRoutes mounts admin creator routes (requires auth)
func (h *Handler) SetupAdminRoutes(r chi.Router) {
	r.Route("/creator", func(r chi.Router) {
		r.Get("/pending", h.GetPending)
		r.Get("/all", h.GetAll)
		r.Put("/{id}/review", h.Review)
	})
}

// POST /api/creator/submit
func (h *Handler) Submit(w http.ResponseWriter, r *http.Request) {
	var input ContentCreationInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, map[string]string{"error": "Invalid input"})
		return
	}

	if input.CreatorName == "" {
		input.CreatorName = "Nacho"
	}

	// Check for duplicate (same recipe in last 5 minutes)
	var existingID string
	err := h.db.QueryRow(r.Context(), `
		SELECT id FROM content_creations
		WHERE creator_name = $1 AND recipe = $2 AND created_at > NOW() - INTERVAL '5 minutes'
		LIMIT 1
	`, input.CreatorName, input.Recipe).Scan(&existingID)

	if err == nil && existingID != "" {
		// Duplicate found - return the existing ID without error
		render.Status(r, http.StatusOK)
		render.JSON(w, r, map[string]string{"message": "Already submitted", "id": existingID, "duplicate": "true"})
		return
	}

	var id string
	err = h.db.QueryRow(r.Context(), `
		INSERT INTO content_creations (content_type, name, description, recipe, creator_name, status)
		VALUES ($1, $2, $3, $4, $5, 'pending')
		RETURNING id
	`, input.ContentType, input.Name, input.Description, input.Recipe, input.CreatorName).Scan(&id)

	if err != nil {
		log.Printf("Insert error: %v", err)
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, map[string]string{"error": "Failed to create"})
		return
	}

	render.Status(r, http.StatusCreated)
	render.JSON(w, r, map[string]string{"message": "Created successfully", "id": id})
}

// GET /api/creator/my-creations
func (h *Handler) MyCreations(w http.ResponseWriter, r *http.Request) {
	creator := r.URL.Query().Get("creator")
	if creator == "" {
		creator = "Nacho"
	}

	rows, err := h.db.Query(r.Context(), `
		SELECT id, content_type, name, description, recipe, creator_name, created_at, status, times_used
		FROM content_creations
		WHERE creator_name = $1 AND is_active = true
		ORDER BY created_at DESC
	`, creator)
	if err != nil {
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, map[string]string{"error": "Database error"})
		return
	}
	defer rows.Close()

	var creations []ContentCreation
	for rows.Next() {
		var c ContentCreation
		if err := rows.Scan(&c.ID, &c.ContentType, &c.Name, &c.Description, &c.Recipe, &c.CreatorName, &c.CreatedAt, &c.Status, &c.TimesUsed); err != nil {
			continue
		}
		creations = append(creations, c)
	}

	render.JSON(w, r, creations)
}

// GET /api/admin/creator/pending
func (h *Handler) GetPending(w http.ResponseWriter, r *http.Request) {
	rows, err := h.db.Query(r.Context(), `
		SELECT id, content_type, name, description, recipe, creator_name, created_at, status,
		       reviewed_by, reviewed_at, review_notes, times_used, last_used_at, is_active
		FROM content_creations
		WHERE status = 'pending' AND is_active = true
		ORDER BY created_at ASC
	`)
	if err != nil {
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, map[string]string{"error": "Database error"})
		return
	}
	defer rows.Close()

	creations, err := pgx.CollectRows(rows, pgx.RowToStructByName[ContentCreation])
	if err != nil {
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, map[string]string{"error": "Row scan error"})
		return
	}

	render.JSON(w, r, creations)
}

// GET /api/admin/creator/all
func (h *Handler) GetAll(w http.ResponseWriter, r *http.Request) {
	status := r.URL.Query().Get("status")
	cType := r.URL.Query().Get("type")

	query := `SELECT id, content_type, name, COALESCE(description, '') as description, recipe,
	                 creator_name, created_at, status, reviewed_by, reviewed_at,
	                 COALESCE(review_notes, '') as review_notes, times_used, last_used_at, is_active
			  FROM content_creations WHERE is_active = true`
	var args []interface{}

	if status != "" {
		args = append(args, status)
		query += ` AND status = $1`
	}
	if cType != "" {
		if len(args) > 0 {
			args = append(args, cType)
			query += ` AND content_type = $2`
		} else {
			args = append(args, cType)
			query += ` AND content_type = $1`
		}
	}

	query += ` ORDER BY created_at DESC`
	log.Printf("Query: %s, Args: %v", query, args)

	rows, err := h.db.Query(r.Context(), query, args...)
	if err != nil {
		log.Printf("Query error: %v", err)
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, map[string]string{"error": "Database error"})
		return
	}
	defer rows.Close()

	var creations []ContentCreation
	for rows.Next() {
		var c ContentCreation
		err := rows.Scan(
			&c.ID, &c.ContentType, &c.Name, &c.Description, &c.Recipe,
			&c.CreatorName, &c.CreatedAt, &c.Status, &c.ReviewedBy, &c.ReviewedAt,
			&c.ReviewNotes, &c.TimesUsed, &c.LastUsedAt, &c.IsActive,
		)
		if err != nil {
			log.Printf("Scan error: %v", err)
			continue
		}
		creations = append(creations, c)
	}

	if err := rows.Err(); err != nil {
		log.Printf("Rows error: %v", err)
	}

	log.Printf("Found %d creations", len(creations))
	render.JSON(w, r, creations)
}

func jsonNumber(n int) string {
	// Simple int to string for query param index
	// Only valid for single digits effectively in this context without proper conversion
	// Using a more robust way:
	bytes, _ := json.Marshal(n)
	return string(bytes)
}

// PUT /api/admin/creator/{id}/review
func (h *Handler) Review(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var input ContentReviewInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		render.Status(r, http.StatusBadRequest)
		return
	}

	if input.Status != "approved" && input.Status != "rejected" && input.Status != "needs_edit" {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, map[string]string{"error": "Invalid status"})
		return
	}

	tag, err := h.db.Exec(r.Context(), `
		UPDATE content_creations 
		SET status = $1, review_notes = $2, reviewed_at = NOW()
		WHERE id = $3
	`, input.Status, input.Notes, id)

	if err != nil {
		render.Status(r, http.StatusInternalServerError)
		return
	}

	if tag.RowsAffected() == 0 {
		render.Status(r, http.StatusNotFound)
		return
	}

	render.JSON(w, r, map[string]string{"message": "Review saved"})
}

// GET /api/game/content/{type}
func (h *Handler) GetApprovedContent(w http.ResponseWriter, r *http.Request) {
	cType := chi.URLParam(r, "type")

	rows, err := h.db.Query(r.Context(), `
		SELECT id, content_type, name, description, recipe, creator_name, times_used
		FROM content_creations
		WHERE content_type = $1 AND status = 'approved' AND is_active = true
	`, cType)
	if err != nil {
		render.Status(r, http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	creations, err := pgx.CollectRows(rows, pgx.RowToStructByName[ContentCreation])
	render.JSON(w, r, creations)
}

// GET /api/game/content/random/{type}
func (h *Handler) GetRandomContent(w http.ResponseWriter, r *http.Request) {
	cType := chi.URLParam(r, "type")

	// If role was passed (e.g. for sprites)
	// role := r.URL.Query().Get("role")

	var creation ContentCreation
	err := h.db.QueryRow(r.Context(), `
		UPDATE content_creations
		SET times_used = times_used + 1, last_used_at = NOW()
		WHERE id = (
			SELECT id FROM content_creations
			WHERE content_type = $1 AND status = 'approved' AND is_active = true
			ORDER BY RANDOM()
			LIMIT 1
		)
		RETURNING id, content_type, name, description, recipe, creator_name
	`, cType).Scan(&creation.ID, &creation.ContentType, &creation.Name, &creation.Description, &creation.Recipe, &creation.CreatorName)

	if err != nil {
		if err == pgx.ErrNoRows {
			render.Status(r, http.StatusNotFound)
			render.JSON(w, r, map[string]string{"error": "No content found"})
			return
		}
		render.Status(r, http.StatusInternalServerError)
		return
	}

	render.JSON(w, r, creation)
}

// DELETE /api/creator/creations/{id}
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, map[string]string{"error": "ID required"})
		return
	}

	result, err := h.db.Exec(r.Context(), `
		DELETE FROM content_creations WHERE id = $1
	`, id)

	if err != nil {
		log.Printf("Error deleting creation: %v", err)
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, map[string]string{"error": "Error deleting"})
		return
	}

	if result.RowsAffected() == 0 {
		render.Status(r, http.StatusNotFound)
		render.JSON(w, r, map[string]string{"error": "Not found"})
		return
	}

	render.Status(r, http.StatusOK)
	render.JSON(w, r, map[string]string{"status": "deleted"})
}

// AgentOptionCategory represents a category of agent options
type AgentOptionCategory struct {
	ID          string        `json:"id"`
	Name        string        `json:"name"`
	Description string        `json:"description"`
	Icon        string        `json:"icon"`
	SortOrder   int           `json:"sort_order"`
	Options     []AgentOption `json:"options"`
}

// AgentOption represents a single agent configuration option
type AgentOption struct {
	ID           string          `json:"id"`
	CategoryID   string          `json:"category_id"`
	Key          string          `json:"key"`
	Label        string          `json:"label"`
	Description  string          `json:"description"`
	Icon         string          `json:"icon"`
	ValueType    string          `json:"value_type"`
	MinValue     *int            `json:"min_value,omitempty"`
	MaxValue     *int            `json:"max_value,omitempty"`
	DefaultValue *string         `json:"default_value,omitempty"`
	SortOrder    int             `json:"sort_order"`
	Metadata     json.RawMessage `json:"metadata"`
}

// GET /api/creator/agent-options
func (h *Handler) GetAgentOptions(w http.ResponseWriter, r *http.Request) {
	// First, get all categories
	catRows, err := h.db.Query(r.Context(), `
		SELECT id, name, COALESCE(description, '') as description,
		       COALESCE(icon, '') as icon, sort_order
		FROM agent_option_categories
		WHERE is_active = true
		ORDER BY sort_order
	`)
	if err != nil {
		log.Printf("Error fetching categories: %v", err)
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, map[string]string{"error": "Database error"})
		return
	}
	defer catRows.Close()

	categories := make(map[string]*AgentOptionCategory)
	var orderedCategories []*AgentOptionCategory

	for catRows.Next() {
		var cat AgentOptionCategory
		if err := catRows.Scan(&cat.ID, &cat.Name, &cat.Description, &cat.Icon, &cat.SortOrder); err != nil {
			log.Printf("Error scanning category: %v", err)
			continue
		}
		cat.Options = []AgentOption{}
		categories[cat.ID] = &cat
		orderedCategories = append(orderedCategories, &cat)
	}

	// Now get all options
	optRows, err := h.db.Query(r.Context(), `
		SELECT id, category_id, key, label,
		       COALESCE(description, '') as description,
		       COALESCE(icon, '') as icon,
		       value_type, min_value, max_value, default_value,
		       sort_order, COALESCE(metadata, '{}')::text as metadata
		FROM agent_config_options
		WHERE is_active = true
		ORDER BY sort_order
	`)
	if err != nil {
		log.Printf("Error fetching options: %v", err)
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, map[string]string{"error": "Database error"})
		return
	}
	defer optRows.Close()

	for optRows.Next() {
		var opt AgentOption
		var metadataStr string
		if err := optRows.Scan(
			&opt.ID, &opt.CategoryID, &opt.Key, &opt.Label,
			&opt.Description, &opt.Icon, &opt.ValueType,
			&opt.MinValue, &opt.MaxValue, &opt.DefaultValue,
			&opt.SortOrder, &metadataStr,
		); err != nil {
			log.Printf("Error scanning option: %v", err)
			continue
		}
		opt.Metadata = json.RawMessage(metadataStr)

		if cat, exists := categories[opt.CategoryID]; exists {
			cat.Options = append(cat.Options, opt)
		}
	}

	render.JSON(w, r, orderedCategories)
}
