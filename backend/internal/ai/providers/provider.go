package providers

import (
	"context"
	"time"
)

// Config represents common configuration for AI requests
type Config struct {
	MaxTokens   int
	Temperature float64
	StopSequences []string
	Timeout     time.Duration
}

// GenerateRequest represents the input for text generation
type GenerateRequest struct {
	SystemPrompt string
	UserPrompt   string
	TaskID       string // For traceability
	Context      map[string]interface{}
	Config       Config
}

// GenerateResponse represents the output from the provider
type GenerateResponse struct {
	Text         string
	Usage        UsageStats
	Cached       bool
	ProviderName string
	ModelName    string
	Duration     time.Duration
}

// UsageStats tracks token usage
type UsageStats struct {
	InputTokens  int
	OutputTokens int
	TotalTokens  int
}

// Provider defines the interface for LLM providers
type Provider interface {
	// Name returns the provider identifier
	Name() string
	
	// Generate generates text based on the request
	Generate(ctx context.Context, req GenerateRequest) (*GenerateResponse, error)
	
	// IsAvailable checks if the provider is currently reachable/healthy
	IsAvailable(ctx context.Context) bool
}
