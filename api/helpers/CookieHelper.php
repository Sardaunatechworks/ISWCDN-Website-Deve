<?php
/**
 * ISWCDN API - Secure Cookie Management Helper
 */

declare(strict_types=1);

namespace App\Helpers;

class CookieHelper
{
    public const ACCESS_COOKIE = 'iswcdn_access_token';
    public const CSRF_COOKIE = 'iswcdn_csrf_token';

    /**
     * Determine if current connection is HTTPS
     */
    public static function isSecure(): bool
    {
        if (!empty($_SERVER['HTTPS']) && strtolower($_SERVER['HTTPS']) !== 'off') {
            return true;
        }

        if ((int) ($_SERVER['SERVER_PORT'] ?? 0) === 443) {
            return true;
        }

        if (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && strtolower($_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https') {
            return true;
        }

        return str_starts_with(APP_URL, 'https://');
    }

    /**
     * Set authentication cookie and CSRF cookie
     */
    public static function setAuthCookies(string $accessToken, int $ttl = JWT_EXPIRATION): void
    {
        $now = time();
        $secure = self::isSecure();
        $sameSite = $secure ? 'None' : 'Lax';

        // 1. HttpOnly JWT Access Cookie
        @setcookie(self::ACCESS_COOKIE, $accessToken, [
            'expires'  => $now + $ttl,
            'path'     => '/',
            'domain'   => '',
            'secure'   => $secure,
            'httponly' => true,
            'samesite' => $sameSite,
        ]);

        // 2. Readable CSRF Cookie
        $csrf = bin2hex(random_bytes(32));
        @setcookie(self::CSRF_COOKIE, $csrf, [
            'expires'  => $now + $ttl,
            'path'     => '/',
            'domain'   => '',
            'secure'   => $secure,
            'httponly' => false,
            'samesite' => $sameSite,
        ]);

        $_COOKIE[self::ACCESS_COOKIE] = $accessToken;
        $_COOKIE[self::CSRF_COOKIE] = $csrf;
    }

    /**
     * Clear auth cookies on logout
     */
    public static function clearAuthCookies(): void
    {
        $secure = self::isSecure();
        $sameSite = $secure ? 'None' : 'Lax';

        $opts = [
            'expires'  => 1,
            'path'     => '/',
            'domain'   => '',
            'secure'   => $secure,
            'httponly' => true,
            'samesite' => $sameSite,
        ];

        @setcookie(self::ACCESS_COOKIE, '', $opts);
        $opts['httponly'] = false;
        @setcookie(self::CSRF_COOKIE, '', $opts);

        unset($_COOKIE[self::ACCESS_COOKIE], $_COOKIE[self::CSRF_COOKIE]);
    }
}
