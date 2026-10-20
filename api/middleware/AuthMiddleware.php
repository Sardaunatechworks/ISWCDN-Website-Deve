<?php
/**
 * ISWCDN API - JWT Authentication Middleware
 */

declare(strict_types=1);

namespace App\Middleware;

use App\Config\Database;
use App\Helpers\CookieHelper;
use App\Helpers\Response;
use App\Services\JWTService;
use PDO;

class AuthMiddleware
{
    /**
     * Check authorization state
     */
    public static function check(): array
    {
        $token = self::extractToken();

        if ($token === null) {
            return ['success' => false, 'status' => 401, 'message' => 'Missing or invalid authorization credentials'];
        }

        $jwt = new JWTService();
        $payload = $jwt->verify($token);

        if ($payload === null) {
            return ['success' => false, 'status' => 401, 'message' => 'Invalid or expired session token'];
        }

        $userId = (int) ($payload['sub'] ?? 0);
        if ($userId <= 0) {
            return ['success' => false, 'status' => 401, 'message' => 'Malformed authentication token'];
        }

        // Fetch fresh user record from database
        try {
            $db = Database::getConnection();
            $stmt = $db->prepare('SELECT id, full_name, email, role, status FROM admin_users WHERE id = :id LIMIT 1');
            $stmt->execute([':id' => $userId]);
            $user = $stmt->fetch();

            if (!$user) {
                return ['success' => false, 'status' => 401, 'message' => 'User account not found'];
            }

            if ($user['status'] !== 'active') {
                return ['success' => false, 'status' => 403, 'message' => 'Account is suspended or inactive'];
            }

            return ['success' => true, 'user' => $user];
        } catch (\Throwable $e) {
            return ['success' => false, 'status' => 500, 'message' => 'Authorization database error: ' . $e->getMessage()];
        }
    }

    /**
     * Verify authorization. Halts execution with 401 or 403 on failure.
     */
    public static function verify(): void
    {
        $result = self::check();

        if (!$result['success']) {
            if ($result['status'] === 401) {
                Response::unauthorized($result['message']);
            } elseif ($result['status'] === 403) {
                Response::forbidden($result['message']);
            } else {
                Response::serverError($result['message']);
            }
        }

        $_REQUEST['auth_user'] = $result['user'];
    }

    /**
     * Optional authentication — populates auth_user if token is present and valid
     */
    public static function optional(): void
    {
        $result = self::check();
        $_REQUEST['auth_user'] = $result['success'] ? $result['user'] : null;
    }

    /**
     * Extract token from HttpOnly cookie or Authorization Bearer header
     */
    private static function extractToken(): ?string
    {
        // 1. Check HttpOnly cookie
        if (!empty($_COOKIE[CookieHelper::ACCESS_COOKIE])) {
            $token = trim((string) $_COOKIE[CookieHelper::ACCESS_COOKIE]);
            if ($token !== '') {
                return $token;
            }
        }

        // 2. Check Authorization Bearer header
        $authHeader = $_SERVER['HTTP_AUTHORIZATION']
            ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
            ?? '';

        if (!empty($authHeader) && str_starts_with($authHeader, 'Bearer ')) {
            $token = trim(substr($authHeader, 7));
            return $token !== '' ? $token : null;
        }

        return null;
    }
}
