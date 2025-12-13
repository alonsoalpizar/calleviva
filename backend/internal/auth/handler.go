package auth

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/alonsoalpizar/calleviva/backend/internal/database"
	"github.com/alonsoalpizar/calleviva/backend/internal/models"
	"golang.org/x/crypto/bcrypt"
)

func HandleRegister(w http.ResponseWriter, r *http.Request) {
	var req models.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validación básica
	if req.Email == "" || req.Password == "" {
		respondError(w, http.StatusBadRequest, "Email and password are required")
		return
	}

	if len(req.Password) < 6 {
		respondError(w, http.StatusBadRequest, "Password must be at least 6 characters")
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to process password")
		return
	}

	// Insertar jugador
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var player models.Player
	var displayName *string
	if req.DisplayName != "" {
		displayName = &req.DisplayName
	}

	err = database.Pool.QueryRow(ctx, `
		INSERT INTO players (email, password_hash, display_name)
		VALUES ($1, $2, $3)
		RETURNING id, email, display_name, avatar_url, is_admin, created_at, updated_at
	`, req.Email, string(hashedPassword), displayName).Scan(
		&player.ID, &player.Email, &player.DisplayName,
		&player.AvatarURL, &player.IsAdmin, &player.CreatedAt, &player.UpdatedAt,
	)

	if err != nil {
		if strings.Contains(err.Error(), "duplicate key") || strings.Contains(err.Error(), "unique constraint") {
			respondError(w, http.StatusConflict, "Email already exists")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to create player")
		return
	}

	// Generar token
	token, err := GenerateToken(player.ID, player.Email, player.IsAdmin)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to generate token")
		return
	}

	respondJSON(w, http.StatusCreated, models.AuthResponse{
		Token:  token,
		Player: &player,
	})
}

func HandleLogin(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Email == "" || req.Password == "" {
		respondError(w, http.StatusBadRequest, "Email and password are required")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var player models.Player
	err := database.Pool.QueryRow(ctx, `
		SELECT id, email, password_hash, display_name, avatar_url, is_admin, created_at, updated_at
		FROM players
		WHERE email = $1 AND deleted_at IS NULL
	`, req.Email).Scan(
		&player.ID, &player.Email, &player.PasswordHash,
		&player.DisplayName, &player.AvatarURL, &player.IsAdmin,
		&player.CreatedAt, &player.UpdatedAt,
	)

	if err != nil {
		respondError(w, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	// Verificar password
	if err := bcrypt.CompareHashAndPassword([]byte(player.PasswordHash), []byte(req.Password)); err != nil {
		respondError(w, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	// Generar token
	token, err := GenerateToken(player.ID, player.Email, player.IsAdmin)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to generate token")
		return
	}

	respondJSON(w, http.StatusOK, models.AuthResponse{
		Token:  token,
		Player: &player,
	})
}

func HandleMe(w http.ResponseWriter, r *http.Request) {
	// Extraer token del header
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		respondError(w, http.StatusUnauthorized, "Authorization header required")
		return
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	if tokenString == authHeader {
		respondError(w, http.StatusUnauthorized, "Invalid authorization format")
		return
	}

	claims, err := ValidateToken(tokenString)
	if err != nil {
		respondError(w, http.StatusUnauthorized, "Invalid or expired token")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var player models.Player
	err = database.Pool.QueryRow(ctx, `
		SELECT id, email, display_name, avatar_url, is_admin, created_at, updated_at
		FROM players
		WHERE id = $1 AND deleted_at IS NULL
	`, claims.PlayerID).Scan(
		&player.ID, &player.Email, &player.DisplayName,
		&player.AvatarURL, &player.IsAdmin, &player.CreatedAt, &player.UpdatedAt,
	)

	if err != nil {
		respondError(w, http.StatusNotFound, "Player not found")
		return
	}

	respondJSON(w, http.StatusOK, player)
}

// Middleware para rutas protegidas
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			respondError(w, http.StatusUnauthorized, "Authorization header required")
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			respondError(w, http.StatusUnauthorized, "Invalid authorization format")
			return
		}

		claims, err := ValidateToken(tokenString)
		if err != nil {
			respondError(w, http.StatusUnauthorized, "Invalid or expired token")
			return
		}

		// Agregar claims al context
		ctx := context.WithValue(r.Context(), "claims", claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func GetClaimsFromContext(ctx context.Context) (*Claims, error) {
	claims, ok := ctx.Value("claims").(*Claims)
	if !ok {
		return nil, errors.New("no claims in context")
	}
	return claims, nil
}

// AdminMiddleware verifica que el usuario sea admin
func AdminMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		claims, err := GetClaimsFromContext(r.Context())
		if err != nil {
			respondError(w, http.StatusUnauthorized, "Authentication required")
			return
		}

		if !claims.IsAdmin {
			respondError(w, http.StatusForbidden, "Admin access required")
			return
		}

		next.ServeHTTP(w, r)
	})
}

func respondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func respondError(w http.ResponseWriter, status int, message string) {
	respondJSON(w, status, map[string]string{"error": message})
}
