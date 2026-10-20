<?php
/**
 * ISWCDN API - Rate Limiter Middleware
 */

declare(strict_types=1);

namespace App\Middleware;

use App\Helpers\Response;

class RateLimiter
{
    /**
     * Check if request limit has been exceeded for client IP
     *
     * @param string $action Key descriptor, e.g. 'contact_form', 'application'
     * @param int $maxAttempts Maximum allowed requests
     * @param int $decaySeconds Window duration in seconds
     */
    public static function check(string $action, int $maxAttempts = 10, int $decaySeconds = 60): void
    {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        $key = 'rl_' . md5($action . '_' . $ip);
        $tmpDir = sys_get_temp_dir() . '/iswcdn_ratelimits';

        if (!is_dir($tmpDir)) {
            @mkdir($tmpDir, 0755, true);
        }

        $filePath = $tmpDir . '/' . $key . '.json';
        $now = time();

        $data = ['count' => 0, 'expires_at' => $now + $decaySeconds];

        if (file_exists($filePath)) {
            $raw = @file_get_contents($filePath);
            if ($raw) {
                $decoded = json_decode($raw, true);
                if (is_array($decoded) && isset($decoded['expires_at']) && $decoded['expires_at'] > $now) {
                    $data = $decoded;
                }
            }
        }

        if ($data['count'] >= $maxAttempts) {
            $retryAfter = $data['expires_at'] - $now;
            header('Retry-After: ' . $retryAfter);
            Response::error('Too many requests. Please wait ' . $retryAfter . ' seconds before trying again.', 429);
        }

        $data['count']++;
        @file_put_contents($filePath, json_encode($data), LOCK_EX);
    }
}
