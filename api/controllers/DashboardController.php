<?php
/**
 * ISWCDN API - Admin Dashboard Controller
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Config\Database;
use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use PDO;

class DashboardController
{
    /**
     * GET /api/dashboard/stats (Admin)
     */
    public function stats(): void
    {
        AuthMiddleware::verify();

        $db = Database::getConnection();

        // 1. Aggregated KPI Counts
        $memberCount = (int)$db->query('SELECT COUNT(*) FROM members')->fetchColumn();
        $pendingAppCount = (int)$db->query('SELECT COUNT(*) FROM applications WHERE status = "Pending"')->fetchColumn();
        $courseCount = (int)$db->query('SELECT COUNT(*) FROM courses WHERE is_active = 1')->fetchColumn();
        $galleryCount = (int)$db->query('SELECT COUNT(*) FROM gallery')->fetchColumn();
        $messageCount = (int)$db->query('SELECT COUNT(*) FROM messages WHERE status = "New"')->fetchColumn();

        // 2. Recent Applications (Top 5)
        $recentAppsStmt = $db->query('
            SELECT id, name, program, status, submitted_at, application_type
            FROM applications
            ORDER BY submitted_at DESC
            LIMIT 5
        ');
        $recentApps = $recentAppsStmt->fetchAll();

        // 3. Recent Inquiries (Top 5)
        $recentMsgsStmt = $db->query('
            SELECT id, name, email, subject, status, created_at
            FROM messages
            ORDER BY created_at DESC
            LIMIT 5
        ');
        $recentMessages = $recentMsgsStmt->fetchAll();

        // 4. Monthly Application Trends (Past 6 Months)
        $trendsStmt = $db->query('
            SELECT 
                DATE_FORMAT(submitted_at, "%b") as month_name,
                COUNT(*) as applications
            FROM applications
            WHERE submitted_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY YEAR(submitted_at), MONTH(submitted_at), DATE_FORMAT(submitted_at, "%b")
            ORDER BY YEAR(submitted_at) ASC, MONTH(submitted_at) ASC
        ');
        $monthlyTrends = $trendsStmt->fetchAll();

        Response::success([
            'stats' => [
                'totalMembers'       => $memberCount,
                'activeApplications' => $pendingAppCount,
                'totalCourses'       => $courseCount,
                'totalGallery'       => $galleryCount,
                'newMessages'        => $messageCount,
            ],
            'recentApps'     => $recentApps,
            'recentMessages' => $recentMessages,
            'monthlyTrends'  => $monthlyTrends,
        ]);
    }
}
