<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../../src/http.php';

apiRequireMethod('GET');
apiRequireSession();

try {
    $statement = database()->query(
        'SELECT tipo, clave, orden, payload
         FROM contenido_academia
         WHERE activo = 1
         ORDER BY tipo, orden, id'
    );

    $content = [
        'scenario_sv' => [],
        'scenario_phishing' => [],
        'concept' => [],
        'myth' => [],
        'trivia' => [],
        'section' => [],
        'presentation' => [],
    ];

    foreach ($statement->fetchAll() as $row) {
        $payload = json_decode($row['payload'], true, 512, JSON_THROW_ON_ERROR);
        $type = $row['tipo'];

        if ($type === 'section') {
            $content[$type][$row['clave']] = $payload;
        } else {
            $content[$type][] = $payload;
        }
    }

    apiRespond(200, ['contenido' => $content]);
} catch (Throwable $error) {
    apiRespondInternalError('academy_content', $error);
}
