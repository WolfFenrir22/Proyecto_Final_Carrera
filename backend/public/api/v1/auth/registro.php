<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../../src/http.php';

apiRequireMethod('POST');
$data = apiReadJson();

$name = $data['nombre'] ?? null;
$email = apiNormalizeEmail($data['correo'] ?? null);
$password = $data['password'] ?? null;
$recoveryAnswer = apiNormalizeRecoveryAnswer($data['respuesta_recuperacion'] ?? null);

if (
    !is_string($name)
    || mb_strlen(trim($name), 'UTF-8') < 2
    || mb_strlen(trim($name), 'UTF-8') > 40
    || $email === null
    || !apiValidatePassword($password)
    || $recoveryAnswer === null
) {
    apiRespond(400, [
        'error' => [
            'code' => 'invalid_input',
            'message' => 'Revisá el nombre, el correo, la respuesta de recuperación y la contraseña. La contraseña debe tener entre 12 y 72 bytes.',
        ],
    ]);
}

$name = trim($name);

try {
    $statement = database()->prepare(
        'INSERT INTO usuarios
            (nombre, correo, password_hash, respuesta_recuperacion_hash, rol)
         VALUES (:nombre, :correo, :password_hash, :respuesta_recuperacion_hash, :rol)'
    );
    $statement->execute([
        'nombre' => $name,
        'correo' => $email,
        'password_hash' => password_hash($password, PASSWORD_DEFAULT),
        'respuesta_recuperacion_hash' => password_hash($recoveryAnswer, PASSWORD_DEFAULT),
        'rol' => 'Doméstico',
    ]);

    apiRespond(201, [
        'usuario' => [
            'id' => (int) database()->lastInsertId(),
            'nombre' => $name,
            'correo' => $email,
            'rol' => 'Doméstico',
        ],
    ]);
} catch (PDOException $error) {
    if ((int) ($error->errorInfo[1] ?? 0) === 1062) {
        apiRespond(409, [
            'error' => [
                'code' => 'email_already_registered',
                'message' => 'Ya existe una cuenta registrada con ese correo.',
            ],
        ]);
    }

    apiRespondInternalError('registration', $error);
} catch (Throwable $error) {
    apiRespondInternalError('registration', $error);
}
