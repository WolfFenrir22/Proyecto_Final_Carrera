<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../../src/http.php';

apiRequireMethod('POST');
$session = apiRequireSession();

try {
    $statement = database()->prepare(
        'UPDATE sesiones
         SET revocada_en = UTC_TIMESTAMP()
         WHERE id = :id_sesion AND revocada_en IS NULL'
    );
    $statement->execute(['id_sesion' => $session['id_sesion']]);
    apiRespondNoContent();
} catch (Throwable $error) {
    apiRespondInternalError('logout', $error);
}
