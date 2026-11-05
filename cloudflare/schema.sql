-- Authentic Naturals Cloudflare D1 schema v1.
-- Inventory starts at zero with availability unverified; never claim in-stock until configured.
CREATE TABLE IF NOT EXISTS products (
  sku TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  price_pkr INTEGER NOT NULL CHECK(price_pkr >= 0),
  on_hand INTEGER NOT NULL DEFAULT 0 CHECK(on_hand >= 0),
  allocated INTEGER NOT NULL DEFAULT 0 CHECK(allocated >= 0 AND allocated <= on_hand),
  is_verified INTEGER NOT NULL DEFAULT 0 CHECK(is_verified IN (0,1)),
  restock_note TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT OR IGNORE INTO products(sku,title,price_pkr,on_hand,allocated,is_verified)
VALUES('AN-HAIR-OIL-100','Hair Repair & Revive Growth Oil 100 ml',1499,0,0,0);

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  source TEXT NOT NULL CHECK(source IN ('website_enquiry','website_order','website_waitlist','whatsapp_webhook','instagram','tiktok','manual')),
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  topic TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  quantity INTEGER NOT NULL DEFAULT 1 CHECK(quantity BETWEEN 1 AND 20),
  status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','contacted','qualified','won','lost')),
  order_status TEXT NOT NULL DEFAULT 'not_order' CHECK(order_status IN ('not_order','pending_review','waitlist','confirmed','cancelled','fulfilled')),
  sku TEXT,
  consent_at TEXT NOT NULL,
  idempotency_key TEXT UNIQUE,
  FOREIGN KEY(sku) REFERENCES products(sku)
);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status,order_status);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);

CREATE TABLE IF NOT EXISTS inventory_movements (
  id TEXT PRIMARY KEY,
  sku TEXT NOT NULL,
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  actor TEXT NOT NULL,
  lead_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(sku) REFERENCES products(sku)
);
CREATE INDEX IF NOT EXISTS idx_inventory_movements ON inventory_movements(sku,created_at DESC);
