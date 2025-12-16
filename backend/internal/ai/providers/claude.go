package providers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	aiconfig "github.com/alonsoalpizar/calleviva/backend/internal/ai/config"
)

// ClaudeProvider implements Provider for Anthropic Claude
type ClaudeProvider struct {
	config *aiconfig.AIConfig
	client *http.Client
}

// NewClaudeProvider creates a new Claude provider from AIConfig
func NewClaudeProvider(config *aiconfig.AIConfig) *ClaudeProvider {
	timeout := config.GetTimeout()
	if timeout == 0 {
		timeout = 30 * time.Second
	}

	return &ClaudeProvider{
		config: config,
		client: &http.Client{Timeout: timeout},
	}
}

// NewClaudeProviderWithKey creates a provider with explicit key (for backwards compatibility)
func NewClaudeProviderWithKey(apiKey, model string) *ClaudeProvider {
	if model == "" {
		model = "claude-sonnet-4-20250514"
	}
	config := &aiconfig.AIConfig{
		Enabled:        true,
		APIKey:         apiKey,
		Model:          model,
		ProviderURL:    "https://api.anthropic.com/v1/messages",
		TimeoutSeconds: 30,
	}
	return NewClaudeProvider(config)
}

func (p *ClaudeProvider) Name() string {
	return "claude"
}

func (p *ClaudeProvider) IsAvailable(ctx context.Context) bool {
	return p.config != nil && p.config.APIKey != "" && p.config.Enabled
}

// Generate implements the generation logic for Claude
func (p *ClaudeProvider) Generate(ctx context.Context, req GenerateRequest) (*GenerateResponse, error) {
	if !p.IsAvailable(ctx) {
		return nil, fmt.Errorf("claude provider not available")
	}

	start := time.Now()

	// Use config defaults if not specified in request
	maxTokens := req.Config.MaxTokens
	if maxTokens == 0 {
		maxTokens = p.config.MaxTokens
	}

	temperature := req.Config.Temperature
	if temperature == 0 {
		temperature = p.config.Temperature
	}

	// Convert request to Anthropic format
	requestBody := map[string]interface{}{
		"model":       p.config.Model,
		"max_tokens":  maxTokens,
		"temperature": temperature,
		"messages": []map[string]string{
			{"role": "user", "content": req.UserPrompt},
		},
	}

	if req.SystemPrompt != "" {
		requestBody["system"] = req.SystemPrompt
	}

	if len(req.Config.StopSequences) > 0 {
		requestBody["stop_sequences"] = req.Config.StopSequences
	}

	jsonBody, err := json.Marshal(requestBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	// Use configured URL
	apiURL := p.config.ProviderURL
	if apiURL == "" {
		apiURL = "https://api.anthropic.com/v1/messages"
	}

	httpRequest, err := http.NewRequestWithContext(ctx, "POST", apiURL, bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	httpRequest.Header.Set("x-api-key", p.config.APIKey)
	httpRequest.Header.Set("anthropic-version", "2023-06-01")
	httpRequest.Header.Set("content-type", "application/json")

	resp, err := p.client.Do(httpRequest)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("anthropic API error: %s - %s", resp.Status, string(body))
	}

	var parsedResp struct {
		Content []struct {
			Text string `json:"text"`
		} `json:"content"`
		Usage struct {
			InputTokens  int `json:"input_tokens"`
			OutputTokens int `json:"output_tokens"`
		} `json:"usage"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&parsedResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	text := ""
	if len(parsedResp.Content) > 0 {
		text = parsedResp.Content[0].Text
	}

	return &GenerateResponse{
		Text: text,
		Usage: UsageStats{
			InputTokens:  parsedResp.Usage.InputTokens,
			OutputTokens: parsedResp.Usage.OutputTokens,
			TotalTokens:  parsedResp.Usage.InputTokens + parsedResp.Usage.OutputTokens,
		},
		ProviderName: p.Name(),
		ModelName:    p.config.Model,
		Duration:     time.Since(start),
	}, nil
}
