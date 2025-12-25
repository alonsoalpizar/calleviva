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

// cleanJSONResponse strips markdown code blocks from AI responses
// DeepSeek and some other models wrap JSON in ```json ... ```
func cleanJSONResponse(text string) string {
	text = strings.TrimSpace(text)

	// Remove ```json or ``` at the start
	if strings.HasPrefix(text, "```json") {
		text = strings.TrimPrefix(text, "```json")
	} else if strings.HasPrefix(text, "```") {
		text = strings.TrimPrefix(text, "```")
	}

	// Remove ``` at the end
	if strings.HasSuffix(text, "```") {
		text = strings.TrimSuffix(text, "```")
	}

	return strings.TrimSpace(text)
}

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

	// Register the dish generation template - Natural Costa Rican voice with stories
	template := `Sos un chef costarricense creando platillos para un food truck.

Ingredientes disponibles: {{.Ingredientes}}
{{if .Prompt}}El cliente pidió: "{{.Prompt}}"{{end}}

Creá un platillo con HISTORIA y ALMA. La descripción debe contar de dónde viene este plato, cómo se siente, cómo huele.

ESTRUCTURA (3-4 oraciones fluidas):
1. ORIGEN/LEYENDA: ¿Quién inventó este plato? ¿Cuándo? ¿Por qué? (una abuela, un cantinero, un pescador, una noche de lluvia...)
2. SENSORIAL: ¿Cómo huele, cómo suena al cocinarse, qué colores tiene, qué texturas?
3. OPCIONAL: Un tip, secreto, o sugerencia de cómo disfrutarlo.

IMPORTANTE - Tercera persona:
✅ "Dicen que una abuela de Cartago inventó esto..."
✅ "Cuenta la leyenda que un cocinero de Limón..."
✅ "Este plato nació en una cantina de Heredia..."
❌ NO uses "mi tía", "mi mamá", "mi abuela" - el plato es del jugador, no tuyo

IMPORTANTE - Evitar:
❌ No pongas "mae" a cada rato
❌ No siempre cerveza - puede ser café, agua de pipa, fresco, o nada
❌ No "fiesta de sabores", "explosión", "danza de sabores"
❌ No fuerces jerga - que salga natural

EJEMPLOS DE BUEN TONO:
- "Cuenta la leyenda que don Pedro, un arriero de Turrialba, creó esta receta para sobrevivir las noches frías en el páramo. El chicharrón suelta su grasa dorada sobre el arroz, los frijoles aportan ese color negro profundo, y el culantro fresco corona todo con su aroma inconfundible."
- "Nació en una madrugada lluviosa en el Mercado Central, cuando sobraban ingredientes y faltaba inspiración. El huevo se funde con el arroz caliente, la cebolla caramelizada aporta dulzor, y todo huele a domingo temprano."
- "Una cocinera de Puntarenas mezclaba esto para los pescadores que volvían al amanecer. Fresco, liviano, con ese toque de limón que despierta hasta al más cansado."

NOMBRES: Creativos pero no ridículos
✅ "El Arriero", "Madrugada en el Central", "Lo del Puerto"
❌ "Explosión Volcánica de Sabores Ancestrales"

JSON (solo esto, nada más):
{
  "nombre": "Nombre memorable (máx 40 chars)",
  "descripcion": "Historia + descripción sensorial. 200-350 caracteres.",
  "precio_sugerido": 2500-12000,
  "popularidad": 40-85,
  "dificultad": "facil" | "medio" | "dificil",
  "tags": ["2-4", "tags", "relevantes"]
}`

	if err := svc.RegisterTemplate("dish_generation", template); err != nil {
		log.Printf("Warning: Failed to register template: %v", err)
	}

	h.aiService = svc
	return nil
}

