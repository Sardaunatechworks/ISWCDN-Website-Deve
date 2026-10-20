<?php
/**
 * ISWCDN API - Applications Controller (Admission & Membership)
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Config\Database;
use App\Helpers\Response;
use App\Helpers\Validator;
use App\Middleware\AuthMiddleware;
use App\Middleware\RateLimiter;
use PDO;

class ApplicationController
{
    /**
     * POST /api/applications/submit (Public)
     */
    public function submit(): void
    {
        RateLimiter::check('app_submission', 5, 60);

        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $validator = Validator::make($input)
            ->required('name', 'Full Name')
            ->minLength('name', 2)
            ->required('email')
            ->email('email')
            ->required('phone', 'Phone Number')
            ->minLength('phone', 7)
            ->required('program', 'Program / Course / Category')
            ->required('qualification', 'Highest Qualification');
        $validator->validateOrExit();

        $appType = trim((string)($input['application_type'] ?? 'Admission'));
        if (!in_array($appType, ['Admission', 'Membership'], true)) {
            $appType = 'Admission';
        }

        $db = Database::getConnection();

        $stmt = $db->prepare('
            INSERT INTO applications (application_type, name, email, phone, program, qualification, status)
            VALUES (:app_type, :name, :email, :phone, :program, :qualification, "Pending")
        ');

        $stmt->execute([
            ':app_type'       => $appType,
            ':name'           => trim((string)$input['name']),
            ':email'          => strtolower(trim((string)$input['email'])),
            ':phone'          => trim((string)$input['phone']),
            ':program'        => trim((string)$input['program']),
            ':qualification'  => trim((string)$input['qualification']),
        ]);

        $appId = (int)$db->lastInsertId();

        Response::success([
            'id'               => $appId,
            'name'             => trim((string)$input['name']),
            'application_type' => $appType,
            'program'          => trim((string)$input['program']),
            'status'           => 'Pending',
        ], 'Application submitted successfully! Our admissions & accreditation committee will review your submission.', 201);
    }

    /**
     * GET /api/applications (Admin)
     */
    public function list(): void
    {
        AuthMiddleware::verify();

        $status = trim((string)($_GET['status'] ?? ''));
        $type = trim((string)($_GET['type'] ?? ''));

        $db = Database::getConnection();

        $where = [];
        $params = [];

        if ($status !== '') {
            $where[] = 'status = :status';
            $params[':status'] = $status;
        }

        if ($type !== '') {
            $where[] = 'application_type = :type';
            $params[':type'] = $type;
        }

        $sql = 'SELECT * FROM applications';
        if (!empty($where)) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }
        $sql .= ' ORDER BY submitted_at DESC';

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $applications = $stmt->fetchAll();

        Response::success($applications);
    }

    /**
     * GET /api/applications/{id} (Admin)
     */
    public function show(int $id): void
    {
        AuthMiddleware::verify();

        $db = Database::getConnection();
        $stmt = $db->prepare('SELECT * FROM applications WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $id]);
        $app = $stmt->fetch();

        if (!$app) {
            Response::notFound('Application not found.');
        }

        Response::success($app);
    }

    /**
     * PATCH /api/applications/{id}/status (Admin)
     */
    public function updateStatus(int $id): void
    {
        AuthMiddleware::verify();

        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $validator = Validator::make($input)
            ->required('status')
            ->in('status', ['Pending', 'Approved', 'Rejected']);
        $validator->validateOrExit();

        $db = Database::getConnection();

        $stmt = $db->prepare('SELECT id, name FROM applications WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $id]);
        $app = $stmt->fetch();

        if (!$app) {
            Response::notFound('Application not found.');
        }

        $updateStmt = $db->prepare('
            UPDATE applications
            SET status = :status, admin_notes = :notes
            WHERE id = :id
        ');

        $updateStmt->execute([
            ':status' => $input['status'],
            ':notes'  => isset($input['admin_notes']) ? trim((string)$input['admin_notes']) : null,
            ':id'     => $id,
        ]);

        Response::success([
            'id'     => $id,
            'name'   => $app['name'],
            'status' => $input['status'],
        ], sprintf('Application %s successfully.', strtolower((string)$input['status'])));
    }

    /**
     * DELETE /api/applications/{id} (Admin)
     */
    public function delete(int $id): void
    {
        AuthMiddleware::verify();

        $db = Database::getConnection();
        $stmt = $db->prepare('DELETE FROM applications WHERE id = :id');
        $stmt->execute([':id' => $id]);

        Response::success(null, 'Application deleted successfully');
    }
}
