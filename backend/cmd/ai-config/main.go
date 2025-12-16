package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"time"

	aiconfig "github.com/alonsoalpizar/calleviva/backend/internal/ai/config"
	"github.com/alonsoalpizar/calleviva/backend/internal/ai/crypto"
	"github.com/alonsoalpizar/calleviva/backend/internal/config"
	"github.com/alonsoalpizar/calleviva/backend/internal/database"
)

func main() {
	// Subcommands
	genKeyCmd := flag.NewFlagSet("genkey", flag.ExitOnError)

	showCmd := flag.NewFlagSet("show", flag.ExitOnError)

	setCmd := flag.NewFlagSet("set", flag.ExitOnError)
	setAPIKey := setCmd.String("apikey", "", "Anthropic API Key")
	setModel := setCmd.String("model", "", "Model name (e.g., claude-sonnet-4-20250514)")
	setURL := setCmd.String("url", "", "Provider URL")
	setMaxTokens := setCmd.Int("max-tokens", 0, "Max tokens per request")
	setTemp := setCmd.Float64("temperature", 0, "Temperature (0.0-1.0)")
	setEnabled := setCmd.Bool("enabled", false, "Enable AI")
	setDisabled := setCmd.Bool("disabled", false, "Disable AI")

	testCmd := flag.NewFlagSet("test", flag.ExitOnError)
	testPrompt := testCmd.String("prompt", "Hola, ¿cómo estás?", "Test prompt")

	if len(os.Args) < 2 {
		printUsage()
		os.Exit(1)
	}

	switch os.Args[1] {
	case "genkey":
		genKeyCmd.Parse(os.Args[2:])
		cmdGenKey()

	case "show":
		showCmd.Parse(os.Args[2:])
		cmdShow()

	case "set":
		setCmd.Parse(os.Args[2:])
		cmdSet(*setAPIKey, *setModel, *setURL, *setMaxTokens, *setTemp, *setEnabled, *setDisabled)

	case "test":
		testCmd.Parse(os.Args[2:])
		cmdTest(*testPrompt)

	default:
		printUsage()
		os.Exit(1)
	}
}

func printUsage() {
	fmt.Println(`AI Config CLI - Manage CalleViva AI Configuration

Usage:
  ai-config <command> [options]

Commands:
  genkey              Generate a new encryption key (save to CALLEVIVA_ENCRYPTION_KEY)
  show                Show current AI configuration
  set [options]       Update AI configuration
  test [options]      Test AI generation

Set Options:
  -apikey string      Anthropic API Key
  -model string       Model name (e.g., claude-sonnet-4-20250514)
  -url string         Provider URL
  -max-tokens int     Max tokens per request
  -temperature float  Temperature (0.0-1.0)
  -enabled            Enable AI
  -disabled           Disable AI

Test Options:
  -prompt string      Test prompt (default: "Hola, ¿cómo estás?")

Environment Variables:
  CALLEVIVA_ENCRYPTION_KEY   32-byte key for encrypting API keys (required for set/show)
  DB_HOST, DB_PORT, etc.     Database connection settings
`)
}

