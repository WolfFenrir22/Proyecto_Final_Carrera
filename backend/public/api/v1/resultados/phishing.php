<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../../src/http.php';

apiRequireMethod('POST');
$session = apiRequireSession();
$data = apiReadJson();

$scenarioId = filter_var($data['id_escenario'] ?? null, FILTER_VALIDATE_INT);
$score = filter_var($data['puntaje'] ?? null, FILTER_VALIDATE_INT);
$correctCount = filter_var($data['aciertos'] ?? null, FILTER_VALIDATE_INT);
$errorCount = filter_var($data['errores'] ?? null, FILTER_VALIDATE_INT);
$fields = [
    'tipo_escenario' => 80,
    'dificultad' => 40,
    'decision_usuario' => 40,
    'decision_correcta' => 40,
];
$normalized = [];

foreach ($fields as $field => $maxLength) {
    $value = $data[$field] ?? null;
    if (!is_string($value) || mb_strlen(trim($value), 'UTF-8') < 1 || mb_strlen(trim($value), 'UTF-8') > $maxLength) {
        apiRespond(400, [
            'error' => [
                'code' => 'invalid_phishing_result',
                'message' => 'Los datos del resultado de phishing no son válidos.',
            ],
        ]);
    }
    $normalized[$field] = trim($value);
}

if (
    $scenarioId === false || $scenarioId < 1 || $scenarioId > 4294967295
    || $score === false || $score < 0 || $score > 100
    || $correctCount === false || $correctCount < 0 || $correctCount > 65535
    || $errorCount === false || $errorCount < 0 || $errorCount > 65535
) {
    apiRespond(400, [
        'error' => [
            'code' => 'invalid_phishing_result',
            'message' => 'Los datos del resultado de phishing no son válidos.',
        ],
    ]);
}

try {
    $connection = database();
    $statement = $connection->prepare(
        'INSERT INTO resultados_phishing
            (id_usuario, id_escenario, tipo_escenario, dificultad,
             decision_usuario, decision_correcta, puntaje, aciertos, errores)
         VALUES
            (:id_usuario, :id_escenario, :tipo_escenario, :dificultad,
             :decision_usuario, :decision_correcta, :puntaje, :aciertos, :errores)'
    );
    $statement->execute([
        'id_usuario' => $session['id'],
        'id_escenario' => $scenarioId,
        'tipo_escenario' => $normalized['tipo_escenario'],
        'dificultad' => $normalized['dificultad'],
        'decision_usuario' => $normalized['decision_usuario'],
        'decision_correcta' => $normalized['decision_correcta'],
        'puntaje' => $score,
        'aciertos' => $correctCount,
        'errores' => $errorCount,
    ]);

    apiRespond(201, [
        'id_simulacion' => (int) $connection->lastInsertId(),
        ...$normalized,
        'id_escenario' => $scenarioId,
        'puntaje' => $score,
        'aciertos' => $correctCount,
        'errores' => $errorCount,
    ]);
} catch (Throwable $error) {
    apiRespondInternalError('phishing_result', $error);
}
