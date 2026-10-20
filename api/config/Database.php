<?php
/**
 * ISWCDN API - Database Connection Manager (PDO Singleton)
 */

declare(strict_types=1);

namespace App\Config;

use PDO;
use PDOException;
use App\Helpers\Response;

class Database
{
    private static ?PDO $instance = null;

    private function __construct() {}
    private function __clone() {}

    /**
     * Get or initialize active PDO database connection
     */
    public static function getConnection(): PDO
    {
        if (self::$instance === null) {
            $dsn = sprintf(
                'mysql:host=%s;port=%d;dbname=%s;charset=%s',
                DB_HOST,
                DB_PORT,
                DB_NAME,
                DB_CHARSET
            );

            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            try {
                self::$instance = new PDO($dsn, DB_USER, DB_PASS, $options);
            } catch (PDOException $e) {
                if (APP_DEBUG) {
                    Response::serverError('Database connection failed: ' . $e->getMessage());
                } else {
                    Response::serverError('Internal Database Connection Error. Please verify server configuration.');
                }
            }
        }

        return self::$instance;
    }

    /**
     * Diagnostic helper to test DB connection
     */
    public static function testConnection(): bool
    {
        try {
            $pdo = self::getConnection();
            $pdo->query('SELECT 1');
            return true;
        } catch (\Throwable) {
            return false;
        }
    }
}
