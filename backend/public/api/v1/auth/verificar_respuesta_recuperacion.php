<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../../src/http.php';

apiRequireMethod('POST');
$data = apiReadJson();
$token = $data['token'] ?? null;
$answer = apiNormalizeRecoveryAnswer($data['respuesta_recuperacion'] ?? null);

if (!is_string($token)
    || preg_match('/^[A-Za-z0-9_-]{43}$/D', $token) !== 1
    || $answer === null
) {
    apiRespond(400, [
        'error' => [
            'code' => 'invalid_input',
            'message' => 'El enlace o la respuesta no son válidos.',
        ],
    ]);
}

try {
    $connection = database();
    $connection->beginTransaction();
    $statement = $connection->prepare(
        'SELECT
            tokens_recuperacion.id,
            tokens_recuperacion.id_usuario,
            tokens_recuperacion.intentos_respuesta,
            usuarios.respuesta_recuperacion_hash
         FROM tokens_recuperacion
         INNER JOIN usuarios ON usuarios.id = tokens_recuperacion.id_usuario
         WHERE tokens_recuperacion.token_hash = :token_hash
           AND tokens_recuperacion.usado_en IS NULL
           AND tokens_recuperacion.fecha_expiracion > UTC_TIMESTAMP()
         LIMIT 1
         FOR UPDATE'
    );
    $statement->execute(['token_hash' => hash('sha256', $token)]);
    $recovery = $statement->fetch();

    if (!$recovery
        || (int) $recovery['intentos_respuesta'] >= 5
        || !is_string($recovery['respuesta_recuperacion_hash'])
    ) {
        $connection->rollBack();
        apiRespond(401, [
            'error' => [
                'code' => 'recovery_verification_failed',
                'message' => 'La respuesta no coincide o el enlace venció. Solicitá uno nuevo.',
            ],
        ]);
    }

    if (!password_verify($answer, $recovery['respuesta_recuperacion_hash'])) {
        $attempts = (int) $recovery['intentos_respuesta'] + 1;
        $updateAttempt = $connection->prepare(
            'UPDATE tokens_recuperacion
             SET intentos_respuesta = :intentos,
                 usado_en = CASE WHEN :invalidar = 1 THEN UTC_TIMESTAMP() ELSE usado_en END
             WHERE id = :id'
        );
        $updateAttempt->execute([
            'intentos' => $attempts,
            'invalidar' => $attempts >= 5 ? 1 : 0,
            'id' => $recovery['id'],
        ]);
        $connection->commit();

        apiRespond(401, [
            'error' => [
                'code' => 'recovery_verification_failed',
                'message' => $attempts >= 5
                    ? 'Se agotaron los intentos. Solicitá un nuevo enlace.'
                    : 'La respuesta no coincide. Revisá lo que ingresaste e intentá nuevamente.',
            ],
        ]);
    }

    $verifyToken = $connection->prepare(
        'UPDATE tokens_recuperacion
         SET verificado_en = UTC_TIMESTAMP()
         WHERE id = :id'
    );
    $verifyToken->execute(['id' => $recovery['id']]);
    $connection->commit();

    apiRespond(200, [
        'message' => 'Respuesta verificada. Ya podés crear una nueva contraseña.',
    ]);
} catch (Throwable $error) {
    if (isset($connection) && $connection->inTransaction()) {
        $connection->rollBack();
    }

    apiRespondInternalError('password_recovery_verification', $error);
}
