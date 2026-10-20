<?php
/**
 * ISWCDN API - Gallery Controller
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Config\Database;
use App\Helpers\Response;
use App\Helpers\Uploader;
use App\Helpers\Validator;
use App\Middleware\AuthMiddleware;
use PDO;

class GalleryController
{
    /**
     * GET /api/gallery (Public)
     */
    public function list(): void
    {
        $category = trim((string)($_GET['category'] ?? ''));

        $db = Database::getConnection();
        $sql = "SELECT * FROM gallery WHERE image_url NOT REGEXP 'image([0-9]+)\\.png' AND image_url NOT LIKE '%logo%'";
        $params = [];

        if ($category !== '') {
            $sql .= ' AND category = :category';
            $params[':category'] = $category;
        }

        $sql .= ' ORDER BY order_index ASC, id ASC';

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $images = $stmt->fetchAll();

        Response::success($images);
    }

    /**
     * POST /api/gallery/upload (Admin File Upload)
     */
    public function uploadImage(): void
    {
        AuthMiddleware::verify();

        if (empty($_FILES['image'])) {
            Response::badRequest('No image file provided in request.');
        }

        $url = Uploader::uploadImage($_FILES['image'], 'gallery');
        Response::success(['image_url' => $url], 'Gallery photo uploaded successfully');
    }

    /**
     * POST /api/gallery (Admin)
     */
    public function create(): void
    {
        AuthMiddleware::verify();

        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $validator = Validator::make($input)
            ->required('title')
            ->required('image_url');
        $validator->validateOrExit();

        $db = Database::getConnection();

        $stmt = $db->prepare('
            INSERT INTO gallery (title, image_url, category, order_index)
            VALUES (:title, :image_url, :category, :order_index)
        ');

        $stmt->execute([
            ':title'       => trim((string)$input['title']),
            ':image_url'   => trim((string)$input['image_url']),
            ':category'    => trim((string)($input['category'] ?? 'General')),
            ':order_index' => (int)($input['order_index'] ?? 0),
        ]);

        $newId = (int)$db->lastInsertId();

        $fetchStmt = $db->prepare('SELECT * FROM gallery WHERE id = :id');
        $fetchStmt->execute([':id' => $newId]);

        Response::success($fetchStmt->fetch(), 'Image added to gallery', 201);
    }

    /**
     * DELETE /api/gallery/{id} (Admin)
     */
    public function delete(int $id): void
    {
        AuthMiddleware::verify();

        $db = Database::getConnection();
        $stmt = $db->prepare('DELETE FROM gallery WHERE id = :id');
        $stmt->execute([':id' => $id]);

        Response::success(null, 'Gallery image deleted successfully');
    }
}
