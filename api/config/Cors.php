<?php
/**
 * ISWCDN API - Cross-Origin Resource Sharing (CORS) Handler
 */

declare(strict_types=1);

namespace App\Config;

class Cors
{
    /**
     * Apply CORS headers to incoming HTTP request
     */
    public static function handle(): void
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        // Read configured allowed origins
        $rawConfig = getenv('CORS_ALLOWED_ORIGINS') ?: 'http://localhost:3000,http://localhost:5173,https://isowcod.org.ng,https://www.isowcod.org.ng,https://iswcdn.org.ng,https://www.iswcdn.org.ng';
        $allowedOrigins = array_map('trim', explode(',', $rawConfig));

        $isAllowed = false;

        if (!empty($origin)) {
            // Check explicit match
            if (in_array($origin, $allowedOrigins, true)) {
                $isAllowed = true;
            }
            // Allow Vercel preview deployments if in dev/staging
            elseif (preg_match('/^https:\/\/[a-z0-9\-]+\.vercel\.app$/i', $origin)) {
                $isAllowed = true;
            }
            // In local development, allow any localhost/127.0.0.1 port
            elseif (APP_DEBUG && preg_match('/^https?:\/\/(localhost|127\.0\.0\.1)(:[0-9]+)?$/i', $origin)) {
                $isAllowed = true;
            }

            if ($isAllowed) {
                header('Access-Control-Allow-Origin: ' . $origin);
                header('Access-Control-Allow-Credentials: true');
            }
        } else {
            // If no origin header (e.g. same origin or direct API test), allow open GET/POST
            header('Access-Control-Allow-Origin: *');
        }

        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token, Accept, Origin');
        header('Access-Control-Max-Age: 86400'); // Cache preflight for 24 hours

        // Intercept OPTIONS preflight request immediately
        if (strtoupper($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
            http_response_code(204);
            exit(0);
        }
    }
}
