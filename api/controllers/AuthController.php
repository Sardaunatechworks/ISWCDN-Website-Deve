<?php
/**
 * ISWCDN API - Authentication Controller
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Config\Database;
use App\Helpers\CookieHelper;
use App\Helpers\Response;
use App\Helpers\Validator;
use App\Middleware\AuthMiddleware;
use App\Services\JWTService;
use PDO;

class AuthController
{
    /**
     * POST /api/auth/login
     */
    public function login(): void
    {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $validator = Validator::make($input)
            ->required('email')
            ->email('email')
            ->required('password');
        $validator->validateOrExit();

        $email = strtolower(trim((string)$input['email']));
        $password = (string)$input['password'];

        $db = Database::getConnection();
        $stmt = $db->prepare('SELECT id, full_name, email, password_hash, role, status FROM admin_users WHERE email = :email LIMIT 1');
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            Response::badRequest('Invalid email address or password.');
        }

        if ($user['status'] !== 'active') {
            Response::forbidden('Your account is currently inactive or suspended. Contact the administrator.');
        }

        // Update last login
        $updateStmt = $db->prepare('UPDATE admin_users SET last_login = NOW() WHERE id = :id');
        $updateStmt->execute([':id' => $user['id']]);

        // Generate JWT token
        $jwt = new JWTService();
        $token = $jwt->generate([
            'sub'   => $user['id'],
            'email' => $user['email'],
            'role'  => $user['role'],
        ]);

        // Set secure HttpOnly cookies
        CookieHelper::setAuthCookies($token);

        unset($user['password_hash']);

        Response::success([
            'token' => $token,
            'user'  => $user,
        ], 'Authentication successful');
    }

    /**
     * GET /api/auth/me
     */
    public function me(): void
    {
        AuthMiddleware::verify();
        $user = $_REQUEST['auth_user'];
        Response::success(['user' => $user]);
    }

    /**
     * POST /api/auth/logout
     */
    public function logout(): void
    {
        CookieHelper::clearAuthCookies();
        Response::success(null, 'Logged out successfully');
    }

    /**
     * PUT /api/auth/profile
     */
    public function updateProfile(): void
    {
        AuthMiddleware::verify();
        $currentUser = $_REQUEST['auth_user'];
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $db = Database::getConnection();

        $updates = [];
        $params = [':id' => $currentUser['id']];

        if (!empty($input['full_name'])) {
            $updates[] = 'full_name = :full_name';
            $params[':full_name'] = trim((string)$input['full_name']);
        }

        if (!empty($input['email'])) {
            $validator = Validator::make($input)->email('email');
            $validator->validateOrExit();

            $newEmail = strtolower(trim((string)$input['email']));
            // Check uniqueness
            $checkStmt = $db->prepare('SELECT id FROM admin_users WHERE email = :email AND id != :id');
            $checkStmt->execute([':email' => $newEmail, ':id' => $currentUser['id']]);
            if ($checkStmt->fetch()) {
                Response::badRequest('Email address is already in use by another administrator.');
            }
            $updates[] = 'email = :email';
            $params[':email'] = $newEmail;
        }

        if (!empty($input['new_password'])) {
            if (empty($input['current_password'])) {
                Response::badRequest('Current password is required to set a new password.');
            }

            // Verify current password
            $passStmt = $db->prepare('SELECT password_hash FROM admin_users WHERE id = :id');
            $passStmt->execute([':id' => $currentUser['id']]);
            $currentHash = $passStmt->fetchColumn();

            if (!password_verify((string)$input['current_password'], (string)$currentHash)) {
                Response::badRequest('Current password entered is incorrect.');
            }

            if (strlen((string)$input['new_password']) < 8) {
                Response::badRequest('New password must be at least 8 characters long.');
            }

            $updates[] = 'password_hash = :hash';
            $params[':hash'] = password_hash((string)$input['new_password'], PASSWORD_BCRYPT);
        }

        if (empty($updates)) {
            Response::badRequest('No changes submitted.');
        }

        $sql = 'UPDATE admin_users SET ' . implode(', ', $updates) . ' WHERE id = :id';
        $stmt = $db->prepare($sql);
        $stmt->execute($params);

        // Fetch refreshed user
        $fetchStmt = $db->prepare('SELECT id, full_name, email, role, status FROM admin_users WHERE id = :id');
        $fetchStmt->execute([':id' => $currentUser['id']]);
        $updatedUser = $fetchStmt->fetch();

        Response::success(['user' => $updatedUser], 'Profile updated successfully');
    }
}
