<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../../src/database.php';

try {
    database()->query('SELECT 1');
} catch (Throwable $error) {
    error_log('HADES API health check failed: ' . $error->getMessage());
    http_response_code(503);
    echo json_encode([
        'status' => 'error',
        'message' => 'El servicio o la base de datos no están disponibles.',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(200);
echo json_encode([
    'status' => 'ok',
    'database' => 'connected',
], JSON_UNESCAPED_UNICODE);
