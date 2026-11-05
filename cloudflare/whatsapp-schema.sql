-- WhatsApp Business webhook inbox extension. Apply AFTER cloudflare/schema.sql.
-- Message IDs are unique to prevent duplicate webhook deliveries.
CREATE TABLE IF NOT EXISTS whatsapp_conversations (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL DEFAULT '',
  lead_id TEXT,
  last_message_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  unread_count INTEGER NOT NULL DEFAULT 0 CHECK(unread_count >= 0),
  FOREIGN KEY(lead_id) REFERENCES leads(id)
);
CREATE INDEX IF NOT EXISTS idx_wa_conversations_recent
  ON whatsapp_conversations(last_message_at DESC);

CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  direction TEXT NOT NULL CHECK(direction IN ('inbound','outbound')),
  kind TEXT NOT NULL DEFAULT 'text',
  body TEXT NOT NULL DEFAULT '',
  provider_timestamp TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(conversation_id) REFERENCES whatsapp_conversations(id)
);
CREATE INDEX IF NOT EXISTS idx_wa_messages_conversation
  ON whatsapp_messages(conversation_id,created_at DESC);
