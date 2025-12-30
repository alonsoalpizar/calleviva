package scenarios

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/alonsoalpizar/calleviva/backend/internal/database"
	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
)

// GET /api/v1/scenarios - Listar todos los escenarios activos
func HandleList(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	// Filtro opcional por world_type
	worldType := r.URL.Query().Get("world_type")

	var rows pgx.Rows
	var err error

	if worldType != "" {
		rows, err = database.Pool.Query(ctx, `
			SELECT id, code, name, description, world_type, scene_data, version, is_active, created_at, updated_at
			FROM scenarios
			WHERE is_active = true AND world_type = $1
			ORDER BY name ASC
		`, worldType)
	} else {
		rows, err = database.Pool.Query(ctx, `
			SELECT id, code, name, description, world_type, scene_data, version, is_active, created_at, updated_at
			FROM scenarios
			WHERE is_active = true
			ORDER BY name ASC
		`)
	}

	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to fetch scenarios")
		return
	}
	defer rows.Close()

	var scenarios []Scenario
	for rows.Next() {
		var s Scenario
		err := rows.Scan(
			&s.ID, &s.Code, &s.Name, &s.Description, &s.WorldType,
			&s.SceneData, &s.Version, &s.IsActive, &s.CreatedAt, &s.UpdatedAt,
		)
		if err != nil {
			respondError(w, http.StatusInternalServerError, "Failed to scan scenario")
			return
		}
		scenarios = append(scenarios, s)
	}

	if scenarios == nil {
		scenarios = []Scenario{}
	}

	respondJSON(w, http.StatusOK, ScenarioListResponse{
		Scenarios: scenarios,
		Total:     len(scenarios),
	})
}

// GET /api/v1/scenarios/{code} - Obtener escenario por código
func HandleGet(w http.ResponseWriter, r *http.Request) {
	code := chi.URLParam(r, "code")

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var s Scenario
	err := database.Pool.QueryRow(ctx, `
		SELECT id, code, name, description, world_type, scene_data, version, is_active, created_at, updated_at
		FROM scenarios
		WHERE code = $1 AND is_active = true
	`, code).Scan(
		&s.ID, &s.Code, &s.Name, &s.Description, &s.WorldType,
		&s.SceneData, &s.Version, &s.IsActive, &s.CreatedAt, &s.UpdatedAt,
	)

	if err != nil {
		respondError(w, http.StatusNotFound, "Scenario not found")
		return
	}

	respondJSON(w, http.StatusOK, s)
}

// POST /api/v1/scenarios - Crear nuevo escenario
func HandleCreate(w http.ResponseWriter, r *http.Request) {
	var req CreateScenarioRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validaciones
	if req.Code == "" {
		respondError(w, http.StatusBadRequest, "Code is required")
		return
	}
	if req.Name == "" {
		respondError(w, http.StatusBadRequest, "Name is required")
		return
	}
	if len(req.Scene) == 0 {
		respondError(w, http.StatusBadRequest, "Scene data is required")
		return
	}
	if req.WorldType == "" {
		req.WorldType = "costa_rica"
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var s Scenario
	err := database.Pool.QueryRow(ctx, `
		INSERT INTO scenarios (code, name, description, world_type, scene_data)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, code, name, description, world_type, scene_data, version, is_active, created_at, updated_at
	`, req.Code, req.Name, req.Description, req.WorldType, req.Scene).Scan(
		&s.ID, &s.Code, &s.Name, &s.Description, &s.WorldType,
		&s.SceneData, &s.Version, &s.IsActive, &s.CreatedAt, &s.UpdatedAt,
	)

	if err != nil {
		log.Printf("Error creating scenario: %v", err)
		// Check for duplicate code
		if isDuplicateKeyError(err) {
			respondError(w, http.StatusConflict, "Scenario with this code already exists")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to create scenario")
		return
	}

	respondJSON(w, http.StatusCreated, s)
}

// PUT /api/v1/scenarios/{code} - Actualizar escenario existente
func HandleUpdate(w http.ResponseWriter, r *http.Request) {
	code := chi.URLParam(r, "code")

	var req UpdateScenarioRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	// Verificar que existe
	var exists bool
	err := database.Pool.QueryRow(ctx, `
		SELECT EXISTS(SELECT 1 FROM scenarios WHERE code = $1 AND is_active = true)
	`, code).Scan(&exists)
	if err != nil || !exists {
		respondError(w, http.StatusNotFound, "Scenario not found")
		return
	}

	// Construir update dinámico
	query := "UPDATE scenarios SET version = version + 1"
	args := []interface{}{}
	argNum := 1

	if req.Name != nil {
		query += ", name = $" + itoa(argNum)
		args = append(args, *req.Name)
		argNum++
	}
	if req.Description != nil {
		query += ", description = $" + itoa(argNum)
		args = append(args, *req.Description)
		argNum++
	}
	if req.WorldType != nil {
		query += ", world_type = $" + itoa(argNum)
		args = append(args, *req.WorldType)
		argNum++
	}
	if len(req.Scene) > 0 {
		query += ", scene_data = $" + itoa(argNum)
		args = append(args, req.Scene)
		argNum++
	}

	query += " WHERE code = $" + itoa(argNum) + " AND is_active = true" +
		" RETURNING id, code, name, description, world_type, scene_data, version, is_active, created_at, updated_at"
	args = append(args, code)

	var s Scenario
	err = database.Pool.QueryRow(ctx, query, args...).Scan(
		&s.ID, &s.Code, &s.Name, &s.Description, &s.WorldType,
		&s.SceneData, &s.Version, &s.IsActive, &s.CreatedAt, &s.UpdatedAt,
	)

	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to update scenario")
		return
	}

	respondJSON(w, http.StatusOK, s)
}

// DELETE /api/v1/scenarios/{code} - Eliminar escenario (soft delete)
func HandleDelete(w http.ResponseWriter, r *http.Request) {
	code := chi.URLParam(r, "code")

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	result, err := database.Pool.Exec(ctx, `
		UPDATE scenarios SET is_active = false
		WHERE code = $1 AND is_active = true
	`, code)

	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to delete scenario")
		return
	}

	if result.RowsAffected() == 0 {
		respondError(w, http.StatusNotFound, "Scenario not found")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{
		"message": "Scenario deleted successfully",
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

func itoa(i int) string {
	if i < 10 {
		return string(rune('0' + i))
	}
	return itoa(i/10) + string(rune('0'+i%10))
}

func isDuplicateKeyError(err error) bool {
	return err != nil && (contains(err.Error(), "duplicate key") || contains(err.Error(), "unique constraint"))
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || len(s) > 0 && containsAt(s, substr, 0))
}

func containsAt(s, substr string, start int) bool {
	for i := start; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
