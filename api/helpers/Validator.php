<?php
/**
 * ISWCDN API - Request Validator Helper
 */

declare(strict_types=1);

namespace App\Helpers;

class Validator
{
    private array $errors = [];

    public function __construct(private array $data) {}

    public static function make(array $data): self
    {
        return new self($data);
    }

    public function required(string $field, string $label = ''): self
    {
        $label = $label ?: ucfirst(str_replace('_', ' ', $field));
        $val = $this->data[$field] ?? null;

        if ($val === null || (is_string($val) && trim($val) === '') || (is_array($val) && empty($val))) {
            $this->errors[$field][] = "$label is required.";
        }

        return $this;
    }

    public function email(string $field, string $label = ''): self
    {
        $label = $label ?: ucfirst(str_replace('_', ' ', $field));
        $val = $this->data[$field] ?? null;

        if (!empty($val) && !filter_var($val, FILTER_VALIDATE_EMAIL)) {
            $this->errors[$field][] = "$label must be a valid email address.";
        }

        return $this;
    }

    public function minLength(string $field, int $min, string $label = ''): self
    {
        $label = $label ?: ucfirst(str_replace('_', ' ', $field));
        $val = $this->data[$field] ?? '';

        if (!empty($val) && mb_strlen((string)$val) < $min) {
            $this->errors[$field][] = "$label must be at least $min characters long.";
        }

        return $this;
    }

    public function in(string $field, array $allowed, string $label = ''): self
    {
        $label = $label ?: ucfirst(str_replace('_', ' ', $field));
        $val = $this->data[$field] ?? null;

        if (!empty($val) && !in_array($val, $allowed, true)) {
            $this->errors[$field][] = "$label must be one of: " . implode(', ', $allowed);
        }

        return $this;
    }

    public function passes(): bool
    {
        return empty($this->errors);
    }

    public function fails(): bool
    {
        return !empty($this->errors);
    }

    public function getErrors(): array
    {
        return $this->errors;
    }

    public function validateOrExit(): void
    {
        if ($this->fails()) {
            Response::validationError($this->errors);
        }
    }
}
