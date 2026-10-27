<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/../../src/database.php';

$seedPath = __DIR__ . '/academy.json';
$seedContents = file_get_contents($seedPath);

if ($seedContents === false) {
    fwrite(STDERR, "No se pudo leer el archivo academy.json.\n");
    exit(1);
}

try {
    $records = json_decode($seedContents, true, 512, JSON_THROW_ON_ERROR);
} catch (JsonException $error) {
    fwrite(STDERR, "El archivo academy.json no contiene JSON válido: {$error->getMessage()}\n");
    exit(1);
}

if (!is_array($records) || !array_is_list($records)) {
    fwrite(STDERR, "El contenido de academy.json debe ser una lista de registros.\n");
    exit(1);
}

$allowedTypes = [
    'scenario_sv',
    'scenario_phishing',
    'concept',
    'myth',
    'trivia',
    'section',
    'presentation',
];

try {
    $connection = database();
    $connection->beginTransaction();
    $statement = $connection->prepare(
        'INSERT IGNORE INTO contenido_academia (tipo, clave, orden, payload)
         VALUES (:tipo, :clave, :orden, :payload)'
    );

    foreach ($records as $index => $record) {
        if (
            !is_array($record)
            || !in_array($record['type'] ?? null, $allowedTypes, true)
            || !is_string($record['key'] ?? null)
            || $record['key'] === ''
            || !is_int($record['sort_order'] ?? null)
            || !is_array($record['payload'] ?? null)
        ) {
            throw new UnexpectedValueException(
                sprintf('El registro %d de academy.json no tiene un formato válido.', $index + 1)
            );
        }

        $statement->execute([
            'tipo' => $record['type'],
            'clave' => $record['key'],
            'orden' => $record['sort_order'],
            'payload' => json_encode(
                $record['payload'],
                JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR
            ),
        ]);
    }

    $connection->commit();
    fwrite(STDOUT, sprintf("Importación finalizada. Registros procesados: %d.\n", count($records)));
} catch (Throwable $error) {
    if (isset($connection) && $connection->inTransaction()) {
        $connection->rollBack();
    }

    fwrite(STDERR, "No se pudo importar el contenido de la academia: {$error->getMessage()}\n");
    exit(1);
}
