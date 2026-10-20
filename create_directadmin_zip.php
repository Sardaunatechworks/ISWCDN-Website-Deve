<?php
/**
 * ISWCDN - DirectAdmin Deployment ZIP Packager
 * Packages the api/ folder into a clean archive ready for DirectAdmin upload.
 */

declare(strict_types=1);

$sourceDir = __DIR__ . '/api';
$outputZip = __DIR__ . '/iswcdn_api_production.zip';
$desktopDir = '/home/sardauna/Desktop';

echo "Packaging ISWCDN PHP API for DirectAdmin...\n";

// Remove old zip if exists
if (file_exists($outputZip)) {
    @unlink($outputZip);
}

// Preferred: Use system zip utility if available for maximum compatibility with dotfiles (.htaccess)
$useCliZip = false;
$zipBinary = trim((string) @shell_exec('which zip 2>/dev/null'));
if (!empty($zipBinary) && is_executable($zipBinary)) {
    $useCliZip = true;
}

if ($useCliZip) {
    echo "Using system zip CLI ($zipBinary)...\n";
    $escapedSource = escapeshellarg($sourceDir);
    $escapedOutput = escapeshellarg($outputZip);
    
    // Package from within api folder so paths are root-relative, including .htaccess and .env
    $cmd = "cd {$escapedSource} && zip -r {$escapedOutput} . -x \".git*\" -x \"*.DS_Store\"";
    $output = [];
    $returnVar = 0;
    exec($cmd, $output, $returnVar);

    if ($returnVar !== 0) {
        echo "Error: zip CLI command failed.\n";
        exit(1);
    }
} elseif (extension_loaded('zip')) {
    echo "Using PHP ZipArchive extension...\n";
    $zip = new ZipArchive();
    if ($zip->open($outputZip, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
        echo "Error: Cannot create zip archive at $outputZip\n";
        exit(1);
    }

    $files = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($sourceDir, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::LEAVES_ONLY
    );

    $count = 0;
    foreach ($files as $name => $file) {
        if (!$file->isDir()) {
            $filePath = $file->getRealPath();
            $relativePath = substr($filePath, strlen($sourceDir) + 1);

            // Skip temporary, git files, or local .env
            if (str_starts_with($relativePath, '.git') || $relativePath === '.env') {
                continue;
            }

            $zip->addFile($filePath, $relativePath);
            $count++;
        }
    }
    $zip->close();
} else {
    echo "Error: Neither system zip CLI nor PHP Zip extension is available.\n";
    exit(1);
}

$zipSize = file_exists($outputZip) ? round(filesize($outputZip) / (1024 * 1024), 2) : 0;
echo "Successfully created $outputZip ({$zipSize} MB).\n";

// Copy deployment artifacts to Desktop for user convenience
if (is_dir($desktopDir)) {
    @copy($outputZip, $desktopDir . '/iswcdn_api_production.zip');
    @copy($sourceDir . '/extract.php', $desktopDir . '/extract.php');
    @copy($sourceDir . '/schema.sql', $desktopDir . '/schema.sql');
    @copy($sourceDir . '/seed.sql', $desktopDir . '/seed.sql');
    @copy($sourceDir . '/cleanup_gallery.sql', $desktopDir . '/cleanup_gallery.sql');
    @copy($sourceDir . '/.env.example', $desktopDir . '/.env.example');
    if (file_exists($sourceDir . '/.env')) {
        @copy($sourceDir . '/.env', $desktopDir . '/.env');
    }

    echo "Copied deployment files to Desktop for instant upload:\n";
    echo "  - $desktopDir/iswcdn_api_production.zip\n";
    echo "  - $desktopDir/extract.php\n";
    echo "  - $desktopDir/schema.sql\n";
    echo "  - $desktopDir/seed.sql\n";
    echo "  - $desktopDir/cleanup_gallery.sql\n";
    echo "  - $desktopDir/.env\n";
    echo "  - $desktopDir/.env.example\n";
}

