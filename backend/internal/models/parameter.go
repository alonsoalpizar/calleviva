package models

import (
	"encoding/json"
	"time"
)

type Parameter struct {
	ID          string          `json:"id"`
	Category    string          `json:"category"`
	Code        string          `json:"code"`
	Name        string          `json:"name"`
	Description *string         `json:"description,omitempty"`
	Icon        *string         `json:"icon,omitempty"`
	Config      json.RawMessage `json:"config,omitempty"`
	SortOrder   int             `json:"sort_order"`
	IsActive    bool            `json:"is_active"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
}

type CreateParameterRequest struct {
	Category    string          `json:"category"`
	Code        string          `json:"code"`
	Name        string          `json:"name"`
	Description string          `json:"description,omitempty"`
	Icon        string          `json:"icon,omitempty"`
	Config      json.RawMessage `json:"config,omitempty"`
	SortOrder   int             `json:"sort_order,omitempty"`
	IsActive    *bool           `json:"is_active,omitempty"`
}

type UpdateParameterRequest struct {
	Name        *string         `json:"name,omitempty"`
	Description *string         `json:"description,omitempty"`
	Icon        *string         `json:"icon,omitempty"`
	Config      json.RawMessage `json:"config,omitempty"`
	SortOrder   *int            `json:"sort_order,omitempty"`
	IsActive    *bool           `json:"is_active,omitempty"`
}

type ParameterListResponse struct {
	Parameters []Parameter `json:"parameters"`
	Total      int         `json:"total"`
}
