package games

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/alonsoalpizar/calleviva/backend/internal/auth"
	"github.com/alonsoalpizar/calleviva/backend/internal/database"
	"github.com/alonsoalpizar/calleviva/backend/internal/models"
	"github.com/go-chi/chi/v5"
)

// POST /api/v1/games - Create new game
func HandleCreate(w http.ResponseWriter, r *http.Request) {
	claims, err := auth.GetClaimsFromContext(r.Context())
	if err != nil {
		respondError(w, http.StatusUnauthorized, "Authentication required")
		return
	}

	var req models.CreateGameRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Default world type
	if req.WorldType == "" {
		req.WorldType = "costa_rica"
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	// Get starting money from parameters
	var startingMoney int64 = 15000 // default
	err = database.Pool.QueryRow(ctx, `
		SELECT (config->>'starting_money')::bigint
		FROM parameters
		WHERE category = 'countries' AND code = $1 AND is_active = true
	`, req.WorldType).Scan(&startingMoney)
	// Ignore error, use default

	var game models.GameSession
	var name *string
	if req.Name != "" {
		name = &req.Name
	}

	err = database.Pool.QueryRow(ctx, `
		INSERT INTO game_sessions (player_id, world_type, name, money)
		VALUES ($1, $2, $3, $4)
		RETURNING id, player_id, world_type, name, game_day, money, reputation,
		          current_location, weather, status, stats, created_at, updated_at
	`, claims.PlayerID, req.WorldType, name, startingMoney).Scan(
		&game.ID, &game.PlayerID, &game.WorldType, &game.Name,
		&game.GameDay, &game.Money, &game.Reputation,
		&game.CurrentLocation, &game.Weather, &game.Status,
		&game.Stats, &game.CreatedAt, &game.UpdatedAt,
	)

	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to create game")
		return
	}

	respondJSON(w, http.StatusCreated, game)
}

