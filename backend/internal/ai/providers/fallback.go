package providers

import (
	"context"
	"math/rand"
	"time"
)

// FallbackProvider provides canned responses
type FallbackProvider struct{}

func NewFallbackProvider() *FallbackProvider {
	return &FallbackProvider{}
}

func (p *FallbackProvider) Name() string {
	return "fallback"
}

func (p *FallbackProvider) IsAvailable(ctx context.Context) bool {
	return true
}

func (p *FallbackProvider) Generate(ctx context.Context, req GenerateRequest) (*GenerateResponse, error) {
	start := time.Now()

	// Simulate some work
	time.Sleep(100 * time.Millisecond)

	responses := []string{
		"¡Pura vida! (Fallback)",
		"Todo bien por dicha. (Fallback)",
		"¿Al chile? (Fallback)",
		"Diay mae, así son las cosas. (Fallback)",
	}

	text := responses[rand.Intn(len(responses))]

	return &GenerateResponse{
		Text: text,
		Usage: UsageStats{
			InputTokens:  10,
			OutputTokens: 5,
			TotalTokens:  15,
		},
		ProviderName: p.Name(),
		ModelName:    "heuristic-v1",
		Duration:     time.Since(start),
	}, nil
}
