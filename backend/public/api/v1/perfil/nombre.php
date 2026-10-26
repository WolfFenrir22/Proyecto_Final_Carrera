<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../../src/http.php';

apiRequireMethod('PATCH');
$session = apiRequireSession();
$data = apiReadJson();
$name = $data['nombre'] ?? null;

if (
    !is_string($name)
    || mb_strlen(trim($name), 'UTF-8') < 2
    || mb_strlen(trim($name), 'UTF-8') > 40
) {
    apiRespond(400, [
        'error' => [
            'code' => 'invalid_name',
            'message' => 'El nombre debe tener entre 2 y 40 caracteres.',
        ],
    ]);
}

$name = trim($name);

try {
    $statement = database()->prepare(
        'UPDATE usuarios SET nombre = :nombre WHERE id = :id'
    );
    $statement->execute([
        'nombre' => $name,
        'id' => $session['id'],
    ]);

    apiRespond(200, [
        'usuario' => [
            'id' => (int) $session['id'],
            'nombre' => $name,
            'correo' => $session['correo'],
            'rol' => $session['rol'],
        ],
    ]);
} catch (Throwable $error) {
    apiRespondInternalError('profile_name_update', $error);
}
