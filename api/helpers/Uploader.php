<?php
/**
 * ISWCDN API - Secure File Uploader Helper
 */

declare(strict_types=1);

namespace App\Helpers;

class Uploader
{
    private const ALLOWED_MIME_TYPES = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp',
        'image/gif'  => 'gif',
    ];

    /**
     * Upload an image file securely to a designated subfolder
     *
     * @param array $file $_FILES['input_name']
     * @param string $subFolder 'team' or 'gallery'
     * @return string Relative URL path to uploaded file (e.g. '/api/uploads/team/abc.jpg')
     */
    public static function uploadImage(array $file, string $subFolder = 'general'): string
    {
        if (!isset($file['error']) || is_array($file['error'])) {
            Response::badRequest('Invalid file parameters.');
        }

        switch ($file['error']) {
            case UPLOAD_ERR_OK:
                break;
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                Response::badRequest('File exceeds maximum upload size limit.');
            case UPLOAD_ERR_NO_FILE:
                Response::badRequest('No file was uploaded.');
            default:
                Response::serverError('Unknown file upload error.');
        }

        if ($file['size'] > UPLOAD_MAX_BYTES) {
            Response::badRequest('File size exceeds the allowed limit (' . (UPLOAD_MAX_BYTES / (1024 * 1024)) . 'MB).');
        }

        // Verify true MIME type using finfo
        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($file['tmp_name']);

        if (!array_key_exists($mime, self::ALLOWED_MIME_TYPES)) {
            Response::badRequest('Invalid image file format. Allowed formats: JPG, PNG, WEBP, GIF.');
        }

        $extension = self::ALLOWED_MIME_TYPES[$mime];
        $targetDir = UPLOAD_DIR . '/' . trim($subFolder, '/');

        if (!is_dir($targetDir) && !mkdir($targetDir, 0755, true) && !is_dir($targetDir)) {
            Response::serverError('Failed to create target upload directory.');
        }

        $fileName = sprintf('%s_%s.%s', time(), bin2hex(random_bytes(8)), $extension);
        $targetPath = $targetDir . '/' . $fileName;

        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            Response::serverError('Failed to save uploaded file on server.');
        }

        // Return relative path accessible via web
        return '/api/uploads/' . trim($subFolder, '/') . '/' . $fileName;
    }
}
