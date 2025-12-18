package lab

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/alonsoalpizar/calleviva/backend/internal/ai/orchestrator"
	"github.com/alonsoalpizar/calleviva/backend/internal/ai/providers"
	"github.com/alonsoalpizar/calleviva/backend/internal/auth"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

const (
	FeatureLabGenerate = "lab_generate"
	DefaultMaxHits     = 3
	AdminEmail         = "alonsoalpizar@gmail.com"
)

type Handler struct {
	db        *pgxpool.Pool
	aiService *orchestrator.Service
}

func NewHandler(db *pgxpool.Pool) *Handler {
	return &Handler{db: db}
}

// SetupRoutes mounts lab routes (requires auth)
func (h *Handler) SetupRoutes(r chi.Router) {
	r.Route("/lab", func(r chi.Router) {
		r.Get("/ingredients", h.GetIngredients)
		r.Post("/generate", h.GenerateDish)
		r.Get("/dishes", h.ListDishes)
		r.Get("/dishes/{dishID}", h.GetDish)
		r.Patch("/dishes/{dishID}", h.UpdateDish)
		r.Delete("/dishes/{dishID}", h.DeleteDish)
		r.Get("/usage", h.GetUsage)
	})
}

// InitAI initializes AI service (call after DB is ready)
func (h *Handler) InitAI(ctx context.Context) error {
	svc, err := orchestrator.NewService(ctx, h.db)
	if err != nil {
		log.Printf("Warning: AI service init failed: %v", err)
		return err
	}

	// Register the dish generation template
	template := `Sos un chef costarricense creativo.
Con estos ingredientes: {{.Ingredientes}}
El cliente pide: "{{.Prompt}}"

Generá UN platillo creativo. Respondé SOLO en este formato JSON exacto:
{
  "nombre": "Nombre creativo del platillo (máx 50 chars)",
  "descripcion": "Descripción apetitosa en 1-2 oraciones con jerga tica",
  "precio_sugerido": número entre 1500 y 15000 (en colones),
  "popularidad": número entre 1 y 100,
  "dificultad": "facil" o "medio" o "dificil",
  "tags": ["tag1", "tag2", "tag3"]
}

SOLO el JSON, nada más.`

	if err := svc.RegisterTemplate("dish_generation", template); err != nil {
		log.Printf("Warning: Failed to register template: %v", err)
	}

	h.aiService = svc
	return nil
}

// GET /api/v1/games/{gameID}/lab/ingredients
func (h *Handler) GetIngredients(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	response := IngredientsResponse{
		Default:     []Ingredient{},
		FromCreator: []Ingredient{},
	}

	// Get default ingredients from parameters (category = 'ingredients_cr')
	rows, err := h.db.Query(ctx, `
		SELECT code, name, icon, config
		FROM parameters
		WHERE category = 'ingredients_cr' AND is_active = true
		ORDER BY sort_order, name
	`)
	if err != nil {
		log.Printf("Error fetching default ingredients: %v", err)
	} else {
		defer rows.Close()
		for rows.Next() {
			var code, name string
			var icon *string
			var config json.RawMessage

			if err := rows.Scan(&code, &name, &icon, &config); err != nil {
				continue
			}

			ingredient := Ingredient{
				ID:   code,
				Type: "default",
				Name: name,
			}
			if icon != nil {
				ingredient.Icon = *icon
			}

			// Extract cost from config if present
			var cfg map[string]interface{}
			if json.Unmarshal(config, &cfg) == nil {
				if cost, ok := cfg["cost"].(float64); ok {
					ingredient.BaseCost = int(cost)
				} else if baseCost, ok := cfg["base_cost"].(float64); ok {
					ingredient.BaseCost = int(baseCost)
				}
			}

			response.Default = append(response.Default, ingredient)
		}
	}

	// Get approved ingredients from creator
	creatorRows, err := h.db.Query(ctx, `
		SELECT id, name, recipe
		FROM content_creations
		WHERE content_type = 'ingredientes' AND status = 'approved' AND is_active = true
		ORDER BY created_at DESC
	`)
	if err != nil {
		log.Printf("Error fetching creator ingredients: %v", err)
	} else {
		defer creatorRows.Close()
		for creatorRows.Next() {
			var id uuid.UUID
			var name string
			var recipe json.RawMessage

			if err := creatorRows.Scan(&id, &name, &recipe); err != nil {
				continue
			}

			ingredient := Ingredient{
				ID:   id.String(),
				Type: "creator",
				Name: name,
			}

			// Try to extract icon from recipe
			var recipeData map[string]interface{}
			if json.Unmarshal(recipe, &recipeData) == nil {
				if icon, ok := recipeData["icon"].(string); ok {
					ingredient.Icon = icon
				}
			}

			response.FromCreator = append(response.FromCreator, ingredient)
		}
	}

	render.JSON(w, r, response)
}

