<?php
// Copy this OUTSIDE public_html as authentic-naturals-config.php.
// Never commit a filled-in config or upload the real file to GitHub.
return [
    'dsn' => 'mysql:host=localhost;dbname=CPANEL_DBNAME;charset=utf8mb4',
    'db_user' => 'CPANEL_DBUSER',
    'db_password' => 'REPLACE_WITH_PRIVATE_DB_PASSWORD',
    // Generate with: php -r "echo password_hash('YOUR_RANDOM_STRONG_PASSWORD', PASSWORD_DEFAULT), PHP_EOL;"
    'admin_password_hash' => 'REPLACE_WITH_PASSWORD_HASH',
    // Generate with: php -r "echo bin2hex(random_bytes(32)), PHP_EOL;"
    'rate_secret' => 'REPLACE_WITH_PRIVATE_RANDOM_SECRET',
];
