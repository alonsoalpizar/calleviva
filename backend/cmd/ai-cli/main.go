package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"time"

	aiconfig "github.com/alonsoalpizar/calleviva/backend/internal/ai/config"
	"github.com/alonsoalpizar/calleviva/backend/internal/ai/orchestrator"
	"github.com/alonsoalpizar/calleviva/backend/internal/ai/providers"
	"github.com/alonsoalpizar/calleviva/backend/internal/config"
	"github.com/alonsoalpizar/calleviva/backend/internal/database"
)

func main() {
	// Flags
	useDB := flag.Bool("db", false, "Load config from database")
	apiKey := flag.String("key", "", "Anthropic API Key (overrides DB)")
	model := flag.String("model", "claude-sonnet-4-20250514", "Model name")
	prompt := flag.String("prompt", "Hola, ¿cómo estás?", "Prompt to send")
	limit := flag.Int("limit", 100, "Max tokens")
	flag.Parse()

	ctx := context.Background()
	var service *orchestrator.Service

	if *useDB {
		// Load from database
		fmt.Println("Loading config from database...")
		cfg := config.Load()
		if err := database.Connect(cfg.DBConnString()); err != nil {
			fmt.Printf("Database connection failed: %v\n", err)
			os.Exit(1)
		}
		defer database.Close()

		var err error
		service, err = orchestrator.NewService(ctx, database.Pool)
		if err != nil {
			fmt.Printf("Failed to create service: %v\n", err)
			os.Exit(1)
		}

		fmt.Printf("Config loaded: %+v\n", service.GetConfig())
	} else {
		// Use explicit config
		if *apiKey == "" {
			fmt.Println("No API Key provided. Using fallback provider only.")
		}

		aiCfg := &aiconfig.AIConfig{
			Enabled:         *apiKey != "",
			APIKey:          *apiKey,
			Model:           *model,
			ProviderURL:     "https://api.anthropic.com/v1/messages",
			MaxTokens:       *limit,
			Temperature:     0.7,
			TimeoutSeconds:  30,
			CacheEnabled:    true,
			CacheTTLMinutes: 5,
			FallbackEnabled: true,
		}

		service = orchestrator.NewServiceWithConfig(aiCfg)
	}

	// Run Generation
	requestConfig := providers.Config{
		MaxTokens: *limit,
	}

	fmt.Printf("\nSending prompt: %s\n", *prompt)
	fmt.Println("---")

	// First request
	start := time.Now()
	resp, err := service.GenerateText(ctx, *prompt, nil, requestConfig)
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		os.Exit(1)
	}
	duration := time.Since(start)

	fmt.Println("\n--- Response 1 ---")
	fmt.Printf("Text: %s\n", resp.Text)
	fmt.Printf("Provider: %s\n", resp.ProviderName)
	fmt.Printf("Model: %s\n", resp.ModelName)
	fmt.Printf("Cached: %v\n", resp.Cached)
	fmt.Printf("Tokens: %d (in: %d, out: %d)\n", resp.Usage.TotalTokens, resp.Usage.InputTokens, resp.Usage.OutputTokens)
	fmt.Printf("Time: %v\n", duration)

	// Second request (to test cache)
	fmt.Println("\n--- Response 2 (Cache Test) ---")
	start = time.Now()
	resp2, err := service.GenerateText(ctx, *prompt, nil, requestConfig)
	if err != nil {
		fmt.Printf("Error 2: %v\n", err)
	} else {
		fmt.Printf("Cached: %v\n", resp2.Cached)
		fmt.Printf("Time: %v\n", time.Since(start))
	}

	// Metrics
	fmt.Println("\n--- Metrics ---")
	metrics := service.GetMetrics()
	fmt.Printf("%+v\n", metrics)
}
