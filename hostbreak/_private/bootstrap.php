<?php
declare(strict_types=1);

/**
 * Shared bootstrap. Deployed inside public_html/_private with HTTP access denied.
 * Actual config MUST live one directory ABOVE public_html, never in this repository.
 */
const AN_PRIVATE_CONFIG = __DIR__ . '/../../authentic-naturals-config.php';
if (!is_file(AN_PRIVATE_CONFIG)) {
    error_log('Authentic Naturals private config missing');
    http_response_code(503);
    exit('Service configuration incomplete.');
}
$config = require AN_PRIVATE_CONFIG;
if (!is_array($config) || empty($config['dsn']) || empty($config['db_user'])
    || !array_key_exists('db_password', $config) || empty($config['admin_password_hash'])
    || empty($config['rate_secret'])) {
    http_response_code(503);
    exit('Service configuration incomplete.');
}
function an_config(): array {
    global $config;
    return $config;
}
function an_db(): PDO {
    static $pdo = null;
    if (!$pdo) {
        $cfg = an_config();
        $pdo = new PDO($cfg['dsn'], $cfg['db_user'], $cfg['db_password'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    }
    return $pdo;
}
function an_security_headers(): void {
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('X-Frame-Options: DENY');
    header("Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'");
    header('Cache-Control: no-store');
}
function an_session(): void {
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_name('an_staff_session');
        session_set_cookie_params([
            'lifetime' => 0, 'path' => '/admin',
            'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
            'httponly' => true, 'samesite' => 'Strict',
        ]);
        session_start();
    }
}
function an_e(string $s): string { return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
function an_csrf(): string {
    an_session();
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
    return $_SESSION['csrf'];
}
function an_check_csrf(string $provided): void {
    if (!hash_equals(an_csrf(), $provided)) {
        http_response_code(403);
        exit('Invalid request token.');
    }
}
function an_json(array $data, int $status = 200): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}
