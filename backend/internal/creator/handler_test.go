package creator

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/jackc/pgconn"
	"github.com/jackc/pgx/v5"
)

// MockDB implements DBExecutor
type MockDB struct {
	QueryFunc    func(ctx context.Context, sql string, args ...any) (pgx.Rows, error)
	QueryRowFunc func(ctx context.Context, sql string, args ...any) pgx.Row
	ExecFunc     func(ctx context.Context, sql string, args ...any) (pgconn.CommandTag, error)
}

func (m *MockDB) Query(ctx context.Context, sql string, args ...any) (pgx.Rows, error) {
	return m.QueryFunc(ctx, sql, args...)
}

func (m *MockDB) QueryRow(ctx context.Context, sql string, args ...any) pgx.Row {
	return m.QueryRowFunc(ctx, sql, args...)
}

func (m *MockDB) Exec(ctx context.Context, sql string, args ...any) (pgconn.CommandTag, error) {
	return m.ExecFunc(ctx, sql, args...)
}

// MockRow implements pgx.Row
type MockRow struct {
	ScanFunc func(dest ...any) error
}

func (m *MockRow) Scan(dest ...any) error {
	return m.ScanFunc(dest...)
}

func TestSubmit(t *testing.T) {
	// Setup Mock
	mockDB := &MockDB{
		QueryRowFunc: func(ctx context.Context, sql string, args ...any) pgx.Row {
			return &MockRow{
				ScanFunc: func(dest ...any) error {
					// Simulate returning an ID
					*(dest[0].(*string)) = "test-uuid"
					return nil
				},
			}
		},
	}

	h := NewHandler(mockDB)

	// Create Request
	input := ContentCreationInput{
		ContentType: "personaje",
		Name:        "Test Char",
		Description: "A test",
		Recipe:      json.RawMessage(`{"base":"round"}`),
	}
	body, _ := json.Marshal(input)
	req := httptest.NewRequest("POST", "/api/creator/submit", bytes.NewBuffer(body))
	w := httptest.NewRecorder()

	// Execute
	h.Submit(w, req)

	// Verify
	resp := w.Result()
	if resp.StatusCode != http.StatusCreated {
		t.Errorf("Expected status 201, got %d", resp.StatusCode)
	}

	var resBody map[string]string
	json.NewDecoder(resp.Body).Decode(&resBody)
	if resBody["id"] != "test-uuid" {
		t.Errorf("Expected ID test-uuid, got %s", resBody["id"])
	}
}
