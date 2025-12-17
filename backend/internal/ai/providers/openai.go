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

// OpenAIProvider implements Provider for OpenAI-compatible APIs
// Works with: OpenAI, Groq, Together, Ollama, Mistral, Perplexity, and more
type OpenAIProvider struct {
	config *aiconfig.AIConfig
	client *http.Client
}

// NewOpenAIProvider creates a new OpenAI-compatible provider from AIConfig
func NewOpenAIProvider(config *aiconfig.AIConfig) *OpenAIProvider {
	timeout := config.GetTimeout()
	if timeout == 0 {
		timeout = 30 * time.Second
	}

	return &OpenAIProvider{
		config: config,
		client: &http.Client{Timeout: timeout},
	}
}

func (p *OpenAIProvider) Name() string {
	return "openai"
}

func (p *OpenAIProvider) IsAvailable(ctx context.Context) bool {
	return p.config != nil && p.config.APIKey != "" && p.config.Enabled
}

// Generate implements the generation logic for OpenAI-compatible APIs
func (p *OpenAIProvider) Generate(ctx context.Context, req GenerateRequest) (*GenerateResponse, error) {
	if !p.IsAvailable(ctx) {
		return nil, fmt.Errorf("openai provider not available")
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

	// Build messages array (OpenAI format)
	messages := []map[string]string{}

	if req.SystemPrompt != "" {
		messages = append(messages, map[string]string{
			"role":    "system",
			"content": req.SystemPrompt,
		})
	}

	messages = append(messages, map[string]string{
		"role":    "user",
		"content": req.UserPrompt,
	})

	// Convert request to OpenAI format
	requestBody := map[string]interface{}{
		"model":       p.config.Model,
		"max_tokens":  maxTokens,
		"temperature": temperature,
		"messages":    messages,
	}

	if len(req.Config.StopSequences) > 0 {
		requestBody["stop"] = req.Config.StopSequences
	}

	jsonBody, err := json.Marshal(requestBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	// Use configured URL - default to OpenAI
	apiURL := p.config.ProviderURL
	if apiURL == "" {
		apiURL = "https://api.openai.com/v1/chat/completions"
	}

	httpRequest, err := http.NewRequestWithContext(ctx, "POST", apiURL, bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Standard Bearer auth for OpenAI-compatible APIs
	httpRequest.Header.Set("Authorization", "Bearer "+p.config.APIKey)
	httpRequest.Header.Set("Content-Type", "application/json")

	resp, err := p.client.Do(httpRequest)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("API error: %s - %s", resp.Status, string(body))
	}

	var parsedResp OpenAIResponse
	if err := json.NewDecoder(resp.Body).Decode(&parsedResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	text := ""
	if len(parsedResp.Choices) > 0 {
		text = parsedResp.Choices[0].Message.Content
	}

	return &GenerateResponse{
		Text: text,
		Usage: UsageStats{
			InputTokens:  parsedResp.Usage.PromptTokens,
			OutputTokens: parsedResp.Usage.CompletionTokens,
			TotalTokens:  parsedResp.Usage.TotalTokens,
		},
		ProviderName: p.Name(),
		ModelName:    parsedResp.Model,
		Duration:     time.Since(start),
	}, nil
}

// OpenAI API response structure
type OpenAIResponse struct {
	ID      string `json:"id"`
	Object  string `json:"object"`
	Created int64  `json:"created"`
	Model   string `json:"model"`
	Choices []struct {
		Index   int `json:"index"`
		Message struct {
			Role    string `json:"role"`
			Content string `json:"content"`
		} `json:"message"`
		FinishReason string `json:"finish_reason"`
	} `json:"choices"`
	Usage struct {
		PromptTokens     int `json:"prompt_tokens"`
		CompletionTokens int `json:"completion_tokens"`
		TotalTokens      int `json:"total_tokens"`
	} `json:"usage"`
}

// Common provider URLs for reference (documentation)
// OpenAI:     https://api.openai.com/v1/chat/completions
// Groq:       https://api.groq.com/openai/v1/chat/completions
// Together:   https://api.together.xyz/v1/chat/completions
// Ollama:     http://localhost:11434/v1/chat/completions
// Mistral:    https://api.mistral.ai/v1/chat/completions
// Perplexity: https://api.perplexity.ai/chat/completions
// DeepSeek:   https://api.deepseek.com/v1/chat/completions
