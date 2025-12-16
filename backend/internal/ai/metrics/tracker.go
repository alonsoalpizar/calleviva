package metrics

import (
	"sync"
	"sync/atomic"
)

// Tracker handles simple metrics for AI usage
type Tracker struct {
	totalRequests   int64
	totalTokens     int64
	requestsByModel map[string]int64
	errorsByModel   map[string]int64
	mu              sync.RWMutex
}

// NewTracker creates a new metrics tracker
func NewTracker() *Tracker {
	return &Tracker{
		requestsByModel: make(map[string]int64),
		errorsByModel:   make(map[string]int64),
	}
}

// RecordRequest records a successful request
func (t *Tracker) RecordRequest(model string, tokens int) {
	atomic.AddInt64(&t.totalRequests, 1)
	atomic.AddInt64(&t.totalTokens, int64(tokens))

	t.mu.Lock()
	defer t.mu.Unlock()
	t.requestsByModel[model]++
}

// RecordError records a failed request
func (t *Tracker) RecordError(model string) {
	t.mu.Lock()
	defer t.mu.Unlock()
	t.errorsByModel[model]++
}

// GetStats returns current stats
func (t *Tracker) GetStats() map[string]interface{} {
	t.mu.RLock()
	defer t.mu.RUnlock()

	reqsCopy := make(map[string]int64)
	for k, v := range t.requestsByModel {
		reqsCopy[k] = v
	}

	errsCopy := make(map[string]int64)
	for k, v := range t.errorsByModel {
		errsCopy[k] = v
	}

	return map[string]interface{}{
		"total_requests":    atomic.LoadInt64(&t.totalRequests),
		"total_tokens":      atomic.LoadInt64(&t.totalTokens),
		"requests_by_model": reqsCopy,
		"errors_by_model":   errsCopy,
	}
}
