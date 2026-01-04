package scenarios

import (
	"encoding/json"
	"time"
)

// Scenario representa un escenario/locación 3D guardado
type Scenario struct {
	ID          string          `json:"id"`
	Code        string          `json:"code"`
	Name        string          `json:"name"`
	Description *string         `json:"description,omitempty"`
	WorldType   string          `json:"worldType"`
	ZoneID      *string         `json:"zoneId,omitempty"`      // ID de la zona base (playa, comercial, etc.)
	SceneData   json.RawMessage `json:"scene"`
	Version     int             `json:"version"`
	IsActive    bool            `json:"isActive"`
	Status      string          `json:"status"`                 // pending, approved, rejected
	CreatorName string          `json:"creatorName"`
	ReviewedBy  *string         `json:"reviewedBy,omitempty"`
	ReviewedAt  *time.Time      `json:"reviewedAt,omitempty"`
	ReviewNotes *string         `json:"reviewNotes,omitempty"`
	TimesUsed   int             `json:"timesUsed"`
	LastUsedAt  *time.Time      `json:"lastUsedAt,omitempty"`
	CreatedAt   time.Time       `json:"createdAt"`
	UpdatedAt   time.Time       `json:"updatedAt"`
}

// CreateScenarioRequest para POST /scenarios
type CreateScenarioRequest struct {
	Code        string          `json:"code"`
	Name        string          `json:"name"`
	Description *string         `json:"description,omitempty"`
	WorldType   string          `json:"worldType"`
	ZoneID      *string         `json:"zoneId,omitempty"`
	Scene       json.RawMessage `json:"scene"`
	CreatorName *string         `json:"creatorName,omitempty"` // Default: "admin"
}

// UpdateScenarioRequest para PUT /scenarios/:code
type UpdateScenarioRequest struct {
	Name        *string         `json:"name,omitempty"`
	Description *string         `json:"description,omitempty"`
	WorldType   *string         `json:"worldType,omitempty"`
	ZoneID      *string         `json:"zoneId,omitempty"`
	Scene       json.RawMessage `json:"scene,omitempty"`
}

// ReviewScenarioRequest para POST /scenarios/:code/review
type ReviewScenarioRequest struct {
	Status      string  `json:"status"`                // approved, rejected
	ReviewNotes *string `json:"reviewNotes,omitempty"`
}

// ScenarioListResponse para GET /scenarios
type ScenarioListResponse struct {
	Scenarios []Scenario `json:"scenarios"`
	Total     int        `json:"total"`
}

// ScenarioFilter para filtrar listados
type ScenarioFilter struct {
	Status   *string `json:"status,omitempty"`   // pending, approved, rejected
	ZoneID   *string `json:"zoneId,omitempty"`   // filtrar por zona
	IsActive *bool   `json:"isActive,omitempty"` // solo activos
}
