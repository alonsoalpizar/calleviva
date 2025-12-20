package market

import (
	"time"

	"github.com/google/uuid"
)

// MarketIngredient represents an ingredient in the market catalog
type MarketIngredient struct {
	Code        string   `json:"code"`
	Name        string   `json:"name"`
	Icon        string   `json:"icon,omitempty"`
	Cost        int      `json:"cost"`
	Tier        string   `json:"tier"` // basic, common, premium, special
	Type        string   `json:"type,omitempty"`
	Tags        []string `json:"tags,omitempty"`
	Owned       bool     `json:"owned"`
	Source      string   `json:"source,omitempty"`      // system, creator
	CreatorName string   `json:"creator_name,omitempty"` // if from creator
}

// PlayerIngredient represents an ingredient owned by a player
type PlayerIngredient struct {
	ID             uuid.UUID `json:"id"`
	SessionID      uuid.UUID `json:"session_id"`
	PlayerID       uuid.UUID `json:"player_id"`
	IngredientCode string    `json:"ingredient_code"`
	Quantity       int       `json:"quantity"`
	Source         string    `json:"source"` // starter, purchase, event, reward
	AcquiredAt     time.Time `json:"acquired_at"`
}

// CatalogResponse is the response for GET /market/catalog
type CatalogResponse struct {
	Ingredients []MarketIngredient `json:"ingredients"`
	PlayerMoney int64              `json:"player_money"`
	Stats       CatalogStats       `json:"stats"`
}

// CatalogStats shows inventory summary
type CatalogStats struct {
	TotalAvailable int `json:"total_available"`
	Owned          int `json:"owned"`
	BasicOwned     int `json:"basic_owned"`
	CommonOwned    int `json:"common_owned"`
	PremiumOwned   int `json:"premium_owned"`
	SpecialOwned   int `json:"special_owned"`
}

// InventoryResponse is the response for GET /market/inventory
type InventoryResponse struct {
	Ingredients []MarketIngredient `json:"ingredients"`
	Total       int                `json:"total"`
}

// BuyRequest is the request body for POST /market/buy
type BuyRequest struct {
	IngredientCode string `json:"ingredient_code"`
}

// BuyResponse is the response for POST /market/buy
type BuyResponse struct {
	Success       bool   `json:"success"`
	Message       string `json:"message"`
	NewBalance    int64  `json:"new_balance"`
	IngredientCode string `json:"ingredient_code"`
}
