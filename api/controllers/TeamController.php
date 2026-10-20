<?php
/**
 * ISWCDN API - Team / Governing Board Controller
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Config\Database;
use App\Helpers\Response;
use App\Helpers\Uploader;
use App\Helpers\Validator;
use App\Middleware\AuthMiddleware;
use PDO;

class TeamController
{
    /**
     * GET /api/team (Public)
     */
    public function list(): void
    {
        $db = Database::getConnection();
        $stmt = $db->query('SELECT * FROM team WHERE is_active = 1 ORDER BY order_index ASC, id ASC');
        $members = $stmt->fetchAll();

        Response::success($members);
    }

    /**
     * GET /api/admin/team (Admin)
     */
    public function adminList(): void
    {
        AuthMiddleware::verify();

        $db = Database::getConnection();
        $stmt = $db->query('SELECT * FROM team ORDER BY order_index ASC, id ASC');
        $members = $stmt->fetchAll();

        Response::success($members);
    }

    /**
     * POST /api/team/upload (Admin Photo Upload)
     */
    public function uploadPhoto(): void
    {
        AuthMiddleware::verify();

        if (empty($_FILES['image'])) {
            Response::badRequest('No image file provided in request.');
        }

        $url = Uploader::uploadImage($_FILES['image'], 'team');
        Response::success(['image_url' => $url], 'Photo uploaded successfully');
    }

    /**
     * POST /api/team (Admin)
     */
    public function create(): void
    {
        AuthMiddleware::verify();

        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $validator = Validator::make($input)
            ->required('name')
            ->required('role');
        $validator->validateOrExit();

        $db = Database::getConnection();

        $orderIndex = (int)($input['order_index'] ?? 0);
        if ($orderIndex === 0) {
            $maxStmt = $db->query('SELECT MAX(order_index) FROM team');
            $orderIndex = ((int)$maxStmt->fetchColumn()) + 1;
        }

        $stmt = $db->prepare('
            INSERT INTO team (name, role, image_url, bio, order_index, is_active)
            VALUES (:name, :role, :image_url, :bio, :order_index, :is_active)
        ');

        $stmt->execute([
            ':name'        => trim((string)$input['name']),
            ':role'        => trim((string)$input['role']),
            ':image_url'   => trim((string)($input['image_url'] ?? '')),
            ':bio'         => trim((string)($input['bio'] ?? '')),
            ':order_index' => $orderIndex,
            ':is_active'   => isset($input['is_active']) ? (int)$input['is_active'] : 1,
        ]);

        $newId = (int)$db->lastInsertId();

        $fetchStmt = $db->prepare('SELECT * FROM team WHERE id = :id');
        $fetchStmt->execute([':id' => $newId]);

        Response::success($fetchStmt->fetch(), 'Team member added successfully', 201);
    }

    /**
     * PUT /api/team/{id} (Admin)
     */
    public function update(int $id): void
    {
        AuthMiddleware::verify();

        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $db = Database::getConnection();

        $check = $db->prepare('SELECT id FROM team WHERE id = :id LIMIT 1');
        $check->execute([':id' => $id]);
        if (!$check->fetch()) {
            Response::notFound('Team member not found.');
        }

        $fields = ['name', 'role', 'image_url', 'bio', 'order_index', 'is_active'];
        $updates = [];
        $params = [':id' => $id];

        foreach ($fields as $field) {
            if (isset($input[$field])) {
                $updates[] = "$field = :$field";
                $params[":$field"] = is_string($input[$field]) ? trim($input[$field]) : $input[$field];
            }
        }

        if (empty($updates)) {
            Response::badRequest('No update data provided.');
        }

        $sql = 'UPDATE team SET ' . implode(', ', $updates) . ' WHERE id = :id';
        $stmt = $db->prepare($sql);
        $stmt->execute($params);

        $fetchStmt = $db->prepare('SELECT * FROM team WHERE id = :id');
        $fetchStmt->execute([':id' => $id]);

        Response::success($fetchStmt->fetch(), 'Team member updated successfully');
    }

    /**
     * DELETE /api/team/{id} (Admin)
     */
    public function delete(int $id): void
    {
        AuthMiddleware::verify();

        $db = Database::getConnection();
        $stmt = $db->prepare('DELETE FROM team WHERE id = :id');
        $stmt->execute([':id' => $id]);

        Response::success(null, 'Team member removed successfully');
    }
}
