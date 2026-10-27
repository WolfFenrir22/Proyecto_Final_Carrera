<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../../src/http.php';

apiRequireMethod('POST');
$data = apiReadJson();
$token = $data['token'] ?? null;
$newPassword = $data['password_nueva'] ?? null;

if (!is_string($token)
    || preg_match('/^[A-Za-z0-9_-]{43}$/D', $token) !== 1
    || !apiValidatePassword($newPassword)
) {
    apiRespond(400, [
        'error' => [
            'code' => 'invalid_input',
            'message' => 'El enlace o la nueva contraseña no son válidos.',
        ],
    ]);
}

try {
    $connection = database();
    $connection->beginTransaction();
    $statement = $connection->prepare(
        'SELECT id, id_usuario
         FROM tokens_recuperacion
         WHERE token_hash = :token_hash
           AND usado_en IS NULL
           AND fecha_expiracion > UTC_TIMESTAMP()
           AND verificado_en > UTC_TIMESTAMP() - INTERVAL 10 MINUTE
         LIMIT 1
         FOR UPDATE'
    );
    $statement->execute(['token_hash' => hash('sha256', $token)]);
    $recovery = $statement->fetch();

    if (!$recovery) {
        $connection->rollBack();
        apiRespond(410, [
            'error' => [
                'code' => 'invalid_recovery_token',
                'message' => 'El enlace venció o ya fue utilizado. Solicitá uno nuevo.',
            ],
        ]);
    }

    $updatePassword = $connection->prepare(
        'UPDATE usuarios SET password_hash = :password_hash WHERE id = :id'
    );
    $updatePassword->execute([
        'password_hash' => password_hash($newPassword, PASSWORD_DEFAULT),
        'id' => $recovery['id_usuario'],
    ]);

    $consumeTokens = $connection->prepare(
        'UPDATE tokens_recuperacion
         SET usado_en = UTC_TIMESTAMP()
         WHERE id_usuario = :id_usuario AND usado_en IS NULL'
    );
    $consumeTokens->execute(['id_usuario' => $recovery['id_usuario']]);

    $revokeSessions = $connection->prepare(
        'UPDATE sesiones
         SET revocada_en = UTC_TIMESTAMP()
         WHERE id_usuario = :id_usuario AND revocada_en IS NULL'
    );
    $revokeSessions->execute(['id_usuario' => $recovery['id_usuario']]);
    $connection->commit();

    apiRespond(200, [
        'message' => 'La contraseña se actualizó correctamente.',
    ]);
} catch (Throwable $error) {
    if (isset($connection) && $connection->inTransaction()) {
        $connection->rollBack();
    }

    apiRespondInternalError('password_recovery', $error);
}
