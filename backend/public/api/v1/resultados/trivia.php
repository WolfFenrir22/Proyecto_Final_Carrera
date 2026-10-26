<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../../src/http.php';

apiRequireMethod('POST');
$session = apiRequireSession();
$data = apiReadJson();

$correct = filter_var($data['respuestas_correctas'] ?? null, FILTER_VALIDATE_INT);
$total = filter_var($data['total_preguntas'] ?? null, FILTER_VALIDATE_INT);
$level = $data['nivel'] ?? null;

if (
    $correct === false || $correct > 65535
    || $total === false || $total < 1 || $total > 65535
    || $correct < 0 || $correct > $total
    || !is_string($level) || mb_strlen(trim($level), 'UTF-8') < 1
    || mb_strlen(trim($level), 'UTF-8') > 40
) {
    apiRespond(400, [
        'error' => [
            'code' => 'invalid_trivia_result',
            'message' => 'Los datos del resultado de trivia no son válidos.',
        ],
    ]);
}

$percentage = (int) round(($correct / $total) * 100);

try {
    $connection = database();
    $statement = $connection->prepare(
        'INSERT INTO resultados_trivia
            (id_usuario, respuestas_correctas, total_preguntas, porcentaje, nivel)
         VALUES (:id_usuario, :respuestas_correctas, :total_preguntas, :porcentaje, :nivel)'
    );
    $statement->execute([
        'id_usuario' => $session['id'],
        'respuestas_correctas' => $correct,
        'total_preguntas' => $total,
        'porcentaje' => $percentage,
        'nivel' => trim($level),
    ]);

    apiRespond(201, [
        'id_resultado' => (int) $connection->lastInsertId(),
        'respuestas_correctas' => $correct,
        'total_preguntas' => $total,
        'porcentaje' => $percentage,
        'nivel' => trim($level),
    ]);
} catch (Throwable $error) {
    apiRespondInternalError('trivia_result', $error);
}