// GET /api/v1/games - List player's games
func HandleList(w http.ResponseWriter, r *http.Request) {
	claims, err := auth.GetClaimsFromContext(r.Context())
	if err != nil {
		respondError(w, http.StatusUnauthorized, "Authentication required")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := database.Pool.Query(ctx, `
		SELECT id, player_id, world_type, name, game_day, money, reputation,
		       current_location, weather, status, stats, created_at, updated_at
		FROM game_sessions
		WHERE player_id = $1 AND deleted_at IS NULL
		ORDER BY updated_at DESC
	`, claims.PlayerID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to fetch games")
		return
	}
	defer rows.Close()

	var games []models.GameSession
	for rows.Next() {
		var g models.GameSession
		err := rows.Scan(
			&g.ID, &g.PlayerID, &g.WorldType, &g.Name,
			&g.GameDay, &g.Money, &g.Reputation,
			&g.CurrentLocation, &g.Weather, &g.Status,
			&g.Stats, &g.CreatedAt, &g.UpdatedAt,
		)
		if err != nil {
			respondError(w, http.StatusInternalServerError, "Failed to scan game")
			return
		}
		games = append(games, g)
	}

	if games == nil {
		games = []models.GameSession{}
	}

	respondJSON(w, http.StatusOK, models.GameListResponse{
		Games: games,
		Total: len(games),
	})
}

// GET /api/v1/games/{gameID} - Get single game
func HandleGet(w http.ResponseWriter, r *http.Request) {
	claims, err := auth.GetClaimsFromContext(r.Context())
	if err != nil {
		respondError(w, http.StatusUnauthorized, "Authentication required")
		return
	}

	gameID := chi.URLParam(r, "gameID")

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var game models.GameSession
	err = database.Pool.QueryRow(ctx, `
		SELECT id, player_id, world_type, name, game_day, money, reputation,
		       current_location, weather, status, stats, created_at, updated_at
		FROM game_sessions
		WHERE id = $1 AND player_id = $2 AND deleted_at IS NULL
	`, gameID, claims.PlayerID).Scan(
		&game.ID, &game.PlayerID, &game.WorldType, &game.Name,
		&game.GameDay, &game.Money, &game.Reputation,
		&game.CurrentLocation, &game.Weather, &game.Status,
		&game.Stats, &game.CreatedAt, &game.UpdatedAt,
	)

	if err != nil {
		respondError(w, http.StatusNotFound, "Game not found")
		return
	}

	respondJSON(w, http.StatusOK, game)
}

// PATCH /api/v1/games/{gameID} - Update game (save progress)
func HandleUpdate(w http.ResponseWriter, r *http.Request) {
	claims, err := auth.GetClaimsFromContext(r.Context())
	if err != nil {
		respondError(w, http.StatusUnauthorized, "Authentication required")
		return
	}

	gameID := chi.URLParam(r, "gameID")

	var req models.UpdateGameRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	// Verify ownership
	var exists bool
	err = database.Pool.QueryRow(ctx, `
		SELECT EXISTS(SELECT 1 FROM game_sessions WHERE id = $1 AND player_id = $2 AND deleted_at IS NULL)
	`, gameID, claims.PlayerID).Scan(&exists)
	if err != nil || !exists {
		respondError(w, http.StatusNotFound, "Game not found")
		return
	}

	// Build dynamic update
	query := "UPDATE game_sessions SET "
	args := []interface{}{}
	argNum := 1

	if req.Name != nil {
		query += "name = $" + itoa(argNum) + ", "
		args = append(args, *req.Name)
		argNum++
	}
	if req.GameDay != nil {
		query += "game_day = $" + itoa(argNum) + ", "
		args = append(args, *req.GameDay)
		argNum++
	}
	if req.Money != nil {
		query += "money = $" + itoa(argNum) + ", "
		args = append(args, *req.Money)
		argNum++
	}
	if req.Reputation != nil {
		query += "reputation = $" + itoa(argNum) + ", "
		args = append(args, *req.Reputation)
		argNum++
	}
	if req.CurrentLocation != nil {
		query += "current_location = $" + itoa(argNum) + ", "
		args = append(args, *req.CurrentLocation)
		argNum++
	}
	if req.Weather != nil {
		query += "weather = $" + itoa(argNum) + ", "
		args = append(args, *req.Weather)
		argNum++
	}
	if req.Status != nil {
		query += "status = $" + itoa(argNum) + ", "
		args = append(args, *req.Status)
		argNum++
	}
	if req.Stats != nil {
		query += "stats = $" + itoa(argNum) + ", "
		args = append(args, req.Stats)
		argNum++
	}

	if len(args) == 0 {
		respondError(w, http.StatusBadRequest, "No fields to update")
		return
	}

	// Remove last comma and add WHERE clause
	query = query[:len(query)-2] + " WHERE id = $" + itoa(argNum) + " AND player_id = $" + itoa(argNum+1) +
		" RETURNING id, player_id, world_type, name, game_day, money, reputation, current_location, weather, status, stats, created_at, updated_at"
	args = append(args, gameID, claims.PlayerID)

	var game models.GameSession
	err = database.Pool.QueryRow(ctx, query, args...).Scan(
		&game.ID, &game.PlayerID, &game.WorldType, &game.Name,
		&game.GameDay, &game.Money, &game.Reputation,
		&game.CurrentLocation, &game.Weather, &game.Status,
		&game.Stats, &game.CreatedAt, &game.UpdatedAt,
	)

	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to update game")
		return
	}

	respondJSON(w, http.StatusOK, game)
}

// DELETE /api/v1/games/{gameID} - Delete game (soft delete)
func HandleDelete(w http.ResponseWriter, r *http.Request) {
	claims, err := auth.GetClaimsFromContext(r.Context())
	if err != nil {
		respondError(w, http.StatusUnauthorized, "Authentication required")
		return
	}

	gameID := chi.URLParam(r, "gameID")

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	result, err := database.Pool.Exec(ctx, `
		UPDATE game_sessions SET deleted_at = NOW()
		WHERE id = $1 AND player_id = $2 AND deleted_at IS NULL
	`, gameID, claims.PlayerID)

	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to delete game")
		return
	}

	if result.RowsAffected() == 0 {
		respondError(w, http.StatusNotFound, "Game not found")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{
		"message": "Game deleted successfully",
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
