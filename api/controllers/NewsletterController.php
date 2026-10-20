<?php
/**
 * ISWCDN API - Newsletter & Broadcasts Controller
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Config\Database;
use App\Helpers\Response;
use App\Helpers\Validator;
use App\Middleware\AuthMiddleware;
use App\Middleware\RateLimiter;
use PDO;

class NewsletterController
{
    /**
     * POST /api/newsletter/subscribe (Public)
     */
    public function subscribe(): void
    {
        RateLimiter::check('newsletter_sub', 5, 60);

        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $validator = Validator::make($input)
            ->required('email')
            ->email('email');
        $validator->validateOrExit();

        $email = strtolower(trim((string)$input['email']));

        $db = Database::getConnection();

        // Check if already subscribed
        $check = $db->prepare('SELECT id FROM subscribers WHERE email = :email LIMIT 1');
        $check->execute([':email' => $email]);
        if ($check->fetch()) {
            Response::success(null, 'You are already subscribed to the ISWCDN official bulletin.');
        }

        $stmt = $db->prepare('INSERT INTO subscribers (email) VALUES (:email)');
        $stmt->execute([':email' => $email]);

        Response::success(null, 'Thank you for subscribing to ISWCDN institutional updates!', 201);
    }

    /**
     * GET /api/admin/newsletter/subscribers (Admin)
     */
    public function subscribers(): void
    {
        AuthMiddleware::verify();

        $db = Database::getConnection();
        $stmt = $db->query('SELECT * FROM subscribers ORDER BY created_at DESC');
        $subs = $stmt->fetchAll();

        Response::success($subs);
    }

    /**
     * DELETE /api/admin/newsletter/subscribers/{id} (Admin)
     */
    public function deleteSubscriber(int $id): void
    {
        AuthMiddleware::verify();

        $db = Database::getConnection();
        $stmt = $db->prepare('DELETE FROM subscribers WHERE id = :id');
        $stmt->execute([':id' => $id]);

        Response::success(null, 'Subscriber removed successfully');
    }

    /**
     * GET /api/admin/newsletter/broadcasts (Admin)
     */
    public function broadcasts(): void
    {
        AuthMiddleware::verify();

        $db = Database::getConnection();
        $stmt = $db->query('SELECT * FROM broadcasts ORDER BY sent_at DESC');
        $broadcasts = $stmt->fetchAll();

        Response::success($broadcasts);
    }

    /**
     * POST /api/admin/newsletter/broadcast (Admin)
     */
    public function sendBroadcast(): void
    {
        AuthMiddleware::verify();

        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $validator = Validator::make($input)
            ->required('subject')
            ->required('content');
        $validator->validateOrExit();

        $db = Database::getConnection();

        // Count active subscribers
        $countStmt = $db->query('SELECT COUNT(*) FROM subscribers WHERE is_active = 1');
        $recipientCount = (int)$countStmt->fetchColumn();

        // Insert into broadcasts log
        $stmt = $db->prepare('
            INSERT INTO broadcasts (subject, content, recipient_count, sent_at)
            VALUES (:subject, :content, :recipients, NOW())
        ');

        $stmt->execute([
            ':subject'    => trim((string)$input['subject']),
            ':content'    => trim((string)$input['content']),
            ':recipients' => $recipientCount,
        ]);

        $newId = (int)$db->lastInsertId();

        $fetchStmt = $db->prepare('SELECT * FROM broadcasts WHERE id = :id');
        $fetchStmt->execute([':id' => $newId]);

        Response::success($fetchStmt->fetch(), sprintf('Broadcast queued successfully to %d active subscribers.', $recipientCount), 201);
    }
}
