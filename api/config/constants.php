<?php
/**
 * ISWCDN API - Global Constants & Configuration Loader
 */

declare(strict_types=1);

define('ISWCDN_API_VERSION', '1.0.0');
define('ISWCDN_API_NAME', 'ISWCDN Institutional API');

// Load environment variables from .env if present
$envFile = dirname(__DIR__) . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }
        if (str_contains($line, '=')) {
            [$key, $val] = explode('=', $line, 2);
            $key = trim($key);
            $val = trim($val);
            // Remove surrounding quotes if present
            if ((str_starts_with($val, '"') && str_ends_with($val, '"')) ||
                (str_starts_with($val, "'") && str_ends_with($val, "'"))) {
                $val = substr($val, 1, -1);
            }
            if (!array_key_exists($key, $_ENV)) {
                $_ENV[$key] = $val;
                putenv("$key=$val");
            }
        }
    }
}

// App Settings
define('APP_ENV', getenv('APP_ENV') ?: 'development');
define('APP_DEBUG', filter_var(getenv('APP_DEBUG') ?: (APP_ENV === 'development'), FILTER_VALIDATE_BOOLEAN));
define('APP_URL', getenv('APP_URL') ?: 'http://localhost:8000');

// Database Settings
define('DB_HOST', getenv('DB_HOST') ?: '127.0.0.1');
define('DB_PORT', (int) (getenv('DB_PORT') ?: 3306));
define('DB_NAME', getenv('DB_NAME') ?: 'iswcdn_db');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('DB_CHARSET', getenv('DB_CHARSET') ?: 'utf8mb4');

// JWT & Security
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'iswcdn_fallback_secret_key_change_in_production_2026');
define('JWT_EXPIRATION', (int) (getenv('JWT_EXPIRATION_SECONDS') ?: 86400)); // 24 hours
define('REFRESH_EXPIRATION', (int) (getenv('REFRESH_EXPIRATION_SECONDS') ?: 604800)); // 7 days

// Uploads
define('UPLOAD_DIR', dirname(__DIR__) . '/uploads');
define('UPLOAD_MAX_BYTES', ((int) (getenv('UPLOAD_MAX_SIZE_MB') ?: 8)) * 1024 * 1024);

// Configure Error Reporting based on debug mode
if (APP_DEBUG) {
    ini_set('display_errors', '1');
    ini_set('display_startup_errors', '1');
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', '0');
    error_reporting(0);
}
