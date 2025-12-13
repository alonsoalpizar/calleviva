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

	"github.com/alonsoalpizar/calleviva/backend/internal/auth"
	"github.com/alonsoalpizar/calleviva/backend/internal/config"
	"github.com/alonsoalpizar/calleviva/backend/internal/database"
	"github.com/alonsoalpizar/calleviva/backend/internal/games"
	"github.com/alonsoalpizar/calleviva/backend/internal/parameters"
	"github.com/alonsoalpizar/calleviva/backend/internal/players"
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
	cfg := config.Load()

	// Conectar a PostgreSQL
	if err := database.Connect(cfg.DBConnString()); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()

	// Inicializar JWT
	auth.InitJWT(cfg.JWTSecret, cfg.JWTExpiry())

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
		AllowedOrigins:   []string{cfg.FrontendURL, "https://calleviva.club"},
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
		// Auth (público)
		r.Route("/auth", func(r chi.Router) {
			r.Post("/register", auth.HandleRegister)
			r.Post("/login", auth.HandleLogin)
			r.Get("/me", auth.HandleMe)
		})

		// Games (protegido)
		r.Route("/games", func(r chi.Router) {
			r.Use(auth.AuthMiddleware)
			r.Post("/", games.HandleCreate)
			r.Get("/", games.HandleList)
			r.Get("/{gameID}", games.HandleGet)
			r.Patch("/{gameID}", games.HandleUpdate)
			r.Delete("/{gameID}", games.HandleDelete)

			// Gameplay (futuro)
			r.Get("/{gameID}/day", handleNotImplemented)
			r.Post("/{gameID}/market/buy", handleNotImplemented)
			r.Post("/{gameID}/location/set", handleNotImplemented)
			r.Post("/{gameID}/menu/configure", handleNotImplemented)
			r.Post("/{gameID}/day/start", handleNotImplemented)
			r.Get("/{gameID}/day/results", handleNotImplemented)
		})

		// Parameters (público - solo lectura)
		r.Route("/parameters", func(r chi.Router) {
			r.Get("/", parameters.HandleList)
			r.Get("/categories", parameters.HandleListCategories)
			r.Get("/{id}", parameters.HandleGet)
		})

		// Worlds (público - datos estáticos)
		r.Route("/worlds", func(r chi.Router) {
			r.Get("/{worldType}/products", handleNotImplemented)
			r.Get("/{worldType}/locations", handleNotImplemented)
			r.Get("/{worldType}/events", handleNotImplemented)
		})

		// Admin (protegido - solo admins)
		r.Route("/admin", func(r chi.Router) {
			r.Use(auth.AuthMiddleware)
			r.Use(auth.AdminMiddleware)

			// CRUD Parameters
			r.Route("/parameters", func(r chi.Router) {
				r.Get("/", parameters.HandleList)
				r.Get("/categories", parameters.HandleListCategories)
				r.Get("/{id}", parameters.HandleGet)
				r.Post("/", parameters.HandleCreate)
				r.Patch("/{id}", parameters.HandleUpdate)
				r.Delete("/{id}", parameters.HandleDelete)
			})

			// CRUD Players
			r.Route("/players", func(r chi.Router) {
				r.Get("/", players.HandleList)
				r.Get("/{id}", players.HandleGet)
				r.Patch("/{id}", players.HandleUpdate)
				r.Delete("/{id}", players.HandleDelete)
			})

			// Dashboard stats (futuro)
			r.Get("/stats", handleNotImplemented)
		})
	})

	// Server
	server := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Graceful shutdown
	done := make(chan os.Signal, 1)
	signal.Notify(done, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		log.Printf("🚚 CalleViva API running on http://localhost:%s", cfg.Port)
		log.Printf("📍 Environment: %s", cfg.Environment)
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
