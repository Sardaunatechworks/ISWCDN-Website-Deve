<?php
/**
 * ISWCDN API - Contact Messages & Inquiries Controller
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Config\Database;
use App\Helpers\Response;
use App\Helpers\Validator;
use App\Middleware\AuthMiddleware;
use App\Middleware\RateLimiter;
use PDO;

class MessageController
{
    /**
     * POST /api/messages/submit (Public)
     */
    public function submit(): void
    {
        RateLimiter::check('contact_message', 5, 60);

        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $validator = Validator::make($input)
            ->required('name')
            ->minLength('name', 2)
            ->required('email')
            ->email('email')
            ->required('subject')
            ->required('message')
            ->minLength('message', 5);
        $validator->validateOrExit();

        $db = Database::getConnection();

        $stmt = $db->prepare('
            INSERT INTO messages (name, email, subject, message, status)
            VALUES (:name, :email, :subject, :message, "New")
        ');

        $stmt->execute([
            ':name'    => trim((string)$input['name']),
            ':email'   => strtolower(trim((string)$input['email'])),
            ':subject' => trim((string)$input['subject']),
            ':message' => trim((string)$input['message']),
        ]);

        Response::success(null, 'Your message has been sent successfully. The Secretariat will respond shortly.', 201);
    }

    /**
     * GET /api/messages (Admin)
     */
    public function list(): void
    {
        AuthMiddleware::verify();

        $status = trim((string)($_GET['status'] ?? ''));

        $db = Database::getConnection();
        $sql = 'SELECT * FROM messages';
        $params = [];

        if ($status !== '') {
            $sql .= ' WHERE status = :status';
            $params[':status'] = $status;
        }

        $sql .= ' ORDER BY created_at DESC';

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $messages = $stmt->fetchAll();

        Response::success($messages);
    }

    /**
     * GET /api/messages/{id} (Admin)
     */
    public function show(int $id): void
    {
        AuthMiddleware::verify();

        $db = Database::getConnection();
        $stmt = $db->prepare('SELECT * FROM messages WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $id]);
        $message = $stmt->fetch();

        if (!$message) {
            Response::notFound('Message not found.');
        }

        // Auto-mark as read if new
        if ($message['status'] === 'New') {
            $upStmt = $db->prepare('UPDATE messages SET status = "Read" WHERE id = :id');
            $upStmt->execute([':id' => $id]);
            $message['status'] = 'Read';
        }

        Response::success($message);
    }

    /**
     * PATCH /api/messages/{id}/status (Admin)
     */
    public function markStatus(int $id): void
    {
        AuthMiddleware::verify();

        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $validator = Validator::make($input)
            ->required('status')
            ->in('status', ['New', 'Read', 'Archived']);
        $validator->validateOrExit();

        $db = Database::getConnection();

        $stmt = $db->prepare('UPDATE messages SET status = :status WHERE id = :id');
        $stmt->execute([
            ':status' => $input['status'],
            ':id'     => $id,
        ]);

        Response::success(['id' => $id, 'status' => $input['status']], 'Status updated.');
    }

    /**
     * DELETE /api/messages/{id} (Admin)
     */
    public function delete(int $id): void
    {
        AuthMiddleware::verify();

        $db = Database::getConnection();
        $stmt = $db->prepare('DELETE FROM messages WHERE id = :id');
        $stmt->execute([':id' => $id]);

        Response::success(null, 'Message deleted successfully');
    }
}
