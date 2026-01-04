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

// Columnas base para SELECT
const scenarioColumns = `id, code, name, description, world_type, zone_id, scene_data, version,
	is_active, status, creator_name, reviewed_by, reviewed_at, review_notes,
	times_used, last_used_at, created_at, updated_at`

// scanScenario escanea una fila en un Scenario
func scanScenario(row pgx.Row) (Scenario, error) {
	var s Scenario
	err := row.Scan(
		&s.ID, &s.Code, &s.Name, &s.Description, &s.WorldType, &s.ZoneID,
		&s.SceneData, &s.Version, &s.IsActive, &s.Status, &s.CreatorName,
		&s.ReviewedBy, &s.ReviewedAt, &s.ReviewNotes, &s.TimesUsed, &s.LastUsedAt,
		&s.CreatedAt, &s.UpdatedAt,
	)
	return s, err
}

// GET /api/v1/scenarios - Listar escenarios con filtros
func HandleList(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	// Filtros opcionales
	status := r.URL.Query().Get("status")       // pending, approved, rejected
	zoneID := r.URL.Query().Get("zone_id")      // playa, comercial, etc.
	worldType := r.URL.Query().Get("world_type")
	onlyApproved := r.URL.Query().Get("approved") == "true" // Para gameplay: solo aprobados

	// Construir query con filtros
	query := "SELECT " + scenarioColumns + " FROM scenarios WHERE is_active = true"
	args := []interface{}{}
	argNum := 1

	if onlyApproved {
		query += " AND status = 'approved'"
	} else if status != "" {
		query += " AND status = $" + itoa(argNum)
		args = append(args, status)
		argNum++
	}

	if zoneID != "" {
		query += " AND zone_id = $" + itoa(argNum)
		args = append(args, zoneID)
		argNum++
	}

	if worldType != "" {
		query += " AND world_type = $" + itoa(argNum)
		args = append(args, worldType)
		argNum++
	}

	query += " ORDER BY created_at DESC"

	rows, err := database.Pool.Query(ctx, query, args...)
	if err != nil {
		log.Printf("Error fetching scenarios: %v", err)
		respondError(w, http.StatusInternalServerError, "Failed to fetch scenarios")
		return
	}
	defer rows.Close()

	var scenarios []Scenario
	for rows.Next() {
		var s Scenario
		err := rows.Scan(
			&s.ID, &s.Code, &s.Name, &s.Description, &s.WorldType, &s.ZoneID,
			&s.SceneData, &s.Version, &s.IsActive, &s.Status, &s.CreatorName,
			&s.ReviewedBy, &s.ReviewedAt, &s.ReviewNotes, &s.TimesUsed, &s.LastUsedAt,
			&s.CreatedAt, &s.UpdatedAt,
		)
		if err != nil {
			log.Printf("Error scanning scenario: %v", err)
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

	query := "SELECT " + scenarioColumns + " FROM scenarios WHERE code = $1 AND is_active = true"
	s, err := scanScenario(database.Pool.QueryRow(ctx, query, code))

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

	// Creator name default
	creatorName := "admin"
	if req.CreatorName != nil && *req.CreatorName != "" {
		creatorName = *req.CreatorName
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	query := `
		INSERT INTO scenarios (code, name, description, world_type, zone_id, scene_data, creator_name, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
		RETURNING ` + scenarioColumns

	s, err := scanScenario(database.Pool.QueryRow(ctx, query,
		req.Code, req.Name, req.Description, req.WorldType, req.ZoneID, req.Scene, creatorName))

	if err != nil {
		log.Printf("Error creating scenario: %v", err)
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
	if req.ZoneID != nil {
		query += ", zone_id = $" + itoa(argNum)
		args = append(args, *req.ZoneID)
		argNum++
	}
	if len(req.Scene) > 0 {
		query += ", scene_data = $" + itoa(argNum)
		args = append(args, req.Scene)
		argNum++
	}

	query += " WHERE code = $" + itoa(argNum) + " AND is_active = true RETURNING " + scenarioColumns
	args = append(args, code)

	s, err := scanScenario(database.Pool.QueryRow(ctx, query, args...))
	if err != nil {
		log.Printf("Error updating scenario: %v", err)
		respondError(w, http.StatusInternalServerError, "Failed to update scenario")
		return
	}

	respondJSON(w, http.StatusOK, s)
}

// POST /api/v1/scenarios/{code}/review - Aprobar/Rechazar escenario (admin only)
func HandleReview(w http.ResponseWriter, r *http.Request) {
	code := chi.URLParam(r, "code")

	var req ReviewScenarioRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validar status
	if req.Status != "approved" && req.Status != "rejected" {
		respondError(w, http.StatusBadRequest, "Status must be 'approved' or 'rejected'")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	// TODO: Obtener reviewer ID del JWT cuando tengamos auth
	// Por ahora usamos NULL

	query := `
		UPDATE scenarios
		SET status = $1, review_notes = $2, reviewed_at = NOW()
		WHERE code = $3 AND is_active = true
		RETURNING ` + scenarioColumns

	s, err := scanScenario(database.Pool.QueryRow(ctx, query, req.Status, req.ReviewNotes, code))
	if err != nil {
		if err == pgx.ErrNoRows {
			respondError(w, http.StatusNotFound, "Scenario not found")
			return
		}
		log.Printf("Error reviewing scenario: %v", err)
		respondError(w, http.StatusInternalServerError, "Failed to review scenario")
		return
	}

	respondJSON(w, http.StatusOK, s)
}

// POST /api/v1/scenarios/{code}/use - Incrementar contador de uso
func HandleUse(w http.ResponseWriter, r *http.Request) {
	code := chi.URLParam(r, "code")

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	query := `
		UPDATE scenarios
		SET times_used = times_used + 1, last_used_at = NOW()
		WHERE code = $1 AND is_active = true AND status = 'approved'
		RETURNING ` + scenarioColumns

	s, err := scanScenario(database.Pool.QueryRow(ctx, query, code))
	if err != nil {
		if err == pgx.ErrNoRows {
			respondError(w, http.StatusNotFound, "Scenario not found or not approved")
			return
		}
		log.Printf("Error updating scenario usage: %v", err)
		respondError(w, http.StatusInternalServerError, "Failed to update usage")
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
