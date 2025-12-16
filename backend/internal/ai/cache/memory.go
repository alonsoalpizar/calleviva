package cache

import (
	"crypto/sha256"
	"encoding/hex"
	"sync"
	"time"
)

// Item represents a cached response
type Item struct {
	Value      string
	Expiration time.Time
}

// MemoryCache implements a simple in-memory cache
type MemoryCache struct {
	items map[string]Item
	mu    sync.RWMutex
}

// NewMemoryCache creates a new in-memory cache
func NewMemoryCache() *MemoryCache {
	return &MemoryCache{
		items: make(map[string]Item),
	}
}

// GenerateKey creates a cache key from prompt components
func (c *MemoryCache) GenerateKey(systemPrompt, userPrompt string) string {
	hash := sha256.Sum256([]byte(systemPrompt + "||" + userPrompt))
	return hex.EncodeToString(hash[:])
}

// Get retrieves a value from cache
func (c *MemoryCache) Get(key string) (string, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	item, found := c.items[key]
	if !found {
		return "", false
	}

	if time.Now().After(item.Expiration) {
		return "", false
	}

	return item.Value, true
}

// Set stores a value in cache
func (c *MemoryCache) Set(key string, value string, ttl time.Duration) {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.items[key] = Item{
		Value:      value,
		Expiration: time.Now().Add(ttl),
	}
}

// Clean removes expired items
func (c *MemoryCache) Clean() {
	c.mu.Lock()
	defer c.mu.Unlock()

	now := time.Now()
	for k, v := range c.items {
		if now.After(v.Expiration) {
			delete(c.items, k)
		}
	}
}
