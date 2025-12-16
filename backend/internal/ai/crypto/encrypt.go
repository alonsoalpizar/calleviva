package crypto

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"io"
	"os"
)

const (
	// EnvEncryptionKey is the environment variable for the master encryption key
	EnvEncryptionKey = "CALLEVIVA_ENCRYPTION_KEY"
)

var (
	ErrKeyNotSet     = errors.New("encryption key not set in environment")
	ErrKeyTooShort   = errors.New("encryption key must be 32 bytes (use a 32-char string or base64)")
	ErrDecryptFailed = errors.New("decryption failed: invalid data")
)

// GetEncryptionKey retrieves the encryption key from environment
// Key must be exactly 32 bytes for AES-256
func GetEncryptionKey() ([]byte, error) {
	keyStr := os.Getenv(EnvEncryptionKey)
	if keyStr == "" {
		return nil, ErrKeyNotSet
	}

	// Try base64 decode first
	key, err := base64.StdEncoding.DecodeString(keyStr)
	if err == nil && len(key) == 32 {
		return key, nil
	}

	// Otherwise use raw string (must be 32 chars)
	if len(keyStr) != 32 {
		return nil, ErrKeyTooShort
	}
	return []byte(keyStr), nil
}

// Encrypt encrypts plaintext using AES-256-GCM
// Returns base64-encoded ciphertext
func Encrypt(plaintext string) (string, error) {
	key, err := GetEncryptionKey()
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	// Create nonce
	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	// Encrypt and prepend nonce
	ciphertext := gcm.Seal(nonce, nonce, []byte(plaintext), nil)

	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

// Decrypt decrypts base64-encoded ciphertext using AES-256-GCM
func Decrypt(encryptedBase64 string) (string, error) {
	key, err := GetEncryptionKey()
	if err != nil {
		return "", err
	}

	ciphertext, err := base64.StdEncoding.DecodeString(encryptedBase64)
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonceSize := gcm.NonceSize()
	if len(ciphertext) < nonceSize {
		return "", ErrDecryptFailed
	}

	nonce, ciphertext := ciphertext[:nonceSize], ciphertext[nonceSize:]
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", ErrDecryptFailed
	}

	return string(plaintext), nil
}

// GenerateKey generates a random 32-byte key and returns it as base64
// Use this to generate a new CALLEVIVA_ENCRYPTION_KEY
func GenerateKey() (string, error) {
	key := make([]byte, 32)
	if _, err := io.ReadFull(rand.Reader, key); err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(key), nil
}
