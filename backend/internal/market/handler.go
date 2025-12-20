package market

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/alonsoalpizar/calleviva/backend/internal/auth"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Handler struct {
	db *pgxpool.Pool
}

func NewHandler(db *pgxpool.Pool) *Handler {
	return &Handler{db: db}
}

// SetupRoutes mounts market routes (requires auth)
func (h *Handler) SetupRoutes(r chi.Router) {
	r.Route("/market", func(r chi.Router) {
		r.Get("/catalog", h.GetCatalog)
		r.Get("/inventory", h.GetInventory)
		r.Post("/buy", h.BuyIngredient)
	})
}

// GET /api/v1/games/{gameID}/market/catalog
// Returns all ingredients with owned status
func (h *Handler) GetCatalog(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	gameID, err := uuid.Parse(chi.URLParam(r, "gameID"))
	if err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, map[string]string{"error": "Invalid game ID"})
		return
	}

	claims, err := auth.GetClaimsFromContext(r.Context())
	if err != nil {
		render.Status(r, http.StatusUnauthorized)
		render.JSON(w, r, map[string]string{"error": "Unauthorized"})
		return
	}
	playerID, _ := uuid.Parse(claims.PlayerID)

	// Get player's current money
	var playerMoney int64
	err = h.db.QueryRow(ctx, `
		SELECT money FROM game_sessions
		WHERE id = $1 AND player_id = $2 AND status = 'active'
	`, gameID, playerID).Scan(&playerMoney)
	if err != nil {
		render.Status(r, http.StatusNotFound)
		render.JSON(w, r, map[string]string{"error": "Game not found"})
		return
	}

	// Get all ingredients with owned status
	rows, err := h.db.Query(ctx, `
		SELECT
			p.code,
			p.name,
			COALESCE(p.config->>'icon', '') as icon,
			COALESCE((p.config->>'cost')::int, 0) as cost,
			COALESCE(p.config->>'tier', 'common') as tier,
			COALESCE(p.config->>'type', '') as type,
			COALESCE(p.config->'tags', '[]'::jsonb) as tags,
			COALESCE(p.config->>'source', 'system') as source,
			CASE WHEN pi.id IS NOT NULL THEN true ELSE false END as owned
		FROM parameters p
		LEFT JOIN player_ingredients pi
			ON pi.ingredient_code = p.code
			AND pi.session_id = $1
			AND pi.player_id = $2
		WHERE p.category = 'ingredients_cr' AND p.is_active = true
		ORDER BY
			CASE p.config->>'tier'
				WHEN 'basic' THEN 1
				WHEN 'common' THEN 2
				WHEN 'premium' THEN 3
				WHEN 'special' THEN 4
				ELSE 5
			END,
			(p.config->>'cost')::int,
			p.name
	`, gameID, playerID)
	if err != nil {
		log.Printf("Error fetching catalog: %v", err)
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, map[string]string{"error": "Failed to fetch catalog"})
		return
	}
	defer rows.Close()

	var ingredients []MarketIngredient
	stats := CatalogStats{}

	for rows.Next() {
		var ing MarketIngredient
		var tagsJSON []byte

		err := rows.Scan(
			&ing.Code, &ing.Name, &ing.Icon, &ing.Cost,
			&ing.Tier, &ing.Type, &tagsJSON, &ing.Source, &ing.Owned,
		)
		if err != nil {
			log.Printf("Error scanning ingredient: %v", err)
			continue
		}

		// Parse tags
		if err := json.Unmarshal(tagsJSON, &ing.Tags); err != nil {
			ing.Tags = []string{}
		}

		ingredients = append(ingredients, ing)
		stats.TotalAvailable++

		if ing.Owned {
			stats.Owned++
			switch ing.Tier {
			case "basic":
				stats.BasicOwned++
			case "common":
				stats.CommonOwned++
			case "premium":
				stats.PremiumOwned++
			case "special":
				stats.SpecialOwned++
			}
		}
	}

	render.JSON(w, r, CatalogResponse{
		Ingredients: ingredients,
		PlayerMoney: playerMoney,
		Stats:       stats,
	})
}

