-- Adds password login to existing Authentic Naturals D1 CRM.
-- Does NOT change existing leads, products, stock, or WhatsApp data.
CREATE TABLE IF NOT EXISTS crm_auth_users (
 username TEXT PRIMARY KEY,
 salt TEXT NOT NULL,
 verifier TEXT NOT NULL,
 iterations INTEGER NOT NULL CHECK(iterations BETWEEN 200000 AND 1000000),
 created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE TABLE IF NOT EXISTS crm_auth_sessions (
 token_hash TEXT PRIMARY KEY,
 user_id TEXT NOT NULL REFERENCES crm_auth_users(username) ON DELETE CASCADE,
 created_at INTEGER NOT NULL,
 expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_crm_auth_sessions_expiry ON crm_auth_sessions(expires_at);
CREATE TABLE IF NOT EXISTS crm_auth_attempts (
 ip_hash TEXT PRIMARY KEY,
 failures INTEGER NOT NULL DEFAULT 0,
 reset_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_crm_auth_attempts_expiry ON crm_auth_attempts(reset_at);
