<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../../src/http.php';

apiRequireMethod('PATCH');
$session = apiRequireSession();
$data = apiReadJson();
$currentPassword = $data['password_actual'] ?? null;
$newPassword = $data['password_nueva'] ?? null;

if (!is_string($currentPassword) || $currentPassword === '' || !apiValidatePassword($newPassword)) {
    apiRespond(400, [
        'error' => [
            'code' => 'invalid_password',
            'message' => 'Ingresá la contraseña actual y una nueva contraseña de entre 12 y 72 bytes.',
        ],
    ]);
}

try {
    $connection = database();
    $statement = $connection->prepare(
        'SELECT password_hash FROM usuarios WHERE id = :id LIMIT 1'
    );
    $statement->execute(['id' => $session['id']]);
    $user = $statement->fetch();

    if (!$user || !password_verify($currentPassword, $user['password_hash'])) {
        apiRespond(401, [
            'error' => [
                'code' => 'invalid_current_password',
                'message' => 'La contraseña actual no es correcta.',
            ],
        ]);
    }

    if (hash_equals($currentPassword, $newPassword)) {
        apiRespond(400, [
            'error' => [
                'code' => 'password_unchanged',
                'message' => 'La nueva contraseña debe ser distinta de la actual.',
            ],
        ]);
    }

    $connection->beginTransaction();
    $updatePassword = $connection->prepare(
        'UPDATE usuarios SET password_hash = :password_hash WHERE id = :id'
    );
    $updatePassword->execute([
        'password_hash' => password_hash($newPassword, PASSWORD_DEFAULT),
        'id' => $session['id'],
    ]);

    $revokeOtherSessions = $connection->prepare(
        'UPDATE sesiones
         SET revocada_en = UTC_TIMESTAMP()
         WHERE id_usuario = :id_usuario
           AND id <> :id_sesion
           AND revocada_en IS NULL'
    );
    $revokeOtherSessions->execute([
        'id_usuario' => $session['id'],
        'id_sesion' => $session['id_sesion'],
    ]);
    $connection->commit();

    apiRespondNoContent();
} catch (Throwable $error) {
    if (isset($connection) && $connection->inTransaction()) {
        $connection->rollBack();
    }

    apiRespondInternalError('profile_password_update', $error);
}
