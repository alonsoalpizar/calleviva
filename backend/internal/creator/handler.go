package creator

import (
	"context"
	"encoding/json"
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

func (h *Handler) SetupRoutes(r chi.Router) {
	// Public Creator Routes (mounted under /api/v1 in main.go)
	r.Route("/creator", func(r chi.Router) {
		r.Post("/submit", h.Submit)
		r.Get("/my-creations", h.MyCreations)
	})

	// Admin Routes
	r.Route("/admin/creator", func(r chi.Router) {
		r.Get("/pending", h.GetPending)
		r.Get("/all", h.GetAll)
		r.Put("/{id}/review", h.Review)
	})

	// Game Routes
	r.Route("/game/content", func(r chi.Router) {
		r.Get("/{type}", h.GetApprovedContent)
		r.Get("/random/{type}", h.GetRandomContent)
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

	var id string
	err := h.db.QueryRow(r.Context(), `
		INSERT INTO content_creations (content_type, name, description, recipe, creator_name, status)
		VALUES ($1, $2, $3, $4, $5, 'pending')
		RETURNING id
	`, input.ContentType, input.Name, input.Description, input.Recipe, input.CreatorName).Scan(&id)

	if err != nil {
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
		SELECT id, content_type, name, description, recipe, creator_name, created_at, status
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

	// Basic query builder (simple enough for this scope)
	query := `SELECT id, content_type, name, description, recipe, creator_name, created_at, status 
			  FROM content_creations WHERE is_active = true`
	var args []interface{}
	idx := 1

	if status != "" {
		query += ` AND status = $` + string(rune(idx+'0'))
		args = append(args, status)
		idx++
	}
	if cType != "" {
		query += ` AND content_type = $` + string(rune(idx+'0')) // Should be careful with this cast, but ok for valid inputs
		// Actually, let's fix the idx logic manually for readability later
		// For now implementing simpler:
	}
	// Let's restart args logic
	args = []interface{}{}
	query = `SELECT id, content_type, name, description, recipe, creator_name, created_at, status 
			 FROM content_creations WHERE is_active = true`

	if status != "" {
		args = append(args, status)
		query += ` AND status = $` + jsonNumber(len(args))
	}
	if cType != "" {
		args = append(args, cType)
		query += ` AND content_type = $` + jsonNumber(len(args))
	}

	query += ` ORDER BY created_at DESC`

	rows, err := h.db.Query(r.Context(), query, args...)
	if err != nil {
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, map[string]string{"error": "Database error"})
		return
	}
	defer rows.Close()

	creations, err := pgx.CollectRows(rows, pgx.RowToStructByName[ContentCreation])
	if err != nil {
		// Just return empty if fail, or handle better
		render.JSON(w, r, []ContentCreation{})
		return
	}

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
