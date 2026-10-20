<?php
/**
 * ISWCDN API - Members Controller
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Config\Database;
use App\Helpers\Response;
use App\Helpers\Validator;
use App\Middleware\AuthMiddleware;
use PDO;

class MemberController
{
    /**
     * GET /api/members
     */
    public function list(): void
    {
        AuthMiddleware::verify();

        $search = trim((string)($_GET['search'] ?? ''));
        $status = trim((string)($_GET['status'] ?? ''));

        $db = Database::getConnection();

        $where = [];
        $params = [];

        if ($search !== '') {
            $where[] = '(name LIKE :search OR member_id LIKE :search OR email LIKE :search)';
            $params[':search'] = "%$search%";
        }

        if ($status !== '') {
            $where[] = 'status = :status';
            $params[':status'] = $status;
        }

        $sql = 'SELECT * FROM members';
        if (!empty($where)) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }
        $sql .= ' ORDER BY created_at DESC';

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $members = $stmt->fetchAll();

        Response::success($members);
    }

    /**
     * GET /api/members/{id}
     */
    public function show(int $id): void
    {
        AuthMiddleware::verify();

        $db = Database::getConnection();
        $stmt = $db->prepare('SELECT * FROM members WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $id]);
        $member = $stmt->fetch();

        if (!$member) {
            Response::notFound('Member not found.');
        }

        Response::success($member);
    }

    /**
     * POST /api/members
     */
    public function create(): void
    {
        AuthMiddleware::verify();

        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $validator = Validator::make($input)
            ->required('name')
            ->required('email')
            ->email('email')
            ->required('role')
            ->required('joined_date');
        $validator->validateOrExit();

        $db = Database::getConnection();

        // Check email uniqueness
        $check = $db->prepare('SELECT id FROM members WHERE email = :email LIMIT 1');
        $check->execute([':email' => strtolower(trim((string)$input['email']))]);
        if ($check->fetch()) {
            Response::badRequest('A member with this email already exists.');
        }

        // Generate or use member_id
        $memberId = trim((string)($input['member_id'] ?? ''));
        if ($memberId === '') {
            $year = date('Y');
            $countStmt = $db->query('SELECT COUNT(*) FROM members');
            $nextNum = ((int)$countStmt->fetchColumn()) + 1;
            $memberId = sprintf('ISWCDN-%s-%04d', $year, $nextNum);
        }

        $stmt = $db->prepare('
            INSERT INTO members (member_id, name, email, phone, role, status, joined_date)
            VALUES (:member_id, :name, :email, :phone, :role, :status, :joined_date)
        ');

        $stmt->execute([
            ':member_id'   => $memberId,
            ':name'        => trim((string)$input['name']),
            ':email'       => strtolower(trim((string)$input['email'])),
            ':phone'       => trim((string)($input['phone'] ?? '')),
            ':role'        => trim((string)$input['role']),
            ':status'      => $input['status'] ?? 'Active',
            ':joined_date' => $input['joined_date'],
        ]);

        $newId = (int)$db->lastInsertId();

        $fetchStmt = $db->prepare('SELECT * FROM members WHERE id = :id');
        $fetchStmt->execute([':id' => $newId]);
        $newMember = $fetchStmt->fetch();

        Response::success($newMember, 'Member added successfully', 201);
    }

    /**
     * PUT /api/members/{id}
     */
    public function update(int $id): void
    {
        AuthMiddleware::verify();

        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $db = Database::getConnection();

        $stmt = $db->prepare('SELECT id FROM members WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $id]);
        if (!$stmt->fetch()) {
            Response::notFound('Member not found.');
        }

        $updates = [];
        $params = [':id' => $id];

        $fields = ['name', 'phone', 'role', 'status', 'joined_date', 'member_id'];
        foreach ($fields as $field) {
            if (isset($input[$field])) {
                $updates[] = "$field = :$field";
                $params[":$field"] = trim((string)$input[$field]);
            }
        }

        if (isset($input['email'])) {
            $email = strtolower(trim((string)$input['email']));
            $check = $db->prepare('SELECT id FROM members WHERE email = :email AND id != :id LIMIT 1');
            $check->execute([':email' => $email, ':id' => $id]);
            if ($check->fetch()) {
                Response::badRequest('Another member already has this email address.');
            }
            $updates[] = 'email = :email';
            $params[':email'] = $email;
        }

        if (empty($updates)) {
            Response::badRequest('No update data provided.');
        }

        $sql = 'UPDATE members SET ' . implode(', ', $updates) . ' WHERE id = :id';
        $updateStmt = $db->prepare($sql);
        $updateStmt->execute($params);

        $fetchStmt = $db->prepare('SELECT * FROM members WHERE id = :id');
        $fetchStmt->execute([':id' => $id]);
        $updatedMember = $fetchStmt->fetch();

        Response::success($updatedMember, 'Member updated successfully');
    }

    /**
     * DELETE /api/members/{id}
     */
    public function delete(int $id): void
    {
        AuthMiddleware::verify();

        $db = Database::getConnection();
        $stmt = $db->prepare('DELETE FROM members WHERE id = :id');
        $stmt->execute([':id' => $id]);

        Response::success(null, 'Member deleted successfully');
    }
}