// POST /api/v1/games/{gameID}/lab/generate
func (h *Handler) GenerateDish(w http.ResponseWriter, r *http.Request) {
	gameID := chi.URLParam(r, "gameID")
	claims, err := auth.GetClaimsFromContext(r.Context())
	if err != nil {
		render.Status(r, http.StatusUnauthorized)
		render.JSON(w, r, map[string]string{"error": "Authentication required"})
		return
	}
	playerID := claims.PlayerID

	var req GenerateDishRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, map[string]string{"error": "Invalid request body"})
		return
	}

	if len(req.Ingredients) == 0 {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, map[string]string{"error": "At least one ingredient is required"})
		return
	}

	ctx := r.Context()

	// Check usage limits
	hitsRemaining, err := h.checkAndUpdateUsage(ctx, playerID)
	if err != nil {
		render.Status(r, http.StatusTooManyRequests)
		render.JSON(w, r, map[string]string{
			"error":          "Usage limit reached",
			"hits_remaining": "0",
		})
		return
	}

	// Build ingredient list for prompt
	ingredientNames := make([]string, len(req.Ingredients))
	for i, ing := range req.Ingredients {
		ingredientNames[i] = ing.Name
	}
	ingredientStr := strings.Join(ingredientNames, ", ")

	// Generate with AI
	var generated AIGeneratedDish

	if h.aiService != nil && h.aiService.IsReady() {
		resp, err := h.aiService.GenerateText(ctx, "dish_generation", map[string]interface{}{
			"Ingredientes": ingredientStr,
			"Prompt":       req.PlayerPrompt,
		}, providers.Config{
			MaxTokens:   300,
			Temperature: 0.8,
		})

		if err != nil {
			log.Printf("AI generation failed: %v", err)
			generated = h.fallbackGeneration(ingredientNames, req.PlayerPrompt)
		} else {
			// Parse AI response
			if err := json.Unmarshal([]byte(resp.Text), &generated); err != nil {
				log.Printf("Failed to parse AI response: %v, raw: %s", err, resp.Text)
				generated = h.fallbackGeneration(ingredientNames, req.PlayerPrompt)
			}
		}
	} else {
		generated = h.fallbackGeneration(ingredientNames, req.PlayerPrompt)
	}

	// Validate generated data
	if generated.Price < 1500 {
		generated.Price = 1500
	}
	if generated.Price > 15000 {
		generated.Price = 15000
	}
	if generated.Popularity < 1 {
		generated.Popularity = 50
	}
	if generated.Popularity > 100 {
		generated.Popularity = 100
	}
	if generated.Difficulty == "" {
		generated.Difficulty = "medio"
	}
	if len(generated.Tags) == 0 {
		generated.Tags = []string{"casero"}
	}

	// Save to database
	ingredientsJSON, _ := json.Marshal(req.Ingredients)
	tagsJSON, _ := json.Marshal(generated.Tags)

	var dishID uuid.UUID
	err = h.db.QueryRow(ctx, `
		INSERT INTO player_dishes
		(session_id, player_id, name, description, ingredients, player_prompt,
		 suggested_price, suggested_popularity, suggested_difficulty, tags)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id
	`,
		gameID, playerID, generated.Name, generated.Desc, ingredientsJSON, req.PlayerPrompt,
		generated.Price, generated.Popularity, generated.Difficulty, tagsJSON,
	).Scan(&dishID)

	if err != nil {
		log.Printf("Failed to save dish: %v", err)
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, map[string]string{"error": "Failed to save dish"})
		return
	}

	render.Status(r, http.StatusCreated)
	render.JSON(w, r, GenerateDishResponse{
		ID:                  dishID.String(),
		Name:                generated.Name,
		Description:         generated.Desc,
		SuggestedPrice:      generated.Price,
		SuggestedPopularity: generated.Popularity,
		SuggestedDifficulty: generated.Difficulty,
		Tags:                generated.Tags,
		HitsRemaining:       hitsRemaining,
	})
}

