<?php
declare(strict_types=1);
require __DIR__ . '/../_private/bootstrap.php';
an_security_headers();
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    an_json(['ok' => false, 'error' => 'Method not allowed'], 405);
}
if (strtolower($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') !== 'xmlhttprequest') {
    an_json(['ok' => false, 'error' => 'Invalid request'], 403);
}
// Same-origin browser requests only; cross-site form submissions are rejected.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$host = $_SERVER['HTTP_HOST'] ?? '';
if ($origin !== '') {
    $parts = parse_url($origin);
    if (!$parts || strtolower($parts['host'] ?? '') !== strtolower(explode(':', $host)[0])
        || ($parts['scheme'] ?? '') !== 'https') {
        an_json(['ok' => false, 'error' => 'Origin rejected'], 403);
    }
}
if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) {
    an_json(['ok' => false, 'error' => 'JSON required'], 415);
}
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 12000) {
    an_json(['ok' => false, 'error' => 'Request too large'], 413);
}
$data = json_decode(file_get_contents('php://input', false, null, 0, 12001), true);
if (!is_array($data)) an_json(['ok' => false, 'error' => 'Invalid JSON'], 400);
if (!empty($data['website'])) an_json(['ok' => true]); // bot trap
if (($data['consent'] ?? false) !== true) an_json(['ok' => false, 'error' => 'Consent required'], 422);
$clip = static function (string $field, int $length) use ($data): string {
    return mb_substr(trim((string)($data[$field] ?? '')), 0, $length, 'UTF-8');
};
$name = $clip('name', 100);
$phone = $clip('phone', 40);
$city = $clip('city', 100);
$topic = $clip('topic', 100);
$notes = $clip('notes', 1200);
$payment = $clip('payment', 40);
$source = $clip('source', 30);
$quantity = max(1, min(20, (int)($data['quantity'] ?? 1)));
if (mb_strlen($name) < 2 || mb_strlen($notes) < 3 || !in_array($source, ['enquiry','order'], true)) {
    an_json(['ok' => false, 'error' => 'Name and message are required'], 422);
}
if ($source === 'order' && ($phone === '' || $city === '')) {
    an_json(['ok' => false, 'error' => 'Order contact details required'], 422);
}
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$ipHash = hash_hmac('sha256', $ip . ':' . gmdate('Y-m-d'), an_config()['rate_secret']);
try {
    $db = an_db();
    $check = $db->prepare('SELECT COUNT(*) FROM authentic_leads WHERE ip_hash = ? AND created_at >= UTC_TIMESTAMP() - INTERVAL 1 HOUR');
    $check->execute([$ipHash]);
    if ((int)$check->fetchColumn() >= 6) an_json(['ok' => false, 'error' => 'Too many enquiries'], 429);
    $stmt = $db->prepare('INSERT INTO authentic_leads (name, phone, city, source, topic, notes, quantity, payment, ip_hash) VALUES (?,?,?,?,?,?,?,?,?)');
    $stmt->execute([$name,$phone,$city,$source,$topic,$notes,$quantity,$payment,$ipHash]);
    an_json(['ok' => true, 'lead_id' => (int)$db->lastInsertId()], 201);
} catch (Throwable $exception) {
    error_log('Authentic Naturals intake: ' . $exception->getMessage());
    an_json(['ok' => false, 'error' => 'Service unavailable'], 503);
}
