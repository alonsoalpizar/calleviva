// CalleViva API Server
// ¡La calle está viva!

package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"
)

func main() {
	// Banner
	printBanner()

	// Cargar .env
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Configuración
	port := getEnv("PORT", "8080")
	env := getEnv("ENV", "development")

	// Router
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))

	// CORS
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{getEnv("FRONTEND_URL", "http://localhost:5173")},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-Request-ID"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Rutas
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"name":"CalleViva API","status":"running","message":"¡La calle está viva!"}`))
	})

	// Health check
	r.Get("/api/v1/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"healthy","timestamp":"` + time.Now().Format(time.RFC3339) + `"}`))
	})

	// API v1
	r.Route("/api/v1", func(r chi.Router) {
		// Auth
		r.Route("/auth", func(r chi.Router) {
			r.Post("/register", handleNotImplemented)
			r.Post("/login", handleNotImplemented)
			r.Post("/logout", handleNotImplemented)
			r.Get("/me", handleNotImplemented)
		})

		// Games
		r.Route("/games", func(r chi.Router) {
			r.Post("/", handleNotImplemented)
			r.Get("/", handleNotImplemented)
			r.Get("/{gameID}", handleNotImplemented)
			r.Delete("/{gameID}", handleNotImplemented)

			// Gameplay
			r.Get("/{gameID}/day", handleNotImplemented)
			r.Post("/{gameID}/market/buy", handleNotImplemented)
			r.Post("/{gameID}/location/set", handleNotImplemented)
			r.Post("/{gameID}/menu/configure", handleNotImplemented)
			r.Post("/{gameID}/day/start", handleNotImplemented)
			r.Get("/{gameID}/day/results", handleNotImplemented)
		})

		// Worlds (static data)
		r.Route("/worlds", func(r chi.Router) {
			r.Get("/{worldType}/products", handleNotImplemented)
			r.Get("/{worldType}/locations", handleNotImplemented)
			r.Get("/{worldType}/events", handleNotImplemented)
		})
	})

	// Server
	server := &http.Server{
		Addr:         ":" + port,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Graceful shutdown
	done := make(chan os.Signal, 1)
	signal.Notify(done, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		log.Printf("🚚 CalleViva API running on http://localhost:%s", port)
		log.Printf("📍 Environment: %s", env)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	<-done
	log.Println("\n🛑 Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("✅ Server stopped gracefully")
}

func handleNotImplemented(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusNotImplemented)
	w.Write([]byte(`{"error":"Not implemented yet","message":"Coming soon!"}`))
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

func printBanner() {
	banner := `
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║    🚚  CalleViva API Server                               ║
║        ¡La calle está viva!                               ║
║                                                           ║
║    Made with ❤️  in Costa Rica                            ║
║    ✨ Inspirado por Nacho ✨                               ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`
	fmt.Println(banner)
}
