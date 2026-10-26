<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../../src/http.php';
require_once __DIR__ . '/../../../../src/mailer.php';

apiRequireMethod('POST');
$data = apiReadJson();
$email = apiNormalizeEmail($data['correo'] ?? null);

if ($email === null) {
    apiRespond(400, [
        'error' => [
            'code' => 'invalid_email',
            'message' => 'Ingresá una dirección de correo válida.',
        ],
    ]);
}

$genericResponse = [
    'message' => 'Si la cuenta existe, recibirás instrucciones para restablecer la contraseña.',
];

try {
    $connection = database();
    $statement = $connection->prepare(
        'SELECT id, correo
         FROM usuarios
         WHERE correo = :correo
         LIMIT 1'
    );
    $statement->execute(['correo' => $email]);
    $user = $statement->fetch();

    if ($user) {
        $rateLimit = $connection->prepare(
            'SELECT COUNT(*)
             FROM tokens_recuperacion
             WHERE id_usuario = :id_usuario
               AND fecha_creacion > UTC_TIMESTAMP() - INTERVAL 1 HOUR'
        );
        $rateLimit->execute(['id_usuario' => $user['id']]);

        if ((int) $rateLimit->fetchColumn() < 3) {
            $config = require __DIR__ . '/../../../../config/config.php';
            $lifetimeMinutes = filter_var(
                $config['recovery']['token_lifetime_minutes'] ?? 30,
                FILTER_VALIDATE_INT,
                ['options' => ['min_range' => 5, 'max_range' => 120]]
            );

            if ($lifetimeMinutes === false) {
                throw new RuntimeException('La duración del token de recuperación no es válida.');
            }

            $token = rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
            $tokenHash = hash('sha256', $token);
            $expiresAt = (new DateTimeImmutable('now', new DateTimeZone('UTC')))
                ->modify("+{$lifetimeMinutes} minutes");

            $connection->beginTransaction();
            $invalidatePrevious = $connection->prepare(
                'UPDATE tokens_recuperacion
                 SET usado_en = UTC_TIMESTAMP()
                 WHERE id_usuario = :id_usuario AND usado_en IS NULL'
            );
            $invalidatePrevious->execute(['id_usuario' => $user['id']]);

            $insertToken = $connection->prepare(
                'INSERT INTO tokens_recuperacion
                    (id_usuario, token_hash, fecha_expiracion)
                 VALUES (:id_usuario, :token_hash, :fecha_expiracion)'
            );
            $insertToken->execute([
                'id_usuario' => $user['id'],
                'token_hash' => $tokenHash,
                'fecha_expiracion' => $expiresAt->format('Y-m-d H:i:s'),
            ]);
            $connection->commit();

            try {
                enviarCorreoRecuperacion($user['correo'], $token);
            } catch (Throwable) {
                error_log('HADES password recovery email delivery failed.');
                $invalidateToken = $connection->prepare(
                    'UPDATE tokens_recuperacion
                     SET usado_en = UTC_TIMESTAMP()
                     WHERE token_hash = :token_hash AND usado_en IS NULL'
                );
                $invalidateToken->execute(['token_hash' => $tokenHash]);
            }
        }
    }

    apiRespond(202, $genericResponse);
} catch (Throwable $error) {
    if (isset($connection) && $connection->inTransaction()) {
        $connection->rollBack();
    }

    apiLogFailure('password_recovery_request', $error);
    apiRespond(202, $genericResponse);
}
