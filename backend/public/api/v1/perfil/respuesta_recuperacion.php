<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../../src/http.php';

apiRequireMethod('PATCH');
$session = apiRequireSession();
$data = apiReadJson();
$currentPassword = $data['password_actual'] ?? null;
$answer = apiNormalizeRecoveryAnswer($data['respuesta_recuperacion'] ?? null);

if (!is_string($currentPassword) || $currentPassword === '' || $answer === null) {
    apiRespond(400, [
        'error' => [
            'code' => 'invalid_input',
            'message' => 'Ingresá tu contraseña actual y una respuesta de entre 1 y 72 bytes.',
        ],
    ]);
}

try {
    $connection = database();
    $connection->beginTransaction();
    $statement = $connection->prepare(
        'SELECT password_hash FROM usuarios WHERE id = :id LIMIT 1 FOR UPDATE'
    );
    $statement->execute(['id' => $session['id']]);
    $user = $statement->fetch();

    if (!$user || !password_verify($currentPassword, $user['password_hash'])) {
        $connection->rollBack();
        apiRespond(401, [
            'error' => [
                'code' => 'invalid_current_password',
                'message' => 'La contraseña actual no es correcta.',
            ],
        ]);
    }

    $updateAnswer = $connection->prepare(
        'UPDATE usuarios
         SET respuesta_recuperacion_hash = :respuesta_recuperacion_hash
         WHERE id = :id'
    );
    $updateAnswer->execute([
        'respuesta_recuperacion_hash' => password_hash($answer, PASSWORD_DEFAULT),
        'id' => $session['id'],
    ]);

    $invalidateTokens = $connection->prepare(
        'UPDATE tokens_recuperacion
         SET usado_en = UTC_TIMESTAMP()
         WHERE id_usuario = :id_usuario AND usado_en IS NULL'
    );
    $invalidateTokens->execute(['id_usuario' => $session['id']]);
    $connection->commit();

    apiRespond(200, [
        'message' => 'La respuesta de recuperación se guardó correctamente.',
    ]);
} catch (Throwable $error) {
    if (isset($connection) && $connection->inTransaction()) {
        $connection->rollBack();
    }

    apiRespondInternalError('recovery_answer_update', $error);
}
