package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	aiconfig "github.com/alonsoalpizar/calleviva/backend/internal/ai/config"
	"github.com/alonsoalpizar/calleviva/backend/internal/ai/orchestrator"
	"github.com/alonsoalpizar/calleviva/backend/internal/ai/providers"
	"github.com/alonsoalpizar/calleviva/backend/internal/database"
)

// AIAdminHandler handles AI configuration endpoints
type AIAdminHandler struct {
	service *orchestrator.Service
}

// NewAIAdminHandler creates a new AI admin handler
func NewAIAdminHandler() *AIAdminHandler {
	return &AIAdminHandler{}
}

// SetService sets the orchestrator service (call after service is initialized)
func (h *AIAdminHandler) SetService(service *orchestrator.Service) {
	h.service = service
}

// ConfigResponse is the response for GET /admin/ai/config
type ConfigResponse struct {
	Enabled              bool   `json:"enabled"`
	ProviderType         string `json:"provider_type"` // "openai" or "anthropic"
	ProviderURL          string `json:"provider_url"`
	Model                string `json:"model"`
	MaxTokens            int    `json:"max_tokens"`
	Temperature          float64 `json:"temperature"`
	TimeoutSeconds       int     `json:"timeout_seconds"`
	CacheEnabled         bool    `json:"cache_enabled"`
	CacheTTLMinutes      int     `json:"cache_ttl_minutes"`
	MaxRequestsPerMinute int     `json:"max_requests_per_minute"`
	FallbackEnabled      bool    `json:"fallback_enabled"`
	HasAPIKey            bool    `json:"has_api_key"`
	IsReady              bool    `json:"is_ready"`
}

// UpdateConfigRequest is the request for PATCH /admin/ai/config
type UpdateConfigRequest struct {
	Enabled              *bool    `json:"enabled,omitempty"`
	ProviderType         *string  `json:"provider_type,omitempty"` // "openai" or "anthropic"
	ProviderURL          *string  `json:"provider_url,omitempty"`
	Model                *string  `json:"model,omitempty"`
	MaxTokens            *int     `json:"max_tokens,omitempty"`
	Temperature          *float64 `json:"temperature,omitempty"`
	TimeoutSeconds       *int     `json:"timeout_seconds,omitempty"`
	CacheEnabled         *bool    `json:"cache_enabled,omitempty"`
	CacheTTLMinutes      *int     `json:"cache_ttl_minutes,omitempty"`
	MaxRequestsPerMinute *int     `json:"max_requests_per_minute,omitempty"`
	FallbackEnabled      *bool    `json:"fallback_enabled,omitempty"`
}

// SetAPIKeyRequest is the request for POST /admin/ai/apikey
type SetAPIKeyRequest struct {
	APIKey string `json:"api_key"`
}

// TestResponse is the response for POST /admin/ai/test
type TestResponse struct {
	Success    bool   `json:"success"`
	Message    string `json:"message"`
	Model      string `json:"model,omitempty"`
	ResponseMS int64  `json:"response_ms,omitempty"`
}

// HandleGetConfig returns current AI configuration (without sensitive data)
func (h *AIAdminHandler) HandleGetConfig(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	cfg, err := aiconfig.LoadFromDB(ctx, database.Pool)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to load AI config")
		return
	}

	resp := ConfigResponse{
		Enabled:              cfg.Enabled,
		ProviderType:         string(cfg.GetProviderType()),
		ProviderURL:          cfg.ProviderURL,
		Model:                cfg.Model,
		MaxTokens:            cfg.MaxTokens,
		Temperature:          cfg.Temperature,
		TimeoutSeconds:       cfg.TimeoutSeconds,
		CacheEnabled:         cfg.CacheEnabled,
		CacheTTLMinutes:      cfg.CacheTTLMinutes,
		MaxRequestsPerMinute: cfg.MaxRequestsPerMinute,
		FallbackEnabled:      cfg.FallbackEnabled,
		HasAPIKey:            cfg.APIKey != "",
		IsReady:              cfg.IsReady(),
	}

	respondJSON(w, http.StatusOK, resp)
}

