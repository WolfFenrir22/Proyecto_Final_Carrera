<?php

declare(strict_types=1);

require_once __DIR__ . '/database.php';

function apiRespond(int $status, array $body): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    exit;
}

function apiRespondNoContent(): void
{
    http_response_code(204);
    exit;
}

function apiRequireMethod(string $method): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== $method) {
        header('Allow: ' . $method);
        apiRespond(405, [
            'error' => [
                'code' => 'method_not_allowed',
                'message' => 'El método HTTP no está permitido para este endpoint.',
            ],
        ]);
    }
}

function apiReadJson(): array
{
    $contentLength = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
    $contentType = strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0]));

    if ($contentLength > 16384) {
        apiRespond(413, [
            'error' => [
                'code' => 'request_too_large',
                'message' => 'La solicitud supera el tamaño permitido.',
            ],
        ]);
    }

    if ($contentType !== 'application/json') {
        apiRespond(415, [
            'error' => [
                'code' => 'unsupported_media_type',
                'message' => 'El Content-Type debe ser application/json.',
            ],
        ]);
    }

    $rawBody = file_get_contents('php://input');

    if ($rawBody !== false && strlen($rawBody) > 16384) {
        apiRespond(413, [
            'error' => [
                'code' => 'request_too_large',
                'message' => 'La solicitud supera el tamaño permitido.',
            ],
        ]);
    }

    try {
        $data = json_decode($rawBody === false ? '' : $rawBody, true, 512, JSON_THROW_ON_ERROR);
    } catch (JsonException) {
        apiRespond(400, [
            'error' => [
                'code' => 'invalid_json',
                'message' => 'El cuerpo de la solicitud debe ser JSON válido.',
            ],
        ]);
    }

    if (!is_array($data) || array_is_list($data)) {
        apiRespond(400, [
            'error' => [
                'code' => 'invalid_json',
                'message' => 'El cuerpo de la solicitud debe ser un objeto JSON.',
            ],
        ]);
    }

    return $data;
}

function apiNormalizeEmail(mixed $email): ?string
{
    if (!is_string($email)) {
        return null;
    }

    $email = mb_strtolower(trim($email), 'UTF-8');

    if (strlen($email) > 254 || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
        return null;
    }

    return $email;
}

function apiValidatePassword(mixed $password): bool
{
    return is_string($password)
        && strlen($password) <= 72
        && mb_strlen($password, 'UTF-8') >= 12;
}

function apiBearerToken(): ?string
{
    $authorization = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

    if ($authorization === '' && function_exists('getallheaders')) {
        $headers = getallheaders();
        $authorization = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }

    if (!is_string($authorization)
        || preg_match('/^Bearer ([A-Za-z0-9_-]{43})$/D', trim($authorization), $matches) !== 1
    ) {
        return null;
    }

    return $matches[1];
}

function apiRequireSession(): array
{
    $token = apiBearerToken();

    if ($token === null) {
        apiRespond(401, [
            'error' => [
                'code' => 'unauthenticated',
                'message' => 'Iniciá sesión para continuar.',
            ],
        ]);
    }

    try {
        $statement = database()->prepare(
            'SELECT
                sesiones.id AS id_sesion,
                sesiones.fecha_expiracion,
                usuarios.id,
                usuarios.nombre,
                usuarios.correo,
                usuarios.rol
             FROM sesiones
             INNER JOIN usuarios ON usuarios.id = sesiones.id_usuario
             WHERE sesiones.token_hash = :token_hash
               AND sesiones.revocada_en IS NULL
               AND sesiones.fecha_expiracion > UTC_TIMESTAMP()
             LIMIT 1'
        );
        $statement->execute(['token_hash' => hash('sha256', $token)]);
        $session = $statement->fetch();

        if (!$session) {
            apiRespond(401, [
                'error' => [
                    'code' => 'invalid_session',
                    'message' => 'La sesión no es válida o ya venció. Iniciá sesión nuevamente.',
                ],
            ]);
        }

        return $session;
    } catch (Throwable $error) {
        apiRespondInternalError('session_validation', $error);
    }
}

function apiRequireAdminSession(): array
{
    $session = apiRequireSession();

    if ($session['rol'] !== 'Administrador') {
        apiRespond(403, [
            'error' => [
                'code' => 'forbidden',
                'message' => 'No tenés permisos para acceder a esta sección.',
            ],
        ]);
    }

    return $session;
}

function apiLogFailure(string $operation, Throwable $error): void
{
    error_log(sprintf('HADES API %s failed: %s', $operation, $error->getMessage()));
}

function apiRespondInternalError(string $operation, Throwable $error): void
{
    apiLogFailure($operation, $error);
    apiRespond(500, [
        'error' => [
            'code' => 'internal_error',
            'message' => 'Ocurrió un error interno. Intentá nuevamente más tarde.',
        ],
    ]);
}