// GET /api/v1/games/{gameID}/lab/dishes
func (h *Handler) ListDishes(w http.ResponseWriter, r *http.Request) {
	gameID := chi.URLParam(r, "gameID")

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := h.db.Query(ctx, `
		SELECT id, session_id, player_id, name, description, ingredients, player_prompt,
		       suggested_price, suggested_popularity, suggested_difficulty, tags,
		       player_price, is_in_menu, times_sold, total_revenue, avg_satisfaction,
		       created_at, updated_at
		FROM player_dishes
		WHERE session_id = $1
		ORDER BY created_at DESC
	`, gameID)

	if err != nil {
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, map[string]string{"error": "Database error"})
		return
	}
	defer rows.Close()

	var dishes []PlayerDish
	for rows.Next() {
		var d PlayerDish
		err := rows.Scan(
			&d.ID, &d.SessionID, &d.PlayerID, &d.Name, &d.Description, &d.Ingredients, &d.PlayerPrompt,
			&d.SuggestedPrice, &d.SuggestedPopularity, &d.SuggestedDifficulty, &d.Tags,
			&d.PlayerPrice, &d.IsInMenu, &d.TimesSold, &d.TotalRevenue, &d.AvgSatisfaction,
			&d.CreatedAt, &d.UpdatedAt,
		)
		if err != nil {
			log.Printf("Scan error: %v", err)
			continue
		}
		dishes = append(dishes, d)
	}

	if dishes == nil {
		dishes = []PlayerDish{}
	}

	render.JSON(w, r, dishes)
}

// GET /api/v1/games/{gameID}/lab/dishes/{dishID}
func (h *Handler) GetDish(w http.ResponseWriter, r *http.Request) {
	dishID := chi.URLParam(r, "dishID")

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var d PlayerDish
	err := h.db.QueryRow(ctx, `
		SELECT id, session_id, player_id, name, description, ingredients, player_prompt,
		       suggested_price, suggested_popularity, suggested_difficulty, tags,
		       player_price, is_in_menu, times_sold, total_revenue, avg_satisfaction,
		       created_at, updated_at
		FROM player_dishes
		WHERE id = $1
	`, dishID).Scan(
		&d.ID, &d.SessionID, &d.PlayerID, &d.Name, &d.Description, &d.Ingredients, &d.PlayerPrompt,
		&d.SuggestedPrice, &d.SuggestedPopularity, &d.SuggestedDifficulty, &d.Tags,
		&d.PlayerPrice, &d.IsInMenu, &d.TimesSold, &d.TotalRevenue, &d.AvgSatisfaction,
		&d.CreatedAt, &d.UpdatedAt,
	)

	if err == pgx.ErrNoRows {
		render.Status(r, http.StatusNotFound)
		render.JSON(w, r, map[string]string{"error": "Dish not found"})
		return
	}
	if err != nil {
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, map[string]string{"error": "Database error"})
		return
	}

	render.JSON(w, r, d)
}

// PATCH /api/v1/games/{gameID}/lab/dishes/{dishID}
func (h *Handler) UpdateDish(w http.ResponseWriter, r *http.Request) {
	dishID := chi.URLParam(r, "dishID")

	var req UpdateDishRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, map[string]string{"error": "Invalid request body"})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	// Build dynamic update
	updates := []string{}
	args := []interface{}{}
	argNum := 1

	if req.PlayerPrice != nil {
		updates = append(updates, fmt.Sprintf("player_price = $%d", argNum))
		args = append(args, *req.PlayerPrice)
		argNum++
	}
	if req.IsInMenu != nil {
		updates = append(updates, fmt.Sprintf("is_in_menu = $%d", argNum))
		args = append(args, *req.IsInMenu)
		argNum++
	}

	if len(updates) == 0 {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, map[string]string{"error": "No fields to update"})
		return
	}

	query := fmt.Sprintf(`
		UPDATE player_dishes SET %s, updated_at = NOW()
		WHERE id = $%d
	`, strings.Join(updates, ", "), argNum)
	args = append(args, dishID)

	result, err := h.db.Exec(ctx, query, args...)
	if err != nil {
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, map[string]string{"error": "Update failed"})
		return
	}

	if result.RowsAffected() == 0 {
		render.Status(r, http.StatusNotFound)
		render.JSON(w, r, map[string]string{"error": "Dish not found"})
		return
	}

	render.JSON(w, r, map[string]string{"message": "Dish updated"})
}

// DELETE /api/v1/games/{gameID}/lab/dishes/{dishID}
func (h *Handler) DeleteDish(w http.ResponseWriter, r *http.Request) {
	dishID := chi.URLParam(r, "dishID")

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	result, err := h.db.Exec(ctx, "DELETE FROM player_dishes WHERE id = $1", dishID)
	if err != nil {
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, map[string]string{"error": "Delete failed"})
		return
	}

	if result.RowsAffected() == 0 {
		render.Status(r, http.StatusNotFound)
		render.JSON(w, r, map[string]string{"error": "Dish not found"})
		return
	}

	render.JSON(w, r, map[string]string{"message": "Dish deleted"})
}

