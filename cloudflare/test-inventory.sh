#!/usr/bin/env bash
set -euo pipefail
DB="$(mktemp)"
trap 'rm -f "$DB"' EXIT
sqlite3 "$DB" < cloudflare/schema.sql
sqlite3 "$DB" "UPDATE products SET on_hand=3,is_verified=1 WHERE sku='AN-HAIR-OIL-100';"
sqlite3 "$DB" "INSERT INTO leads(id,source,name,notes,quantity,order_status,sku,consent_at) VALUES ('l1','website_order','Example Client','Test order',2,'pending_review','AN-HAIR-OIL-100',CURRENT_TIMESTAMP);"
sqlite3 "$DB" "INSERT INTO leads(id,source,name,notes,quantity,order_status,sku,consent_at) VALUES ('l2','website_waitlist','Other Client','Test waitlist',2,'waitlist','AN-HAIR-OIL-100',CURRENT_TIMESTAMP);"
sqlite3 "$DB" "UPDATE leads SET order_status='confirmed' WHERE id='l1';"
test "$(sqlite3 "$DB" "SELECT allocated FROM products WHERE sku='AN-HAIR-OIL-100';")" = "2"
# Attempt to overbook remaining stock; database must abort update.
if sqlite3 "$DB" "UPDATE leads SET order_status='confirmed' WHERE id='l2';" >/dev/null 2>&1; then
  echo "ERROR: overbooking was allowed" >&2; exit 1
fi
test "$(sqlite3 "$DB" "SELECT order_status FROM leads WHERE id='l2';")" = "waitlist"
sqlite3 "$DB" "UPDATE leads SET order_status='cancelled' WHERE id='l1';"
test "$(sqlite3 "$DB" "SELECT allocated FROM products WHERE sku='AN-HAIR-OIL-100';")" = "0"
sqlite3 "$DB" "UPDATE leads SET order_status='confirmed' WHERE id='l2';"
test "$(sqlite3 "$DB" "SELECT allocated FROM products WHERE sku='AN-HAIR-OIL-100';")" = "2"
sqlite3 "$DB" "UPDATE leads SET order_status='fulfilled' WHERE id='l2';"
test "$(sqlite3 "$DB" "SELECT on_hand||':'||allocated FROM products WHERE sku='AN-HAIR-OIL-100';")" = "1:0"
echo "Stock reservation, overbooking guard, cancellation and fulfilment tests passed."
