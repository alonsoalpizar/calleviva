package creator

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type ContentCreation struct {
	ID          uuid.UUID       `json:"id"`
	ContentType string          `json:"content_type"`
	Name        string          `json:"name"`
	Description string          `json:"description,omitempty"`
	Recipe      json.RawMessage `json:"recipe"`
	CreatorName string          `json:"creator_name"`
	CreatedAt   time.Time       `json:"created_at"`
	Status      string          `json:"status"`
	ReviewedBy  *uuid.UUID      `json:"reviewed_by,omitempty"`
	ReviewedAt  *time.Time      `json:"reviewed_at,omitempty"`
	ReviewNotes string          `json:"review_notes,omitempty"`
	TimesUsed   int             `json:"times_used"`
	LastUsedAt  *time.Time      `json:"last_used_at,omitempty"`
	IsActive    bool            `json:"is_active"`
}

type ContentCreationInput struct {
	ContentType string          `json:"content_type"`
	Name        string          `json:"name"`
	Description string          `json:"description"`
	Recipe      json.RawMessage `json:"recipe"`
	CreatorName string          `json:"creator_name"`
}

type ContentReviewInput struct {
	Status string `json:"status"`
	Notes  string `json:"notes"`
}
