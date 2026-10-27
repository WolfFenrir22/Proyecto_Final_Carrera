<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../../src/http.php';

apiRequireMethod('POST');
$data = apiReadJson();

$identifier = $data['identificador'] ?? $data['correo'] ?? null;
$password = $data['password'] ?? null;

if (
    !is_string($identifier)
    || trim($identifier) === ''
    || mb_strlen(trim($identifier), 'UTF-8') > 254
    || !is_string($password)
    || $password === ''
) {
    apiRespond(400, [
        'error' => [
            'code' => 'invalid_input',
            'message' => 'Ingresá un correo o nombre de usuario y una contraseña válidos.',
        ],
    ]);
}

$identifier = trim($identifier);
$email = apiNormalizeEmail($identifier);

try {
    $connection = database();
    if ($email !== null) {
        $statement = $connection->prepare(
            'SELECT id, nombre, correo, password_hash, rol
             FROM usuarios
             WHERE correo = :correo
             LIMIT 1'
        );
        $statement->execute(['correo' => $email]);
        $user = $statement->fetch() ?: null;
    } else {
        $statement = $connection->prepare(
            'SELECT id, nombre, correo, password_hash, rol
             FROM usuarios
             WHERE nombre = :nombre
             LIMIT 2'
        );
        $statement->execute(['nombre' => $identifier]);
        $matchingUsers = $statement->fetchAll();
        $user = count($matchingUsers) === 1 ? $matchingUsers[0] : null;
    }

    if (!$user || !password_verify($password, $user['password_hash'])) {
        apiRespond(401, [
            'error' => [
                'code' => 'invalid_credentials',
                'message' => 'El correo, nombre de usuario o contraseña no son correctos. Si hay nombres de usuario repetidos, ingresá con el correo.',
            ],
        ]);
    }

    if (password_needs_rehash($user['password_hash'], PASSWORD_DEFAULT)) {
        $updatePassword = $connection->prepare(
            'UPDATE usuarios SET password_hash = :password_hash WHERE id = :id'
        );
        $updatePassword->execute([
            'password_hash' => password_hash($password, PASSWORD_DEFAULT),
            'id' => $user['id'],
        ]);
    }

    $token = rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
    $tokenHash = hash('sha256', $token);
    $now = new DateTimeImmutable('now', new DateTimeZone('UTC'));
    $expiresAt = $now->modify('+12 hours');

    $connection->beginTransaction();
    $updateLastAccess = $connection->prepare(
        'UPDATE usuarios SET ultimo_acceso = :ultimo_acceso WHERE id = :id'
    );
    $updateLastAccess->execute([
        'ultimo_acceso' => $now->format('Y-m-d H:i:s'),
        'id' => $user['id'],
    ]);

    $createSession = $connection->prepare(
        'INSERT INTO sesiones (id_usuario, token_hash, fecha_expiracion)
         VALUES (:id_usuario, :token_hash, :fecha_expiracion)'
    );
    $createSession->execute([
        'id_usuario' => $user['id'],
        'token_hash' => $tokenHash,
        'fecha_expiracion' => $expiresAt->format('Y-m-d H:i:s'),
    ]);
    $connection->commit();

    apiRespond(200, [
        'token' => $token,
        'fecha_expiracion' => $expiresAt->format(DateTimeInterface::ATOM),
        'usuario' => [
            'id' => (int) $user['id'],
            'nombre' => $user['nombre'],
            'correo' => $user['correo'],
            'rol' => $user['rol'],
        ],
    ]);
} catch (Throwable $error) {
    if (isset($connection) && $connection->inTransaction()) {
        $connection->rollBack();
    }

    apiRespondInternalError('login', $error);
}