// GET /api/v1/games/{gameID}/lab/ingredients
// Only returns ingredients the player owns
func (h *Handler) GetIngredients(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	// Get game and player IDs
	gameID, err := uuid.Parse(chi.URLParam(r, "gameID"))
	if err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, map[string]string{"error": "Invalid game ID"})
		return
	}

	claims, err := auth.GetClaimsFromContext(r.Context())
	if err != nil {
		render.Status(r, http.StatusUnauthorized)
		render.JSON(w, r, map[string]string{"error": "Authentication required"})
		return
	}
	playerID, _ := uuid.Parse(claims.PlayerID)

	response := IngredientsResponse{
		Default:     []Ingredient{},
		FromCreator: []Ingredient{},
	}

	// Get only ingredients the player OWNS (from player_ingredients table)
	rows, err := h.db.Query(ctx, `
		SELECT p.code, p.name, p.icon, p.config
		FROM parameters p
		INNER JOIN player_ingredients pi ON pi.ingredient_code = p.code
		WHERE p.category = 'ingredients_cr'
		  AND p.is_active = true
		  AND pi.session_id = $1
		  AND pi.player_id = $2
		ORDER BY p.name
	`, gameID, playerID)
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
			MaxTokens:   800, // Increased for elaborate descriptions
			Temperature: 0.9, // More creative
		})

		if err != nil {
			log.Printf("AI generation failed: %v", err)
			generated = h.fallbackGeneration(ingredientNames, req.PlayerPrompt)
		} else {
			// Clean markdown code blocks (DeepSeek wraps JSON in ```json ... ```)
			cleanedText := cleanJSONResponse(resp.Text)

			// Parse AI response
			if err := json.Unmarshal([]byte(cleanedText), &generated); err != nil {
				log.Printf("Failed to parse AI response: %v, raw: %s", err, resp.Text)
				generated = h.fallbackGeneration(ingredientNames, req.PlayerPrompt)
			} else {
				log.Printf("AI dish generated successfully: %s (provider response)", generated.Name)
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

// fallbackGeneration creates a dish with natural tone without AI
func (h *Handler) fallbackGeneration(ingredients []string, prompt string) AIGeneratedDish {
	// Simple, memorable names
	names := []string{
		"El Reconfortante",
		"Tarde de Domingo",
		"Lo de Siempre",
		"El Clásico",
		"Para Compartir",
		"El Favorito",
		"Sin Vueltas",
		"El de la Casa",
		"Pa' Llevar",
		"El Honesto",
		"Día de Lluvia",
		"El Atrevido",
	}

	// Natural, flowing descriptions (complete sentences)
	descriptions := []string{
		"De esos platos que no necesitan explicación. Lo servís y la gente entiende. El aroma hace el trabajo, los sabores confirman.",
		"Para cuando querés algo que simplemente funcione. Sin sorpresas, sin complicaciones. Solo comida honesta que sabe a lo que tiene que saber.",
		"Mi abuela hacía algo parecido. No era exactamente esto, pero el sentimiento es el mismo. Comida que reconforta.",
		"A veces lo mejor es no complicarse. Buenos ingredientes, cocción correcta, y dejar que las cosas hablen por sí solas.",
		"Este plato es para sentarse sin prisa. Para esos días donde el tiempo no importa y solo querés disfrutar.",
		"No voy a decir que es el mejor plato del mundo. Pero sí que cuando lo hacemos bien, la gente repite.",
		"Hay combinaciones que simplemente funcionan. Esta es una de esas. No pregunten por qué, solo pruébenlo.",
		"El secreto no es ningún secreto: buenos ingredientes y paciencia. Eso es todo.",
	}

	// Generate hash for consistent selection
	hash := 0
	for _, ing := range ingredients {
		for _, c := range ing {
			hash += int(c)
		}
	}

	// Select based on hash
	name := names[hash%len(names)]
	desc := descriptions[(hash/2)%len(descriptions)]

	// Add ingredient mention naturally if few ingredients
	if len(ingredients) > 0 && len(ingredients) <= 3 {
		ingredientList := strings.Join(ingredients, ", ")
		extras := []string{
			fmt.Sprintf(" Con %s como protagonistas.", ingredientList),
			fmt.Sprintf(" Hoy con %s.", ingredientList),
			fmt.Sprintf(" La versión con %s.", ingredientList),
		}
		desc += extras[hash%len(extras)]
	}

	// Base price on ingredient count
	price := 3000 + (len(ingredients) * 700)
	if price > 12000 {
		price = 12000
	}

	popularity := 60 + (len(ingredients) * 4)
	if popularity > 90 {
		popularity = 90
	}

	difficulty := "medio"
	if len(ingredients) <= 2 {
		difficulty = "facil"
	} else if len(ingredients) >= 5 {
		difficulty = "dificil"
	}

	// Simple, relevant tags
	tagOptions := [][]string{
		{"casero", "reconfortante"},
		{"sencillo", "rico"},
		{"tradicional", "familiar"},
		{"para-compartir", "abundante"},
	}
	tags := tagOptions[hash%len(tagOptions)]
	if len(ingredients) >= 4 {
		tags = append(tags, "elaborado")
	}

	return AIGeneratedDish{
		Name:       name,
		Desc:       desc,
		Price:      price,
		Popularity: popularity,
		Difficulty: difficulty,
		Tags:       tags,
	}
}