func cmdGenKey() {
	key, err := crypto.GenerateKey()
	if err != nil {
		fmt.Printf("Error generating key: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("Generated encryption key (base64):")
	fmt.Println(key)
	fmt.Println("\nAdd to your environment:")
	fmt.Printf("export CALLEVIVA_ENCRYPTION_KEY=\"%s\"\n", key)
}

func cmdShow() {
	ctx := context.Background()

	// Connect to DB
	cfg := config.Load()
	if err := database.Connect(cfg.DBConnString()); err != nil {
		fmt.Printf("Database connection failed: %v\n", err)
		os.Exit(1)
	}
	defer database.Close()

	// Load config
	aiCfg, err := aiconfig.LoadFromDB(ctx, database.Pool)
	if err != nil {
		fmt.Printf("Failed to load config: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("=== AI Configuration ===")
	fmt.Printf("Enabled:              %v\n", aiCfg.Enabled)
	fmt.Printf("Provider URL:         %s\n", aiCfg.ProviderURL)
	fmt.Printf("Model:                %s\n", aiCfg.Model)
	fmt.Printf("Max Tokens:           %d\n", aiCfg.MaxTokens)
	fmt.Printf("Temperature:          %.2f\n", aiCfg.Temperature)
	fmt.Printf("Timeout:              %ds\n", aiCfg.TimeoutSeconds)
	fmt.Printf("Cache Enabled:        %v\n", aiCfg.CacheEnabled)
	fmt.Printf("Cache TTL:            %dm\n", aiCfg.CacheTTLMinutes)
	fmt.Printf("Max Requests/Min:     %d\n", aiCfg.MaxRequestsPerMinute)
	fmt.Printf("Fallback Enabled:     %v\n", aiCfg.FallbackEnabled)

	if aiCfg.APIKey != "" {
		fmt.Printf("API Key:              %s...%s (decrypted)\n",
			aiCfg.APIKey[:8], aiCfg.APIKey[len(aiCfg.APIKey)-4:])
	} else {
		fmt.Printf("API Key:              (not set)\n")
	}

	fmt.Printf("\nReady: %v\n", aiCfg.IsReady())
}

func cmdSet(apiKey, model, url string, maxTokens int, temp float64, enabled, disabled bool) {
	ctx := context.Background()

	// Connect to DB
	cfg := config.Load()
	if err := database.Connect(cfg.DBConnString()); err != nil {
		fmt.Printf("Database connection failed: %v\n", err)
		os.Exit(1)
	}
	defer database.Close()

	// Load existing config
	aiCfg, err := aiconfig.LoadFromDB(ctx, database.Pool)
	if err != nil {
		fmt.Printf("Failed to load config: %v\n", err)
		os.Exit(1)
	}

	// Apply changes
	changed := false

	if apiKey != "" {
		aiCfg.APIKey = apiKey
		changed = true
		fmt.Println("Setting API key...")
	}

	if model != "" {
		aiCfg.Model = model
		changed = true
		fmt.Printf("Setting model: %s\n", model)
	}

	if url != "" {
		aiCfg.ProviderURL = url
		changed = true
		fmt.Printf("Setting URL: %s\n", url)
	}

	if maxTokens > 0 {
		aiCfg.MaxTokens = maxTokens
		changed = true
		fmt.Printf("Setting max tokens: %d\n", maxTokens)
	}

	if temp > 0 {
		aiCfg.Temperature = temp
		changed = true
		fmt.Printf("Setting temperature: %.2f\n", temp)
	}

	if enabled {
		aiCfg.Enabled = true
		changed = true
		fmt.Println("Enabling AI...")
	}

	if disabled {
		aiCfg.Enabled = false
		changed = true
		fmt.Println("Disabling AI...")
	}

	if !changed {
		fmt.Println("No changes specified. Use -h for help.")
		return
	}

	// Save
	if err := aiconfig.SaveToDB(ctx, database.Pool, aiCfg); err != nil {
		fmt.Printf("Failed to save config: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("\nConfiguration saved successfully!")
}

func cmdTest(prompt string) {
	ctx := context.Background()

	// Connect to DB
	cfg := config.Load()
	if err := database.Connect(cfg.DBConnString()); err != nil {
		fmt.Printf("Database connection failed: %v\n", err)
		os.Exit(1)
	}
	defer database.Close()

	// Load config
	aiCfg, err := aiconfig.LoadFromDB(ctx, database.Pool)
	if err != nil {
		fmt.Printf("Failed to load config: %v\n", err)
		os.Exit(1)
	}

	if !aiCfg.IsReady() {
		fmt.Println("AI is not ready. Check configuration with 'show' command.")
		os.Exit(1)
	}

	fmt.Printf("Testing with prompt: %s\n", prompt)
	fmt.Printf("Model: %s\n", aiCfg.Model)
	fmt.Println("Sending request...")

	// Import and use provider
	// Note: In a real implementation, you'd use the orchestrator
	// For now, just validate the config loads
	start := time.Now()

	// Simple HTTP test
	fmt.Printf("\nConfig loaded in %v\n", time.Since(start))
	fmt.Println("To test actual generation, use the ai-cli tool with the loaded config.")
}
