<?php
/**
 * ISWCDN API - Courses Controller
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Config\Database;
use App\Helpers\Response;
use App\Helpers\Validator;
use App\Middleware\AuthMiddleware;
use PDO;

class CourseController
{
    /**
     * GET /api/courses (Public)
     */
    public function list(): void
    {
        $category = trim((string)($_GET['category'] ?? ''));

        $db = Database::getConnection();
        $sql = 'SELECT * FROM courses WHERE is_active = 1';
        $params = [];

        if ($category !== '') {
            $sql .= ' AND category = :category';
            $params[':category'] = strtolower($category);
        }

        $sql .= ' ORDER BY order_index ASC, id ASC';

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $courses = $stmt->fetchAll();

        Response::success($courses);
    }

    /**
     * GET /api/admin/courses (Admin)
     */
    public function adminList(): void
    {
        AuthMiddleware::verify();

        $db = Database::getConnection();
        $stmt = $db->query('SELECT * FROM courses ORDER BY category ASC, order_index ASC, id ASC');
        $courses = $stmt->fetchAll();

        Response::success($courses);
    }

    /**
     * GET /api/courses/{id}
     */
    public function show(int $id): void
    {
        $db = Database::getConnection();
        $stmt = $db->prepare('SELECT * FROM courses WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $id]);
        $course = $stmt->fetch();

        if (!$course) {
            Response::notFound('Course not found.');
        }

        Response::success($course);
    }

    /**
     * POST /api/courses (Admin)
     */
    public function create(): void
    {
        AuthMiddleware::verify();

        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $validator = Validator::make($input)
            ->required('title')
            ->required('category')
            ->required('duration')
            ->required('description');
        $validator->validateOrExit();

        $db = Database::getConnection();

        $orderIndex = (int)($input['order_index'] ?? 0);
        if ($orderIndex === 0) {
            $maxStmt = $db->query('SELECT MAX(order_index) FROM courses');
            $orderIndex = ((int)$maxStmt->fetchColumn()) + 1;
        }

        $stmt = $db->prepare('
            INSERT INTO courses (title, category, duration, type, description, order_index, is_active)
            VALUES (:title, :category, :duration, :type, :description, :order_index, :is_active)
        ');

        $stmt->execute([
            ':title'       => trim((string)$input['title']),
            ':category'    => strtolower(trim((string)$input['category'])),
            ':duration'    => trim((string)$input['duration']),
            ':type'        => trim((string)($input['type'] ?? 'Full-time / Part-time')),
            ':description' => trim((string)$input['description']),
            ':order_index' => $orderIndex,
            ':is_active'   => isset($input['is_active']) ? (int)$input['is_active'] : 1,
        ]);

        $newId = (int)$db->lastInsertId();

        $fetchStmt = $db->prepare('SELECT * FROM courses WHERE id = :id');
        $fetchStmt->execute([':id' => $newId]);

        Response::success($fetchStmt->fetch(), 'Course created successfully', 201);
    }

    /**
     * PUT /api/courses/{id} (Admin)
     */
    public function update(int $id): void
    {
        AuthMiddleware::verify();

        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $db = Database::getConnection();

        $check = $db->prepare('SELECT id FROM courses WHERE id = :id LIMIT 1');
        $check->execute([':id' => $id]);
        if (!$check->fetch()) {
            Response::notFound('Course not found.');
        }

        $fields = ['title', 'category', 'duration', 'type', 'description', 'order_index', 'is_active'];
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

        $sql = 'UPDATE courses SET ' . implode(', ', $updates) . ' WHERE id = :id';
        $stmt = $db->prepare($sql);
        $stmt->execute($params);

        $fetchStmt = $db->prepare('SELECT * FROM courses WHERE id = :id');
        $fetchStmt->execute([':id' => $id]);

        Response::success($fetchStmt->fetch(), 'Course updated successfully');
    }

    /**
     * DELETE /api/courses/{id} (Admin)
     */
    public function delete(int $id): void
    {
        AuthMiddleware::verify();

        $db = Database::getConnection();
        $stmt = $db->prepare('DELETE FROM courses WHERE id = :id');
        $stmt->execute([':id' => $id]);

        Response::success(null, 'Course deleted successfully');
    }
}
