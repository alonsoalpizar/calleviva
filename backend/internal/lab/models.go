package lab

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// Ingredient represents an ingredient for dish creation
type Ingredient struct {
	ID       string `json:"id"`
	Type     string `json:"type"` // "default" or "creator"
	Name     string `json:"name"`
	Icon     string `json:"icon,omitempty"`
	BaseCost int    `json:"base_cost,omitempty"`
}

// PlayerDish represents a dish created in the Laboratorio
type PlayerDish struct {
	ID                  uuid.UUID       `json:"id"`
	SessionID           uuid.UUID       `json:"session_id"`
	PlayerID            uuid.UUID       `json:"player_id"`
	Name                string          `json:"name"`
	Description         string          `json:"description"`
	Ingredients         json.RawMessage `json:"ingredients"`
	PlayerPrompt        string          `json:"player_prompt,omitempty"`
	SuggestedPrice      int             `json:"suggested_price"`
	SuggestedPopularity int             `json:"suggested_popularity"`
	SuggestedDifficulty string          `json:"suggested_difficulty"`
	Tags                json.RawMessage `json:"tags"`
	PlayerPrice         *int            `json:"player_price,omitempty"`
	IsInMenu            bool            `json:"is_in_menu"`
	TimesSold           int             `json:"times_sold"`
	TotalRevenue        int64           `json:"total_revenue"`
	AvgSatisfaction     int             `json:"avg_satisfaction"`
	CreatedAt           time.Time       `json:"created_at"`
	UpdatedAt           time.Time       `json:"updated_at"`
}

// IngredientsResponse is the response for GET /lab/ingredients
type IngredientsResponse struct {
	Default     []Ingredient `json:"default"`
	FromCreator []Ingredient `json:"from_creator"`
}

// GenerateDishRequest is the request body for POST /lab/generate
type GenerateDishRequest struct {
	Ingredients  []Ingredient `json:"ingredients"`
	PlayerPrompt string       `json:"player_prompt"`
}

// GenerateDishResponse is the response for dish generation
type GenerateDishResponse struct {
	ID                  string   `json:"id"`
	Name                string   `json:"name"`
	Description         string   `json:"description"`
	SuggestedPrice      int      `json:"suggested_price"`
	SuggestedPopularity int      `json:"suggested_popularity"`
	SuggestedDifficulty string   `json:"suggested_difficulty"`
	Tags                []string `json:"tags"`
	HitsRemaining       int      `json:"hits_remaining"`
}

// UpdateDishRequest is the request body for PATCH /lab/dishes/{id}
type UpdateDishRequest struct {
	PlayerPrice *int  `json:"player_price,omitempty"`
	IsInMenu    *bool `json:"is_in_menu,omitempty"`
}

// AIUsageLimit tracks AI usage per player per feature
type AIUsageLimit struct {
	ID          uuid.UUID `json:"id"`
	PlayerID    uuid.UUID `json:"player_id"`
	Feature     string    `json:"feature"`
	HitsUsed    int       `json:"hits_used"`
	MaxHits     int       `json:"max_hits"`
	LastResetAt time.Time `json:"last_reset_at"`
	IsUnlimited bool      `json:"is_unlimited"`
}

// AIGeneratedDish is the structured response from Claude
type AIGeneratedDish struct {
	Name       string   `json:"nombre"`
	Desc       string   `json:"descripcion"`
	Price      int      `json:"precio_sugerido"`
	Popularity int      `json:"popularidad"`
	Difficulty string   `json:"dificultad"`
	Tags       []string `json:"tags"`
}
