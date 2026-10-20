<?php
/**
 * ISWCDN API - Institutional Settings Controller (Singleton)
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Config\Database;
use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use PDO;

class SettingController
{
    /**
     * GET /api/settings (Public)
     */
    public function get(): void
    {
        $db = Database::getConnection();
        $stmt = $db->query('SELECT * FROM settings WHERE id = 1 LIMIT 1');
        $settings = $stmt->fetch();

        if (!$settings) {
            // Default fallback
            $settings = [
                'id'           => 1,
                'phone1'       => '+234 803 627 4417',
                'phone2'       => '+234 803 624 9795',
                'email'        => 'info@isowcod.org.ng',
                'location'     => 'Bauchi, Nigeria',
                'address'      => 'Flat 2 block 4 ZAMZAM block, Awalah roundabout',
                'years_impact' => '10+',
            ];
        }

        Response::success($settings);
    }

    /**
     * PUT /api/settings (Admin)
     */
    public function update(): void
    {
        AuthMiddleware::verify();

        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $db = Database::getConnection();

        $stmt = $db->prepare('
            INSERT INTO settings (id, phone1, phone2, email, location, address, years_impact)
            VALUES (1, :phone1, :phone2, :email, :location, :address, :years_impact)
            ON DUPLICATE KEY UPDATE
                phone1 = VALUES(phone1),
                phone2 = VALUES(phone2),
                email = VALUES(email),
                location = VALUES(location),
                address = VALUES(address),
                years_impact = VALUES(years_impact)
        ');

        $stmt->execute([
            ':phone1'       => trim((string)($input['phone1'] ?? '')),
            ':phone2'       => trim((string)($input['phone2'] ?? '')),
            ':email'        => trim((string)($input['email'] ?? '')),
            ':location'     => trim((string)($input['location'] ?? '')),
            ':address'      => trim((string)($input['address'] ?? '')),
            ':years_impact' => trim((string)($input['years_impact'] ?? '10+')),
        ]);

        $fetchStmt = $db->query('SELECT * FROM settings WHERE id = 1 LIMIT 1');
        Response::success($fetchStmt->fetch(), 'Institutional settings saved successfully.');
    }
}