// HandleUpdateConfig updates AI configuration
func (h *AIAdminHandler) HandleUpdateConfig(w http.ResponseWriter, r *http.Request) {
	var req UpdateConfigRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	// Load current config
	cfg, err := aiconfig.LoadFromDB(ctx, database.Pool)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to load AI config")
		return
	}

	// Apply updates
	if req.Enabled != nil {
		cfg.Enabled = *req.Enabled
	}
	if req.ProviderType != nil {
		cfg.ProviderType = aiconfig.ProviderType(*req.ProviderType)
	}
	if req.ProviderURL != nil {
		cfg.ProviderURL = *req.ProviderURL
	}
	if req.Model != nil {
		cfg.Model = *req.Model
	}
	if req.MaxTokens != nil {
		cfg.MaxTokens = *req.MaxTokens
	}
	if req.Temperature != nil {
		cfg.Temperature = *req.Temperature
	}
	if req.TimeoutSeconds != nil {
		cfg.TimeoutSeconds = *req.TimeoutSeconds
	}
	if req.CacheEnabled != nil {
		cfg.CacheEnabled = *req.CacheEnabled
	}
	if req.CacheTTLMinutes != nil {
		cfg.CacheTTLMinutes = *req.CacheTTLMinutes
	}
	if req.MaxRequestsPerMinute != nil {
		cfg.MaxRequestsPerMinute = *req.MaxRequestsPerMinute
	}
	if req.FallbackEnabled != nil {
		cfg.FallbackEnabled = *req.FallbackEnabled
	}

	// Save
	if err := aiconfig.SaveToDB(ctx, database.Pool, cfg); err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to save AI config")
		return
	}

	// Reload service if available
	if h.service != nil {
		h.service.ReloadConfig(ctx)
	}

	// Return updated config
	resp := ConfigResponse{
		Enabled:              cfg.Enabled,
		ProviderType:         string(cfg.GetProviderType()),
		ProviderURL:          cfg.ProviderURL,
		Model:                cfg.Model,
		MaxTokens:            cfg.MaxTokens,
		Temperature:          cfg.Temperature,
		TimeoutSeconds:       cfg.TimeoutSeconds,
		CacheEnabled:         cfg.CacheEnabled,
		CacheTTLMinutes:      cfg.CacheTTLMinutes,
		MaxRequestsPerMinute: cfg.MaxRequestsPerMinute,
		FallbackEnabled:      cfg.FallbackEnabled,
		HasAPIKey:            cfg.APIKey != "",
		IsReady:              cfg.IsReady(),
	}

	respondJSON(w, http.StatusOK, resp)
}

// HandleSetAPIKey sets the API key (encrypted)
func (h *AIAdminHandler) HandleSetAPIKey(w http.ResponseWriter, r *http.Request) {
	var req SetAPIKeyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.APIKey == "" {
		respondError(w, http.StatusBadRequest, "API key is required")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	// Load current config
	cfg, err := aiconfig.LoadFromDB(ctx, database.Pool)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to load AI config")
		return
	}

	// Set API key
	cfg.APIKey = req.APIKey

	// Save (will encrypt the key)
	if err := aiconfig.SaveToDB(ctx, database.Pool, cfg); err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to save API key")
		return
	}

	// Reload service if available
	if h.service != nil {
		h.service.ReloadConfig(ctx)
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "API key saved successfully",
	})
}

// HandleTest tests the AI connection
func (h *AIAdminHandler) HandleTest(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 30*time.Second)
	defer cancel()

	// Load config
	cfg, err := aiconfig.LoadFromDB(ctx, database.Pool)
	if err != nil {
		respondJSON(w, http.StatusOK, TestResponse{
			Success: false,
			Message: "Failed to load AI config",
		})
		return
	}

	if !cfg.IsReady() {
		respondJSON(w, http.StatusOK, TestResponse{
			Success: false,
			Message: "AI not configured (missing API key or disabled)",
		})
		return
	}

	// Create a temporary service for testing
	testService := orchestrator.NewServiceWithConfig(cfg)

	start := time.Now()
	resp, err := testService.GenerateText(ctx, "Responde solo con: OK", nil, providers.Config{
		MaxTokens: 10,
	})

	duration := time.Since(start)

	if err != nil {
		respondJSON(w, http.StatusOK, TestResponse{
			Success: false,
			Message: "Connection failed: " + err.Error(),
		})
		return
	}

	respondJSON(w, http.StatusOK, TestResponse{
		Success:    true,
		Message:    "Connection successful! Response: " + resp.Text,
		Model:      resp.ModelName,
		ResponseMS: duration.Milliseconds(),
	})
}

// Helper functions
func respondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func respondError(w http.ResponseWriter, status int, message string) {
	respondJSON(w, status, map[string]string{"error": message})
}
