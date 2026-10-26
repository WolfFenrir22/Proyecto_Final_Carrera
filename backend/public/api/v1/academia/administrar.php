<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../../src/http.php';

$method = $_SERVER['REQUEST_METHOD'] ?? '';

if (!in_array($method, ['GET', 'POST', 'PATCH', 'DELETE'], true)) {
    header('Allow: GET, POST, PATCH, DELETE');
    apiRespond(405, [
        'error' => [
            'code' => 'method_not_allowed',
            'message' => 'El método HTTP no está permitido para este endpoint.',
        ],
    ]);
}

apiRequireAdminSession();

function apiAcademyContentTypes(): array
{
    return [
        'scenario_sv',
        'scenario_phishing',
        'concept',
        'myth',
        'trivia',
        'section',
    ];
}

function apiAcademyContentInput(array $data): array
{
    $type = $data['tipo'] ?? null;
    $key = $data['clave'] ?? null;
    $order = filter_var($data['orden'] ?? null, FILTER_VALIDATE_INT);
    $active = filter_var($data['activo'] ?? null, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
    $payload = $data['payload'] ?? null;

    if (
        !is_string($type)
        || !in_array($type, apiAcademyContentTypes(), true)
        || !is_string($key)
        || preg_match('/^[a-zA-Z0-9_-]{1,100}$/', $key) !== 1
        || $order === false
        || $order < 0
        || $order > 65535
        || $active === null
        || !is_array($payload)
        || array_is_list($payload)
        || $payload === []
    ) {
        apiRespond(400, [
            'error' => [
                'code' => 'invalid_academy_content',
                'message' => 'Revisá tipo, clave, orden, estado y contenido JSON.',
            ],
        ]);
    }

    return [
        'tipo' => $type,
        'clave' => $key,
        'orden' => $order,
        'activo' => $active ? 1 : 0,
        'payload' => json_encode(
            $payload,
            JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR
        ),
    ];
}

function apiAcademyContentId(mixed $value): int
{
    $id = filter_var($value, FILTER_VALIDATE_INT);

    if ($id === false || $id < 1) {
        apiRespond(400, [
            'error' => [
                'code' => 'invalid_content_id',
                'message' => 'El identificador del contenido no es válido.',
            ],
        ]);
    }

    return $id;
}

try {
    $connection = database();

    if ($method === 'GET') {
        $statement = $connection->query(
            'SELECT id, tipo, clave, orden, payload, activo,
                    fecha_creacion, fecha_actualizacion
             FROM contenido_academia
             ORDER BY tipo, orden, id'
        );
        $records = array_map(
            static function (array $row): array {
                $row['id'] = (int) $row['id'];
                $row['orden'] = (int) $row['orden'];
                $row['activo'] = (bool) $row['activo'];
                $row['payload'] = json_decode(
                    $row['payload'],
                    true,
                    512,
                    JSON_THROW_ON_ERROR
                );

                return $row;
            },
            $statement->fetchAll()
        );

        apiRespond(200, ['contenidos' => $records]);
    }

    if ($method === 'POST') {
        $data = apiReadJson();
        $content = apiAcademyContentInput($data);
        $statement = $connection->prepare(
            'INSERT INTO contenido_academia (tipo, clave, orden, payload, activo)
             VALUES (:tipo, :clave, :orden, :payload, :activo)'
        );
        $statement->execute($content);

        apiRespond(201, [
            'id' => (int) $connection->lastInsertId(),
            'message' => 'El contenido se creó correctamente.',
        ]);
    }

    if ($method === 'PATCH') {
        $data = apiReadJson();
        $id = apiAcademyContentId($data['id'] ?? null);
        $content = apiAcademyContentInput($data);
        $content['id'] = $id;
        $statement = $connection->prepare(
            'UPDATE contenido_academia
             SET tipo = :tipo, clave = :clave, orden = :orden,
                 payload = :payload, activo = :activo
             WHERE id = :id'
        );
        $statement->execute($content);

        if ($statement->rowCount() === 0) {
            $exists = $connection->prepare(
                'SELECT 1 FROM contenido_academia WHERE id = :id LIMIT 1'
            );
            $exists->execute(['id' => $id]);

            if (!$exists->fetchColumn()) {
                apiRespond(404, [
                    'error' => [
                        'code' => 'content_not_found',
                        'message' => 'No se encontró ese contenido.',
                    ],
                ]);
            }
        }

        apiRespond(200, ['message' => 'El contenido se actualizó correctamente.']);
    }

    $data = apiReadJson();
    $id = apiAcademyContentId($data['id'] ?? null);
    $statement = $connection->prepare(
        'DELETE FROM contenido_academia WHERE id = :id'
    );
    $statement->execute(['id' => $id]);

    if ($statement->rowCount() === 0) {
        apiRespond(404, [
            'error' => [
                'code' => 'content_not_found',
                'message' => 'No se encontró ese contenido.',
            ],
        ]);
    }

    apiRespond(200, ['message' => 'El contenido se eliminó correctamente.']);
} catch (PDOException $error) {
    if ($error->getCode() === '23000') {
        apiRespond(409, [
            'error' => [
                'code' => 'duplicate_academy_content',
                'message' => 'Ya existe un contenido con ese tipo y clave.',
            ],
        ]);
    }

    apiRespondInternalError('academy_content_admin', $error);
} catch (Throwable $error) {
    apiRespondInternalError('academy_content_admin', $error);
}
