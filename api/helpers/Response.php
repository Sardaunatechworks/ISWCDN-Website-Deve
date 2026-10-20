<?php
/**
 * ISWCDN API - Standardized JSON Response Helper
 */

declare(strict_types=1);

namespace App\Helpers;

class Response
{
    /**
     * Send standard JSON output and terminate execution
     */
    public static function json(array $data, int $statusCode = 200): void
    {
        if (!headers_sent()) {
            http_response_code($statusCode);
            header('Content-Type: application/json; charset=utf-8');
        }

        echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit(0);
    }

    /**
     * Send success response (200 OK or 201 Created)
     */
    public static function success(mixed $data = null, string $message = 'Success', int $statusCode = 200): void
    {
        self::json([
            'status'  => 'success',
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ], $statusCode);
    }

    /**
     * Send generic error response
     */
    public static function error(string $message, int $statusCode = 400, mixed $errors = null): void
    {
        $payload = [
            'status'  => 'error',
            'success' => false,
            'message' => $message,
        ];

        if ($errors !== null) {
            $payload['errors'] = $errors;
        }

        self::json($payload, $statusCode);
    }

    /**
     * 400 Bad Request
     */
    public static function badRequest(string $message = 'Bad request', mixed $errors = null): void
    {
        self::error($message, 400, $errors);
    }

    /**
     * 401 Unauthorized
     */
    public static function unauthorized(string $message = 'Authentication required'): void
    {
        self::error($message, 401);
    }

    /**
     * 403 Forbidden
     */
    public static function forbidden(string $message = 'Access forbidden. Insufficient permissions.'): void
    {
        self::error($message, 403);
    }

    /**
     * 404 Not Found
     */
    public static function notFound(string $message = 'Requested resource not found'): void
    {
        self::error($message, 404);
    }

    /**
     * 422 Unprocessable Entity (Validation failed)
     */
    public static function validationError(array $errors, string $message = 'Validation failed'): void
    {
        self::error($message, 422, $errors);
    }

    /**
     * 500 Internal Server Error
     */
    public static function serverError(string $message = 'An unexpected server error occurred'): void
    {
        self::error($message, 500);
    }
}
