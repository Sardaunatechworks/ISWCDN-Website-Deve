<?php
/**
 * ISWCDN API - Input Sanitizer Helper
 */

declare(strict_types=1);

namespace App\Helpers;

class Sanitizer
{
    /**
     * Recursively sanitize input data
     */
    public static function clean(mixed $data): mixed
    {
        if (is_array($data)) {
            foreach ($data as $k => $v) {
                $data[$k] = self::clean($v);
            }
            return $data;
        }

        if (is_string($data)) {
            return trim(htmlspecialchars($data, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'));
        }

        return $data;
    }

    /**
     * Clean email address
     */
    public static function email(string $email): string
    {
        return strtolower(trim(filter_var($email, FILTER_SANITIZE_EMAIL) ?: ''));
    }

    /**
     * Clean plain text without html encoding (for database text columns where prepared statements are used)
     */
    public static function plainText(string $text): string
    {
        return trim(strip_tags($text));
    }
}
