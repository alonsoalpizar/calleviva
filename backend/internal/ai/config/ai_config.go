package config

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/alonsoalpizar/calleviva/backend/internal/ai/crypto"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ProviderType defines the type of AI provider
type ProviderType string

const (
	ProviderTypeOpenAI    ProviderType = "openai"    // OpenAI-compatible (OpenAI, Groq, Together, Ollama, etc.)
	ProviderTypeAnthropic ProviderType = "anthropic" // Anthropic Claude
)

// AIConfig holds all AI-related configuration
type AIConfig struct {
	// Provider settings
	Enabled      bool         `json:"enabled"`
	ProviderType ProviderType `json:"provider_type"` // "openai" or "anthropic"
	ProviderURL  string       `json:"provider_url"`
	Model        string       `json:"model"`

	// API Key (stored encrypted in DB)
	APIKeyEncrypted string `json:"-"`       // Don't serialize
	APIKey          string `json:"api_key"` // Decrypted at runtime

	// Generation defaults
	MaxTokens      int     `json:"max_tokens"`
	Temperature    float64 `json:"temperature"`
	TimeoutSeconds int     `json:"timeout_seconds"`

	// Cache settings
	CacheEnabled   bool `json:"cache_enabled"`
	CacheTTLMinutes int  `json:"cache_ttl_minutes"`

	// Rate limiting
	MaxRequestsPerMinute int `json:"max_requests_per_minute"`

	// Fallback behavior
	FallbackEnabled bool `json:"fallback_enabled"`
}

// DefaultConfig returns sensible defaults
func DefaultConfig() *AIConfig {
	return &AIConfig{
		Enabled:              false, // Disabled by default until configured
		ProviderType:         ProviderTypeAnthropic,
		ProviderURL:          "https://api.anthropic.com/v1/messages",
		Model:                "claude-sonnet-4-20250514",
		MaxTokens:            1024,
		Temperature:          0.7,
		TimeoutSeconds:       30,
		CacheEnabled:         true,
		CacheTTLMinutes:      15,
		MaxRequestsPerMinute: 60,
		FallbackEnabled:      true,
	}
}

// GetProviderType returns the provider type, defaulting to anthropic if not set
func (c *AIConfig) GetProviderType() ProviderType {
	if c.ProviderType == "" {
		return ProviderTypeAnthropic
	}
	return c.ProviderType
}

// LoadFromDB loads AI configuration from the parameters table
func LoadFromDB(ctx context.Context, pool *pgxpool.Pool) (*AIConfig, error) {
	config := DefaultConfig()

	// Query the ai_provider parameter
	var configJSON []byte
	var apiKeyEncrypted *string

	err := pool.QueryRow(ctx, `
		SELECT
			config,
			config->>'api_key_encrypted' as api_key_encrypted
		FROM parameters
		WHERE category = 'ai_config'
		AND code = 'provider'
		AND is_active = true
	`).Scan(&configJSON, &apiKeyEncrypted)

	if err != nil {
		// No config in DB, return defaults
		return config, nil
	}

	// Parse the config JSON
	if err := json.Unmarshal(configJSON, config); err != nil {
		return nil, fmt.Errorf("failed to parse AI config: %w", err)
	}

	// Decrypt API key if present
	if apiKeyEncrypted != nil && *apiKeyEncrypted != "" {
		decrypted, err := crypto.Decrypt(*apiKeyEncrypted)
		if err != nil {
			// Log warning but don't fail - AI will just be disabled
			config.Enabled = false
			config.APIKey = ""
		} else {
			config.APIKey = decrypted
		}
	}

	return config, nil
}

// SaveToDB saves AI configuration to the parameters table
// API key will be encrypted before storage
func SaveToDB(ctx context.Context, pool *pgxpool.Pool, config *AIConfig) error {
	// Encrypt API key if provided
	var apiKeyEncrypted string
	if config.APIKey != "" {
		encrypted, err := crypto.Encrypt(config.APIKey)
		if err != nil {
			return fmt.Errorf("failed to encrypt API key: %w", err)
		}
		apiKeyEncrypted = encrypted
	}

	// Build config JSON (without raw API key, with encrypted version)
	configMap := map[string]interface{}{
		"enabled":                 config.Enabled,
		"provider_type":           config.ProviderType,
		"provider_url":            config.ProviderURL,
		"model":                   config.Model,
		"max_tokens":              config.MaxTokens,
		"temperature":             config.Temperature,
		"timeout_seconds":         config.TimeoutSeconds,
		"cache_enabled":           config.CacheEnabled,
		"cache_ttl_minutes":       config.CacheTTLMinutes,
		"max_requests_per_minute": config.MaxRequestsPerMinute,
		"fallback_enabled":        config.FallbackEnabled,
		"api_key_encrypted":       apiKeyEncrypted,
	}

	configJSON, err := json.Marshal(configMap)
	if err != nil {
		return fmt.Errorf("failed to serialize config: %w", err)
	}

	// Upsert into parameters
	_, err = pool.Exec(ctx, `
		INSERT INTO parameters (category, code, name, description, config, is_active, sort_order)
		VALUES ('ai_config', 'provider', 'AI Provider Configuration', 'Configuration for AI text generation', $1, true, 1)
		ON CONFLICT (category, code)
		DO UPDATE SET
			config = $1,
			updated_at = NOW()
	`, configJSON)

	if err != nil {
		return fmt.Errorf("failed to save AI config: %w", err)
	}

	return nil
}

// GetCacheTTL returns cache TTL as time.Duration
func (c *AIConfig) GetCacheTTL() time.Duration {
	return time.Duration(c.CacheTTLMinutes) * time.Minute
}

// GetTimeout returns timeout as time.Duration
func (c *AIConfig) GetTimeout() time.Duration {
	return time.Duration(c.TimeoutSeconds) * time.Second
}

// IsReady returns true if AI is properly configured and enabled
func (c *AIConfig) IsReady() bool {
	return c.Enabled && c.APIKey != "" && c.ProviderURL != ""
}
