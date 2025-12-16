package orchestrator

import (
	"context"
	"fmt"
	"time"

	aiconfig "github.com/alonsoalpizar/calleviva/backend/internal/ai/config"
	"github.com/alonsoalpizar/calleviva/backend/internal/ai/cache"
	"github.com/alonsoalpizar/calleviva/backend/internal/ai/metrics"
	"github.com/alonsoalpizar/calleviva/backend/internal/ai/prompts"
	"github.com/alonsoalpizar/calleviva/backend/internal/ai/providers"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Service is the main entry point for AI operations
type Service struct {
	config           *aiconfig.AIConfig
	primaryProvider  providers.Provider
	fallbackProvider providers.Provider
	cache            *cache.MemoryCache
	metrics          *metrics.Tracker
	prompts          *prompts.PromptBuilder
	pool             *pgxpool.Pool
}

// NewService creates a new AI orchestrator from database config
func NewService(ctx context.Context, pool *pgxpool.Pool) (*Service, error) {
	// Load config from DB
	cfg, err := aiconfig.LoadFromDB(ctx, pool)
	if err != nil {
		return nil, fmt.Errorf("failed to load AI config: %w", err)
	}

	s := &Service{
		config:   cfg,
		cache:    cache.NewMemoryCache(),
		metrics:  metrics.NewTracker(),
		prompts:  prompts.NewBuilder(),
		pool:     pool,
	}

	// Setup providers based on config
	if cfg.IsReady() {
		s.primaryProvider = providers.NewClaudeProvider(cfg)
	}

	// Always have fallback
	s.fallbackProvider = providers.NewFallbackProvider()

	// Start cache cleanup routine
	go s.startCacheCleanup()

	return s, nil
}

// NewServiceWithConfig creates a service with explicit config (for testing)
func NewServiceWithConfig(cfg *aiconfig.AIConfig) *Service {
	s := &Service{
		config:   cfg,
		cache:    cache.NewMemoryCache(),
		metrics:  metrics.NewTracker(),
		prompts:  prompts.NewBuilder(),
	}

	if cfg.IsReady() {
		s.primaryProvider = providers.NewClaudeProvider(cfg)
	}
	s.fallbackProvider = providers.NewFallbackProvider()

	return s
}

// ReloadConfig reloads configuration from database
func (s *Service) ReloadConfig(ctx context.Context) error {
	if s.pool == nil {
		return fmt.Errorf("no database connection")
	}

	cfg, err := aiconfig.LoadFromDB(ctx, s.pool)
	if err != nil {
		return err
	}

	s.config = cfg

	// Recreate primary provider with new config
	if cfg.IsReady() {
		s.primaryProvider = providers.NewClaudeProvider(cfg)
	} else {
		s.primaryProvider = nil
	}

	return nil
}

// startCacheCleanup runs periodic cache cleanup
func (s *Service) startCacheCleanup() {
	ticker := time.NewTicker(10 * time.Minute)
	for range ticker.C {
		s.cache.Clean()
	}
}

// RegisterTemplate registers a prompt template
func (s *Service) RegisterTemplate(name, template string) error {
	return s.prompts.RegisterTemplate(name, template)
}

// GenerateText is the high-level method to generate text
func (s *Service) GenerateText(ctx context.Context, templateName string, data interface{}, config providers.Config) (*providers.GenerateResponse, error) {
	// Check if AI is enabled
	if !s.config.Enabled {
		if s.config.FallbackEnabled {
			return s.fallbackProvider.Generate(ctx, providers.GenerateRequest{
				UserPrompt: templateName,
				Config:     config,
			})
		}
		return nil, fmt.Errorf("AI is disabled")
	}

	// Build Prompt
	userPrompt, err := s.prompts.Build(templateName, data)
	if err != nil || userPrompt == "" {
		// Try treating as raw string
		userPrompt, err = s.prompts.SimpleBuild(templateName, data)
		if err != nil {
			return nil, fmt.Errorf("prompt build failed: %w", err)
		}
	}

	systemPrompt := "" // Could be configured per template

	// Check Cache
	cacheKey := s.cache.GenerateKey(systemPrompt, userPrompt)
	if s.config.CacheEnabled {
		if val, found := s.cache.Get(cacheKey); found {
			return &providers.GenerateResponse{
				Text:      val,
				Cached:    true,
				ModelName: "cache",
			}, nil
		}
	}

	req := providers.GenerateRequest{
		SystemPrompt: systemPrompt,
		UserPrompt:   userPrompt,
		Config:       config,
	}

	// Apply timeout from config
	if s.config.TimeoutSeconds > 0 {
		var cancel context.CancelFunc
		ctx, cancel = context.WithTimeout(ctx, s.config.GetTimeout())
		defer cancel()
	}

	// Try Primary Provider
	var resp *providers.GenerateResponse
	var tokenErr error

	if s.primaryProvider != nil && s.primaryProvider.IsAvailable(ctx) {
		resp, tokenErr = s.primaryProvider.Generate(ctx, req)
		if tokenErr == nil {
			s.metrics.RecordRequest(s.primaryProvider.Name(), resp.Usage.TotalTokens)
		} else {
			s.metrics.RecordError(s.primaryProvider.Name())
		}
	}

	// Fallback if needed
	if (resp == nil || tokenErr != nil) && s.config.FallbackEnabled {
		resp, err = s.fallbackProvider.Generate(ctx, req)
		if err != nil {
			s.metrics.RecordError(s.fallbackProvider.Name())
			return nil, fmt.Errorf("all providers failed: %w", err)
		}
		s.metrics.RecordRequest(s.fallbackProvider.Name(), resp.Usage.TotalTokens)
	} else if resp == nil {
		return nil, fmt.Errorf("primary provider failed and fallback disabled: %w", tokenErr)
	}

	// Update Cache
	if s.config.CacheEnabled && resp != nil && !resp.Cached {
		s.cache.Set(cacheKey, resp.Text, s.config.GetCacheTTL())
	}

	return resp, nil
}

// GetMetrics returns current metrics
func (s *Service) GetMetrics() map[string]interface{} {
	return s.metrics.GetStats()
}

// GetConfig returns current configuration (without sensitive data)
func (s *Service) GetConfig() map[string]interface{} {
	return map[string]interface{}{
		"enabled":       s.config.Enabled,
		"model":         s.config.Model,
		"max_tokens":    s.config.MaxTokens,
		"cache_enabled": s.config.CacheEnabled,
		"is_ready":      s.config.IsReady(),
	}
}

// IsReady returns true if AI is properly configured
func (s *Service) IsReady() bool {
	return s.config.IsReady()
}
