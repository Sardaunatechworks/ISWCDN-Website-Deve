<?php
/**
 * ISWCDN / ISOWCOD API - DirectAdmin One-Click Deployment Extractor
 * Upload this script alongside iswcdn_api_production.zip to your public_html or api domain root,
 * then visit https://api.isowcod.org.ng/extract.php in your browser.
 */

declare(strict_types=1);

header('Content-Type: text/plain; charset=utf-8');

$zipFile = __DIR__ . '/iswcdn_api_production.zip';

if (!file_exists($zipFile)) {
    echo "ERROR: Could not find 'iswcdn_api_production.zip' in " . __DIR__ . "\n";
    echo "Please upload iswcdn_api_production.zip to this folder first.\n";
    exit(1);
}

if (!class_exists('ZipArchive')) {
    echo "ERROR: ZipArchive extension is not enabled in PHP on this server.\n";
    exit(1);
}

$zip = new ZipArchive();
if ($zip->open($zipFile) !== true) {
    echo "ERROR: Failed to open zip file.\n";
    exit(1);
}

$extracted = $zip->extractTo(__DIR__);
$zip->close();

if ($extracted) {
    echo "SUCCESS: Extracted all files successfully into " . __DIR__ . "\n\n";

    // Create .env if not exists from .env.example
    if (!file_exists(__DIR__ . '/.env') && file_exists(__DIR__ . '/.env.example')) {
        copy(__DIR__ . '/.env.example', __DIR__ . '/.env');
        echo "Created .env from .env.example. Please edit it with your DirectAdmin MySQL credentials.\n";
    }

    // Ensure uploads folder permissions
    $uploadsDir = __DIR__ . '/uploads';
    if (!is_dir($uploadsDir)) {
        @mkdir($uploadsDir, 0755, true);
    }
    @chmod($uploadsDir, 0755);

    echo "\nNext steps:\n";
    echo "1. In phpMyAdmin, import 'schema.sql' and 'seed.sql'.\n";
    echo "2. Edit '.env' with your DB_NAME, DB_USER, and DB_PASS.\n";
    echo "3. Delete extract.php and iswcdn_api_production.zip for security.\n";
} else {
    echo "ERROR: Extraction failed. Please check folder permissions (needs write permissions).\n";
}
