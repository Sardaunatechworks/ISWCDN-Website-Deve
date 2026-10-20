<?php
/**
 * ISWCDN API - Lightweight Zero-Dependency HMAC-SHA256 JWT Service
 */

declare(strict_types=1);

namespace App\Services;

class JWTService
{
    private string $secret;

    public function __construct(?string $secret = null)
    {
        $this->secret = $secret ?: JWT_SECRET;
    }

    /**
     * Generate a signed JWT
     */
    public function generate(array $payload, int $expiresInSeconds = JWT_EXPIRATION): string
    {
        $header = [
            'typ' => 'JWT',
            'alg' => 'HS256'
        ];

        $now = time();
        $payload['iat'] = $now;
        $payload['exp'] = $now + $expiresInSeconds;

        $encodedHeader = $this->base64UrlEncode(json_encode($header));
        $encodedPayload = $this->base64UrlEncode(json_encode($payload));

        $signature = hash_hmac('sha256', "$encodedHeader.$encodedPayload", $this->secret, true);
        $encodedSignature = $this->base64UrlEncode($signature);

        return "$encodedHeader.$encodedPayload.$encodedSignature";
    }

    /**
     * Verify and decode a JWT. Returns payload array or null if invalid/expired.
     */
    public function verify(string $token): ?array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        [$encodedHeader, $encodedPayload, $encodedSignature] = $parts;

        // Verify signature
        $expectedSignature = hash_hmac('sha256', "$encodedHeader.$encodedPayload", $this->secret, true);
        $providedSignature = $this->base64UrlDecode($encodedSignature);

        if (!hash_equals($expectedSignature, $providedSignature)) {
            return null;
        }

        // Decode payload
        $payloadJson = $this->base64UrlDecode($encodedPayload);
        $payload = json_decode($payloadJson, true);

        if (!is_array($payload)) {
            return null;
        }

        // Check expiration
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return null; // Expired
        }

        return $payload;
    }

    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function base64UrlDecode(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
