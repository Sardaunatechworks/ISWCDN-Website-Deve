<?php
/**
 * ISWCDN API - Front Controller & Route Registry
 */

declare(strict_types=1);

require_once __DIR__ . '/config/constants.php';

// PSR-4 style Class Autoloader
spl_autoload_register(function (string $class) {
    $prefix = 'App\\';
    $baseDir = __DIR__ . '/';

    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    $relativeClass = substr($class, $len);
    // Map namespaces to lowercase directory names
    $parts = explode('\\', $relativeClass);
    $className = array_pop($parts);

    $subDir = strtolower(implode('/', $parts));
    $file = $baseDir . ($subDir ? $subDir . '/' : '') . $className . '.php';

    if (file_exists($file)) {
        require_once $file;
    }
});

use App\Config\Cors;
use App\Config\Database;
use App\Helpers\Response;

// Apply CORS & Handle Preflight Immediately
Cors::handle();

// Gracefully handle static file requests if routed through index.php
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$parsedPath = parse_url($requestUri, PHP_URL_PATH) ?: '/';

// Serve uploads or static media if requested directly through this script
if (str_starts_with($parsedPath, '/api/uploads/') || str_starts_with($parsedPath, '/uploads/') || str_starts_with($parsedPath, '/profiles/') || str_starts_with($parsedPath, '/gallery/') || preg_match('#\.(png|jpe?g|webp|gif|svg)$#i', $parsedPath)) {
    $filePath = null;
    if (str_starts_with($parsedPath, '/api/uploads/')) {
        $relFile = substr($parsedPath, strlen('/api/uploads/'));
        $filePath = UPLOAD_DIR . '/' . ltrim($relFile, '/');
    } elseif (str_starts_with($parsedPath, '/uploads/')) {
        $relFile = substr($parsedPath, strlen('/uploads/'));
        $filePath = UPLOAD_DIR . '/' . ltrim($relFile, '/');
    } elseif (str_starts_with($parsedPath, '/profiles/')) {
        $relFile = substr($parsedPath, strlen('/profiles/'));
        $filePath = UPLOAD_DIR . '/profiles/' . ltrim($relFile, '/');
    } elseif (str_starts_with($parsedPath, '/gallery/')) {
        $relFile = substr($parsedPath, strlen('/gallery/'));
        $filePath = UPLOAD_DIR . '/gallery/' . ltrim($relFile, '/');
    } else {
        // Direct root image file, check uploads/gallery and uploads/profiles
        $filename = basename($parsedPath);
        if (file_exists(UPLOAD_DIR . '/gallery/' . $filename)) {
            $filePath = UPLOAD_DIR . '/gallery/' . $filename;
        } elseif (file_exists(UPLOAD_DIR . '/profiles/' . $filename)) {
            $filePath = UPLOAD_DIR . '/profiles/' . $filename;
        }
    }

    if ($filePath && file_exists($filePath) && is_file($filePath)) {
        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($filePath);
        header('Access-Control-Allow-Origin: *');
        header('Content-Type: ' . $mime);
        header('Content-Length: ' . filesize($filePath));
        header('Cache-Control: public, max-age=86400');
        readfile($filePath);
        exit(0);
    }
}

// Normalize URI path for routing (strip /api prefix and trailing slashes)
$cleanUri = preg_replace('#^/api#', '', $parsedPath);
$cleanUri = rtrim($cleanUri, '/');
if ($cleanUri === '') {
    $cleanUri = '/';
}

$httpMethod = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

// Route Registry
$routes = [];

function route(string $method, string $pattern, callable $handler): void {
    global $routes;
    $regex = preg_replace('#\{([a-zA-Z0-9_]+)\}#', '(?P<$1>[^/]+)', $pattern);
    $regex = '#^' . $regex . '$#';
    $routes[] = [
        'method'  => strtoupper($method),
        'pattern' => $regex,
        'handler' => $handler,
    ];
}

// =====================================================================
// API ROUTES DEFINITION
// =====================================================================

// 1. Health & Diagnostics
route('GET', '/', function () {
    $dbOk = Database::testConnection();
    Response::success([
        'api'      => ISWCDN_API_NAME,
        'version'  => ISWCDN_API_VERSION,
        'status'   => 'online',
        'database' => $dbOk ? 'connected' : 'disconnected',
        'time'     => date('c'),
    ], 'ISWCDN Institutional API is online and operational.');
});

// 2. Authentication
route('POST', '/auth/login', function () {
    (new \App\Controllers\AuthController())->login();
});

route('GET', '/auth/me', function () {
    (new \App\Controllers\AuthController())->me();
});

route('POST', '/auth/logout', function () {
    (new \App\Controllers\AuthController())->logout();
});

route('PUT', '/auth/profile', function () {
    (new \App\Controllers\AuthController())->updateProfile();
});

// 3. Admin Dashboard
route('GET', '/dashboard/stats', function () {
    (new \App\Controllers\DashboardController())->stats();
});

// 4. Members Directory
route('GET', '/members', function () {
    (new \App\Controllers\MemberController())->list();
});

route('GET', '/members/{id}', function (array $params) {
    (new \App\Controllers\MemberController())->show((int)$params['id']);
});