// GET /api/v1/games/{gameID}/lab/usage
func (h *Handler) GetUsage(w http.ResponseWriter, r *http.Request) {
	claims, err := auth.GetClaimsFromContext(r.Context())
	if err != nil {
		render.Status(r, http.StatusUnauthorized)
		render.JSON(w, r, map[string]string{"error": "Authentication required"})
		return
	}
	playerID := claims.PlayerID

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	// Check if admin (unlimited)
	var email string
	h.db.QueryRow(ctx, "SELECT email FROM players WHERE id = $1", playerID).Scan(&email)

	if strings.EqualFold(email, AdminEmail) {
		render.JSON(w, r, map[string]interface{}{
			"hits_used":     0,
			"max_hits":      -1,
			"hits_remaining": -1,
			"is_unlimited":  true,
		})
		return
	}

	var usage AIUsageLimit
	err = h.db.QueryRow(ctx, `
		SELECT hits_used, max_hits, is_unlimited, last_reset_at
		FROM ai_usage_limits
		WHERE player_id = $1 AND feature = $2
	`, playerID, FeatureLabGenerate).Scan(&usage.HitsUsed, &usage.MaxHits, &usage.IsUnlimited, &usage.LastResetAt)

	if err == pgx.ErrNoRows {
		// No record yet = 0 used
		render.JSON(w, r, map[string]interface{}{
			"hits_used":      0,
			"max_hits":       DefaultMaxHits,
			"hits_remaining": DefaultMaxHits,
			"is_unlimited":   false,
		})
		return
	}

	remaining := usage.MaxHits - usage.HitsUsed
	if usage.IsUnlimited || usage.MaxHits == -1 {
		remaining = -1
	}

	render.JSON(w, r, map[string]interface{}{
		"hits_used":      usage.HitsUsed,
		"max_hits":       usage.MaxHits,
		"hits_remaining": remaining,
		"is_unlimited":   usage.IsUnlimited,
	})
}

// checkAndUpdateUsage checks usage limits and increments counter
// Returns remaining hits (-1 if unlimited), or error if limit exceeded
func (h *Handler) checkAndUpdateUsage(ctx context.Context, playerID string) (int, error) {
	// Check if admin
	var email string
	h.db.QueryRow(ctx, "SELECT email FROM players WHERE id = $1", playerID).Scan(&email)

	if strings.EqualFold(email, AdminEmail) {
		return -1, nil // Unlimited
	}

	// Get or create usage record
	var usage AIUsageLimit
	err := h.db.QueryRow(ctx, `
		INSERT INTO ai_usage_limits (player_id, feature, hits_used, max_hits)
		VALUES ($1, $2, 0, $3)
		ON CONFLICT (player_id, feature) DO UPDATE SET player_id = ai_usage_limits.player_id
		RETURNING id, hits_used, max_hits, is_unlimited
	`, playerID, FeatureLabGenerate, DefaultMaxHits).Scan(&usage.ID, &usage.HitsUsed, &usage.MaxHits, &usage.IsUnlimited)

	if err != nil {
		return 0, fmt.Errorf("failed to check usage: %w", err)
	}

	if usage.IsUnlimited || usage.MaxHits == -1 {
		return -1, nil
	}

	if usage.HitsUsed >= usage.MaxHits {
		return 0, fmt.Errorf("usage limit exceeded")
	}

	// Increment usage
	_, err = h.db.Exec(ctx, `
		UPDATE ai_usage_limits
		SET hits_used = hits_used + 1, updated_at = NOW()
		WHERE player_id = $1 AND feature = $2
	`, playerID, FeatureLabGenerate)

	if err != nil {
		return 0, fmt.Errorf("failed to update usage: %w", err)
	}

	return usage.MaxHits - usage.HitsUsed - 1, nil
}

// fallbackGeneration creates a dish without AI
func (h *Handler) fallbackGeneration(ingredients []string, prompt string) AIGeneratedDish {
	// Simple deterministic generation based on ingredients
	name := "Platillo Especial"
	if len(ingredients) > 0 {
		name = "Combo de " + ingredients[0]
		if len(ingredients) > 1 {
			name += " con " + ingredients[1]
		}
	}

	// Base price on ingredient count
	price := 2000 + (len(ingredients) * 500)
	if price > 12000 {
		price = 12000
	}

	popularity := 40 + (len(ingredients) * 5)
	if popularity > 80 {
		popularity = 80
	}

	difficulty := "medio"
	if len(ingredients) <= 2 {
		difficulty = "facil"
	} else if len(ingredients) >= 5 {
		difficulty = "dificil"
	}

	desc := fmt.Sprintf("Un delicioso platillo preparado con %s. ¡Pura vida!", strings.Join(ingredients, ", "))
	if len(desc) > 150 {
		desc = desc[:147] + "..."
	}

	return AIGeneratedDish{
		Name:       name,
		Desc:       desc,
		Price:      price,
		Popularity: popularity,
		Difficulty: difficulty,
		Tags:       []string{"casero", "tradicional"},
	}
}
