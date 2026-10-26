<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../../src/http.php';

apiRequireMethod('GET');
$session = apiRequireSession();

try {
    $expiration = new DateTimeImmutable(
        $session['fecha_expiracion'],
        new DateTimeZone('UTC')
    );

    apiRespond(200, [
        'usuario' => [
            'id' => (int) $session['id'],
            'nombre' => $session['nombre'],
            'correo' => $session['correo'],
            'rol' => $session['rol'],
        ],
        'fecha_expiracion' => $expiration->format(DateTimeInterface::ATOM),
    ]);
} catch (Throwable $error) {
    apiRespondInternalError('session_details', $error);
}