route('POST', '/members', function () {
    (new \App\Controllers\MemberController())->create();
});

route('PUT', '/members/{id}', function (array $params) {
    (new \App\Controllers\MemberController())->update((int)$params['id']);
});

route('DELETE', '/members/{id}', function (array $params) {
    (new \App\Controllers\MemberController())->delete((int)$params['id']);
});

// 5. Applications (Admission & Membership)
route('POST', '/applications/submit', function () {
    (new \App\Controllers\ApplicationController())->submit();
});

route('GET', '/applications', function () {
    (new \App\Controllers\ApplicationController())->list();
});

route('GET', '/applications/{id}', function (array $params) {
    (new \App\Controllers\ApplicationController())->show((int)$params['id']);
});

route('PATCH', '/applications/{id}/status', function (array $params) {
    (new \App\Controllers\ApplicationController())->updateStatus((int)$params['id']);
});

route('DELETE', '/applications/{id}', function (array $params) {
    (new \App\Controllers\ApplicationController())->delete((int)$params['id']);
});

// 6. Courses
route('GET', '/courses', function () {
    (new \App\Controllers\CourseController())->list();
});

route('GET', '/admin/courses', function () {
    (new \App\Controllers\CourseController())->adminList();
});

route('GET', '/courses/{id}', function (array $params) {
    (new \App\Controllers\CourseController())->show((int)$params['id']);
});

route('POST', '/courses', function () {
    (new \App\Controllers\CourseController())->create();
});

route('PUT', '/courses/{id}', function (array $params) {
    (new \App\Controllers\CourseController())->update((int)$params['id']);
});

route('DELETE', '/courses/{id}', function (array $params) {
    (new \App\Controllers\CourseController())->delete((int)$params['id']);
});

// 7. Team & Governing Board
route('GET', '/team', function () {
    (new \App\Controllers\TeamController())->list();
});

route('GET', '/admin/team', function () {
    (new \App\Controllers\TeamController())->adminList();
});

route('POST', '/team/upload', function () {
    (new \App\Controllers\TeamController())->uploadPhoto();
});

route('POST', '/team', function () {
    (new \App\Controllers\TeamController())->create();
});

route('PUT', '/team/{id}', function (array $params) {
    (new \App\Controllers\TeamController())->update((int)$params['id']);
});

route('DELETE', '/team/{id}', function (array $params) {
    (new \App\Controllers\TeamController())->delete((int)$params['id']);
});

// 8. Gallery
route('GET', '/gallery', function () {
    (new \App\Controllers\GalleryController())->list();
});

route('POST', '/gallery/upload', function () {
    (new \App\Controllers\GalleryController())->uploadImage();
});

route('POST', '/gallery', function () {
    (new \App\Controllers\GalleryController())->create();
});

route('DELETE', '/gallery/{id}', function (array $params) {
    (new \App\Controllers\GalleryController())->delete((int)$params['id']);
});

// 9. Contact Messages
route('POST', '/messages/submit', function () {
    (new \App\Controllers\MessageController())->submit();
});

route('GET', '/messages', function () {
    (new \App\Controllers\MessageController())->list();
});

route('GET', '/messages/{id}', function (array $params) {
    (new \App\Controllers\MessageController())->show((int)$params['id']);
});

route('PATCH', '/messages/{id}/status', function (array $params) {
    (new \App\Controllers\MessageController())->markStatus((int)$params['id']);
});

route('DELETE', '/messages/{id}', function (array $params) {
    (new \App\Controllers\MessageController())->delete((int)$params['id']);
});

// 10. Newsletter & Broadcasts
route('POST', '/newsletter/subscribe', function () {
    (new \App\Controllers\NewsletterController())->subscribe();
});

route('GET', '/admin/newsletter/subscribers', function () {
    (new \App\Controllers\NewsletterController())->subscribers();
});

route('DELETE', '/admin/newsletter/subscribers/{id}', function (array $params) {
    (new \App\Controllers\NewsletterController())->deleteSubscriber((int)$params['id']);
});

route('GET', '/admin/newsletter/broadcasts', function () {
    (new \App\Controllers\NewsletterController())->broadcasts();
});

route('POST', '/admin/newsletter/broadcast', function () {
    (new \App\Controllers\NewsletterController())->sendBroadcast();
});

// 11. Institutional Settings
route('GET', '/settings', function () {
    (new \App\Controllers\SettingController())->get();
});

route('PUT', '/settings', function () {
    (new \App\Controllers\SettingController())->update();
});

// =====================================================================
// DISPATCH ROUTE
// =====================================================================

$matched = false;

foreach ($routes as $r) {
    if ($r['method'] !== $httpMethod) {
        continue;
    }

    if (preg_match($r['pattern'], $cleanUri, $matches)) {
        $matched = true;
        $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
        $r['handler']($params);
        break;
    }
}

if (!$matched) {
    // Check if route exists under different method
    foreach ($routes as $r) {
        if (preg_match($r['pattern'], $cleanUri)) {
            Response::error('Method not allowed', 405);
        }
    }
    Response::notFound('API endpoint not found: ' . $httpMethod . ' ' . $cleanUri);
}
