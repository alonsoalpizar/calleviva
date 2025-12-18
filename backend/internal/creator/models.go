package creator

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type ContentCreation struct {
	ID          uuid.UUID       `json:"id" db:"id"`
	ContentType string          `json:"content_type" db:"content_type"`
	Name        string          `json:"name" db:"name"`
	Description string          `json:"description,omitempty" db:"description"`
	Recipe      json.RawMessage `json:"recipe" db:"recipe"`
	CreatorName string          `json:"creator_name" db:"creator_name"`
	CreatedAt   time.Time       `json:"created_at" db:"created_at"`
	Status      string          `json:"status" db:"status"`
	ReviewedBy  *uuid.UUID      `json:"reviewed_by,omitempty" db:"reviewed_by"`
	ReviewedAt  *time.Time      `json:"reviewed_at,omitempty" db:"reviewed_at"`
	ReviewNotes string          `json:"review_notes,omitempty" db:"review_notes"`
	TimesUsed   int             `json:"times_used" db:"times_used"`
	LastUsedAt  *time.Time      `json:"last_used_at,omitempty" db:"last_used_at"`
	IsActive    bool            `json:"is_active" db:"is_active"`
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
