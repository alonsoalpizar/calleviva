package parameters

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/alonsoalpizar/calleviva/backend/internal/database"
	"github.com/alonsoalpizar/calleviva/backend/internal/models"
	"github.com/go-chi/chi/v5"
)

// GET /api/v1/parameters - List all parameters (optionally filtered by category)
func HandleList(w http.ResponseWriter, r *http.Request) {
	category := r.URL.Query().Get("category")
	activeOnly := r.URL.Query().Get("active") != "false"

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var rows interface{}
	var err error

	query := `
		SELECT id, category, code, name, description, icon, config, sort_order, is_active, created_at, updated_at
		FROM parameters
		WHERE ($1 = '' OR category = $1)
		AND ($2 = false OR is_active = true)
		ORDER BY category, sort_order, name
	`

	dbRows, err := database.Pool.Query(ctx, query, category, activeOnly)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to fetch parameters")
		return
	}
	defer dbRows.Close()

	var parameters []models.Parameter
	for dbRows.Next() {
		var p models.Parameter
		err := dbRows.Scan(
			&p.ID, &p.Category, &p.Code, &p.Name, &p.Description,
			&p.Icon, &p.Config, &p.SortOrder, &p.IsActive,
			&p.CreatedAt, &p.UpdatedAt,
		)
		if err != nil {
			respondError(w, http.StatusInternalServerError, "Failed to scan parameter")
			return
		}
		parameters = append(parameters, p)
	}

	if parameters == nil {
		parameters = []models.Parameter{}
	}

	_ = rows // suppress unused variable warning
	respondJSON(w, http.StatusOK, models.ParameterListResponse{
		Parameters: parameters,
		Total:      len(parameters),
	})
}

// GET /api/v1/parameters/categories - List all categories
func HandleListCategories(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := database.Pool.Query(ctx, `
		SELECT DISTINCT category FROM parameters ORDER BY category
	`)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to fetch categories")
		return
	}
	defer rows.Close()

	var categories []string
	for rows.Next() {
		var cat string
		if err := rows.Scan(&cat); err != nil {
			respondError(w, http.StatusInternalServerError, "Failed to scan category")
			return
		}
		categories = append(categories, cat)
	}

	if categories == nil {
		categories = []string{}
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"categories": categories,
	})
}

// GET /api/v1/parameters/{id} - Get single parameter
func HandleGet(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var p models.Parameter
	err := database.Pool.QueryRow(ctx, `
		SELECT id, category, code, name, description, icon, config, sort_order, is_active, created_at, updated_at
		FROM parameters
		WHERE id = $1
	`, id).Scan(
		&p.ID, &p.Category, &p.Code, &p.Name, &p.Description,
		&p.Icon, &p.Config, &p.SortOrder, &p.IsActive,
		&p.CreatedAt, &p.UpdatedAt,
	)

	if err != nil {
		respondError(w, http.StatusNotFound, "Parameter not found")
		return
	}

	respondJSON(w, http.StatusOK, p)
}

// POST /api/v1/parameters - Create parameter
func HandleCreate(w http.ResponseWriter, r *http.Request) {
	var req models.CreateParameterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Category == "" || req.Code == "" || req.Name == "" {
		respondError(w, http.StatusBadRequest, "Category, code and name are required")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	config := req.Config
	if config == nil {
		config = json.RawMessage("{}")
	}

	var p models.Parameter
	err := database.Pool.QueryRow(ctx, `
		INSERT INTO parameters (category, code, name, description, icon, config, sort_order, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, category, code, name, description, icon, config, sort_order, is_active, created_at, updated_at
	`, req.Category, req.Code, req.Name, nilIfEmpty(req.Description), nilIfEmpty(req.Icon), config, req.SortOrder, isActive).Scan(
		&p.ID, &p.Category, &p.Code, &p.Name, &p.Description,
		&p.Icon, &p.Config, &p.SortOrder, &p.IsActive,
		&p.CreatedAt, &p.UpdatedAt,
	)

	if err != nil {
		if isDuplicateError(err) {
			respondError(w, http.StatusConflict, "Parameter with this category and code already exists")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to create parameter")
		return
	}

	respondJSON(w, http.StatusCreated, p)
}

// PATCH /api/v1/parameters/{id} - Update parameter
func HandleUpdate(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var req models.UpdateParameterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	// Verificar que existe
	var exists bool
	err := database.Pool.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM parameters WHERE id = $1)", id).Scan(&exists)
	if err != nil || !exists {
		respondError(w, http.StatusNotFound, "Parameter not found")
		return
	}

	// Construir query dinámico
	query := "UPDATE parameters SET "
	args := []interface{}{}
	argNum := 1

	if req.Name != nil {
		query += "name = $" + string(rune('0'+argNum)) + ", "
		args = append(args, *req.Name)
		argNum++
	}
	if req.Description != nil {
		query += "description = $" + string(rune('0'+argNum)) + ", "
		args = append(args, *req.Description)
		argNum++
	}
	if req.Icon != nil {
		query += "icon = $" + string(rune('0'+argNum)) + ", "
		args = append(args, *req.Icon)
		argNum++
	}
	if req.Config != nil {
		query += "config = $" + string(rune('0'+argNum)) + ", "
		args = append(args, req.Config)
		argNum++
	}
	if req.SortOrder != nil {
		query += "sort_order = $" + string(rune('0'+argNum)) + ", "
		args = append(args, *req.SortOrder)
		argNum++
	}
	if req.IsActive != nil {
		query += "is_active = $" + string(rune('0'+argNum)) + ", "
		args = append(args, *req.IsActive)
		argNum++
	}

	if len(args) == 0 {
		respondError(w, http.StatusBadRequest, "No fields to update")
		return
	}

	// Remover última coma y agregar WHERE
	query = query[:len(query)-2] + " WHERE id = $" + string(rune('0'+argNum)) + " RETURNING id, category, code, name, description, icon, config, sort_order, is_active, created_at, updated_at"
	args = append(args, id)

	var p models.Parameter
	err = database.Pool.QueryRow(ctx, query, args...).Scan(
		&p.ID, &p.Category, &p.Code, &p.Name, &p.Description,
		&p.Icon, &p.Config, &p.SortOrder, &p.IsActive,
		&p.CreatedAt, &p.UpdatedAt,
	)

	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to update parameter")
		return
	}

	respondJSON(w, http.StatusOK, p)
}

// DELETE /api/v1/parameters/{id} - Delete parameter
func HandleDelete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	result, err := database.Pool.Exec(ctx, "DELETE FROM parameters WHERE id = $1", id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to delete parameter")
		return
	}

	if result.RowsAffected() == 0 {
		respondError(w, http.StatusNotFound, "Parameter not found")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{
		"message": "Parameter deleted successfully",
	})
}

// Helper functions
func respondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func respondError(w http.ResponseWriter, status int, message string) {
	respondJSON(w, status, map[string]string{"error": message})
}

func nilIfEmpty(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

func isDuplicateError(err error) bool {
	return err != nil && (contains(err.Error(), "duplicate key") || contains(err.Error(), "unique constraint"))
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || len(s) > 0 && containsHelper(s, substr))
}

func containsHelper(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
