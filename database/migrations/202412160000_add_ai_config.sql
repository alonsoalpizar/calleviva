-- ============================================
-- CalleViva - AI Config Migration
-- ============================================
-- 202412160000_add_ai_config.sql

-- Insert default AI configuration into parameters table
INSERT INTO parameters (category, code, name, description, config, is_active, sort_order)
VALUES (
    'ai_config',
    'provider',
    'AI Provider Configuration',
    'Configuration for AI text generation',
    '{
        "enabled": false,
        "provider_url": "https://api.anthropic.com/v1/messages",
        "model": "claude-sonnet-4-20250514",
        "max_tokens": 1024,
        "temperature": 0.7,
        "timeout_seconds": 30,
        "cache_enabled": true,
        "cache_ttl_minutes": 15,
        "max_requests_per_minute": 60,
        "fallback_enabled": true
    }'::jsonb,
    true,
    1
)
ON CONFLICT (category, code) DO NOTHING;
