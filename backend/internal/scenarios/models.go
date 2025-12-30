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
	SceneData   json.RawMessage `json:"scene"`
	Version     int             `json:"version"`
	IsActive    bool            `json:"isActive"`
	CreatedAt   time.Time       `json:"createdAt"`
	UpdatedAt   time.Time       `json:"updatedAt"`
}

// CreateScenarioRequest para POST /scenarios
type CreateScenarioRequest struct {
	Code        string          `json:"code"`
	Name        string          `json:"name"`
	Description *string         `json:"description,omitempty"`
	WorldType   string          `json:"worldType"`
	Scene       json.RawMessage `json:"scene"`
}

// UpdateScenarioRequest para PUT /scenarios/:code
type UpdateScenarioRequest struct {
	Name        *string         `json:"name,omitempty"`
	Description *string         `json:"description,omitempty"`
	WorldType   *string         `json:"worldType,omitempty"`
	Scene       json.RawMessage `json:"scene,omitempty"`
}

// ScenarioListResponse para GET /scenarios
type ScenarioListResponse struct {
	Scenarios []Scenario `json:"scenarios"`
	Total     int        `json:"total"`
}