// GET /api/v1/games/{gameID}/market/inventory
// Returns only ingredients the player owns
func (h *Handler) GetInventory(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	gameID, err := uuid.Parse(chi.URLParam(r, "gameID"))
	if err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, map[string]string{"error": "Invalid game ID"})
		return
	}

	claims, err := auth.GetClaimsFromContext(r.Context())
	if err != nil {
		render.Status(r, http.StatusUnauthorized)
		render.JSON(w, r, map[string]string{"error": "Unauthorized"})
		return
	}
	playerID, _ := uuid.Parse(claims.PlayerID)

	rows, err := h.db.Query(ctx, `
		SELECT
			p.code,
			p.name,
			COALESCE(p.config->>'icon', '') as icon,
			COALESCE((p.config->>'cost')::int, 0) as cost,
			COALESCE(p.config->>'tier', 'common') as tier,
			COALESCE(p.config->>'type', '') as type,
			COALESCE(p.config->'tags', '[]'::jsonb) as tags,
			COALESCE(p.config->>'source', 'system') as source
		FROM player_ingredients pi
		JOIN parameters p ON p.code = pi.ingredient_code AND p.category = 'ingredients_cr'
		WHERE pi.session_id = $1 AND pi.player_id = $2
		ORDER BY p.name
	`, gameID, playerID)
	if err != nil {
		log.Printf("Error fetching inventory: %v", err)
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, map[string]string{"error": "Failed to fetch inventory"})
		return
	}
	defer rows.Close()

	var ingredients []MarketIngredient
	for rows.Next() {
		var ing MarketIngredient
		var tagsJSON []byte

		err := rows.Scan(
			&ing.Code, &ing.Name, &ing.Icon, &ing.Cost,
			&ing.Tier, &ing.Type, &tagsJSON, &ing.Source,
		)
		if err != nil {
			continue
		}

		if err := json.Unmarshal(tagsJSON, &ing.Tags); err != nil {
			ing.Tags = []string{}
		}
		ing.Owned = true
		ingredients = append(ingredients, ing)
	}

	render.JSON(w, r, InventoryResponse{
		Ingredients: ingredients,
		Total:       len(ingredients),
	})
}

// POST /api/v1/games/{gameID}/market/buy
// Purchase an ingredient
func (h *Handler) BuyIngredient(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	gameID, err := uuid.Parse(chi.URLParam(r, "gameID"))
	if err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, map[string]string{"error": "Invalid game ID"})
		return
	}

	claims, err := auth.GetClaimsFromContext(r.Context())
	if err != nil {
		render.Status(r, http.StatusUnauthorized)
		render.JSON(w, r, map[string]string{"error": "Unauthorized"})
		return
	}
	playerID, _ := uuid.Parse(claims.PlayerID)

	var req BuyRequest
	if err := render.DecodeJSON(r.Body, &req); err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, map[string]string{"error": "Invalid request body"})
		return
	}

	if req.IngredientCode == "" {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, map[string]string{"error": "ingredient_code is required"})
		return
	}

	// Check if already owned
	var existingCount int
	h.db.QueryRow(ctx, `
		SELECT COUNT(*) FROM player_ingredients
		WHERE session_id = $1 AND player_id = $2 AND ingredient_code = $3
	`, gameID, playerID, req.IngredientCode).Scan(&existingCount)

	if existingCount > 0 {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, map[string]string{"error": "Ya tenés este ingrediente"})
		return
	}

	// Get ingredient cost
	var ingredientCost int
	var ingredientName string
	err = h.db.QueryRow(ctx, `
		SELECT COALESCE((config->>'cost')::int, 0), name
		FROM parameters
		WHERE category = 'ingredients_cr' AND code = $1 AND is_active = true
	`, req.IngredientCode).Scan(&ingredientCost, &ingredientName)

	if err != nil {
		render.Status(r, http.StatusNotFound)
		render.JSON(w, r, map[string]string{"error": "Ingrediente no encontrado"})
		return
	}

	// Get player money and check if enough
	var playerMoney int64
	err = h.db.QueryRow(ctx, `
		SELECT money FROM game_sessions
		WHERE id = $1 AND player_id = $2 AND status = 'active'
	`, gameID, playerID).Scan(&playerMoney)

	if err != nil {
		render.Status(r, http.StatusNotFound)
		render.JSON(w, r, map[string]string{"error": "Partida no encontrada"})
		return
	}

	if playerMoney < int64(ingredientCost) {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, map[string]string{
			"error": fmt.Sprintf("No tenés suficiente dinero. Necesitás ₡%d", ingredientCost),
		})
		return
	}

	// Start transaction
	tx, err := h.db.Begin(ctx)
	if err != nil {
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, map[string]string{"error": "Error de transacción"})
		return
	}
	defer tx.Rollback(ctx)

	// Deduct money
	newBalance := playerMoney - int64(ingredientCost)
	_, err = tx.Exec(ctx, `
		UPDATE game_sessions SET money = $1, updated_at = NOW()
		WHERE id = $2 AND player_id = $3
	`, newBalance, gameID, playerID)
	if err != nil {
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, map[string]string{"error": "Error al actualizar dinero"})
		return
	}

	// Add ingredient to inventory
	_, err = tx.Exec(ctx, `
		INSERT INTO player_ingredients (session_id, player_id, ingredient_code, source)
		VALUES ($1, $2, $3, 'purchase')
	`, gameID, playerID, req.IngredientCode)
	if err != nil {
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, map[string]string{"error": "Error al agregar ingrediente"})
		return
	}

	// Commit transaction
	if err := tx.Commit(ctx); err != nil {
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, map[string]string{"error": "Error al completar compra"})
		return
	}

	render.Status(r, http.StatusOK)
	render.JSON(w, r, BuyResponse{
		Success:        true,
		Message:        "¡Compraste " + ingredientName + "!",
		NewBalance:     newBalance,
		IngredientCode: req.IngredientCode,
	})
}
