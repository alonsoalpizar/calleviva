package models

import (
	"encoding/json"
	"time"
)

type GameSession struct {
	ID              string          `json:"id"`
	PlayerID        string          `json:"player_id"`
	WorldType       string          `json:"world_type"`
	Name            *string         `json:"name,omitempty"`
	GameDay         int             `json:"game_day"`
	Money           int64           `json:"money"`
	Reputation      int             `json:"reputation"`
	CurrentLocation *string         `json:"current_location,omitempty"`
	Weather         string          `json:"weather"`
	Status          string          `json:"status"`
	Stats           json.RawMessage `json:"stats,omitempty"`
	CreatedAt       time.Time       `json:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at"`
}

type CreateGameRequest struct {
	WorldType string `json:"world_type"`
	Name      string `json:"name,omitempty"`
}

type UpdateGameRequest struct {
	Name            *string         `json:"name,omitempty"`
	GameDay         *int            `json:"game_day,omitempty"`
	Money           *int64          `json:"money,omitempty"`
	Reputation      *int            `json:"reputation,omitempty"`
	CurrentLocation *string         `json:"current_location,omitempty"`
	Weather         *string         `json:"weather,omitempty"`
	Status          *string         `json:"status,omitempty"`
	Stats           json.RawMessage `json:"stats,omitempty"`
}

type GameListResponse struct {
	Games []GameSession `json:"games"`
	Total int           `json:"total"`
}
