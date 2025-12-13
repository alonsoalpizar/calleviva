package players

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/alonsoalpizar/calleviva/backend/internal/database"
	"github.com/go-chi/chi/v5"
)

// Player response struct
type Player struct {
	ID          string    `json:"id"`
	Email       string    `json:"email"`
	DisplayName *string   `json:"display_name,omitempty"`
	AvatarURL   *string   `json:"avatar_url,omitempty"`
	IsAdmin     bool      `json:"is_admin"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type PlayersResponse struct {
	Players []Player `json:"players"`
	Total   int      `json:"total"`
}

type UpdatePlayerRequest struct {
	DisplayName *string `json:"display_name,omitempty"`
	IsAdmin     *bool   `json:"is_admin,omitempty"`
}

// GET /api/v1/admin/players - List all players
func HandleList(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := database.Pool.Query(ctx, `
		SELECT id, email, display_name, avatar_url, is_admin, created_at, updated_at
		FROM players
		WHERE deleted_at IS NULL
		ORDER BY created_at DESC
	`)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to fetch players")
		return
	}
	defer rows.Close()

	var players []Player
	for rows.Next() {
		var p Player
		err := rows.Scan(
			&p.ID, &p.Email, &p.DisplayName,
			&p.AvatarURL, &p.IsAdmin, &p.CreatedAt, &p.UpdatedAt,
		)
		if err != nil {
			respondError(w, http.StatusInternalServerError, "Failed to scan player")
			return
		}
		players = append(players, p)
	}

	if players == nil {
		players = []Player{}
	}

	respondJSON(w, http.StatusOK, PlayersResponse{
		Players: players,
		Total:   len(players),
	})
}

// GET /api/v1/admin/players/{id} - Get single player
func HandleGet(w http.ResponseWriter, r *http.Request) {
	playerID := chi.URLParam(r, "id")

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var player Player
	err := database.Pool.QueryRow(ctx, `
		SELECT id, email, display_name, avatar_url, is_admin, created_at, updated_at
		FROM players
		WHERE id = $1 AND deleted_at IS NULL
	`, playerID).Scan(
		&player.ID, &player.Email, &player.DisplayName,
		&player.AvatarURL, &player.IsAdmin, &player.CreatedAt, &player.UpdatedAt,
	)

	if err != nil {
		respondError(w, http.StatusNotFound, "Player not found")
		return
	}

	respondJSON(w, http.StatusOK, player)
}

// PATCH /api/v1/admin/players/{id} - Update player (admin status, display name)
func HandleUpdate(w http.ResponseWriter, r *http.Request) {
	playerID := chi.URLParam(r, "id")

	var req UpdatePlayerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	// Build dynamic update query
	query := "UPDATE players SET updated_at = NOW()"
	args := []interface{}{}
	argNum := 1

	if req.DisplayName != nil {
		query += ", display_name = $" + itoa(argNum)
		args = append(args, *req.DisplayName)
		argNum++
	}
	if req.IsAdmin != nil {
		query += ", is_admin = $" + itoa(argNum)
		args = append(args, *req.IsAdmin)
		argNum++
	}

	if len(args) == 0 {
		respondError(w, http.StatusBadRequest, "No fields to update")
		return
	}

	query += " WHERE id = $" + itoa(argNum) + " AND deleted_at IS NULL" +
		" RETURNING id, email, display_name, avatar_url, is_admin, created_at, updated_at"
	args = append(args, playerID)

	var player Player
	err := database.Pool.QueryRow(ctx, query, args...).Scan(
		&player.ID, &player.Email, &player.DisplayName,
		&player.AvatarURL, &player.IsAdmin, &player.CreatedAt, &player.UpdatedAt,
	)

	if err != nil {
		respondError(w, http.StatusNotFound, "Player not found")
		return
	}

	respondJSON(w, http.StatusOK, player)
}

// DELETE /api/v1/admin/players/{id} - Soft delete player
func HandleDelete(w http.ResponseWriter, r *http.Request) {
	playerID := chi.URLParam(r, "id")

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	result, err := database.Pool.Exec(ctx, `
		UPDATE players SET deleted_at = NOW()
		WHERE id = $1 AND deleted_at IS NULL
	`, playerID)

	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to delete player")
		return
	}

	if result.RowsAffected() == 0 {
		respondError(w, http.StatusNotFound, "Player not found")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{
		"message": "Player deleted successfully",
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
	return string(rune('0' + i))
}
