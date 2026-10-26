<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../../src/http.php';

$requestMethod = $_SERVER['REQUEST_METHOD'] ?? '';
if (!in_array($requestMethod, ['GET', 'POST'], true)) {
    header('Allow: GET, POST');
    apiRespond(405, [
        'error' => [
            'code' => 'method_not_allowed',
            'message' => 'El método HTTP no está permitido para este endpoint.',
        ],
    ]);
}

$session = apiRequireSession();

if ($session['rol'] !== 'Doméstico') {
    apiRespond(403, [
        'error' => [
            'code' => 'forbidden',
            'message' => 'Esta encuesta está disponible para usuarios domésticos.',
        ],
    ]);
}

$answerColumns = array_map(
    static fn (int $number): string => 'respuesta_' . $number,
    range(1, 10)
);

if ($requestMethod === 'GET') {
    try {
        $statement = database()->prepare(
            'SELECT ' . implode(', ', $answerColumns) . ', puntaje, fecha_respuesta
             FROM respuestas_encuesta_usabilidad
             WHERE id_usuario = :id_usuario
             LIMIT 1'
        );
        $statement->execute(['id_usuario' => $session['id']]);
        $survey = $statement->fetch();

        if ($survey === false) {
            apiRespond(200, ['encuesta' => null]);
        }

        $answers = array_map(
            static fn (string $column): int => (int) $survey[$column],
            $answerColumns
        );

        apiRespond(200, [
            'encuesta' => [
                'respuestas' => $answers,
                'puntaje' => (float) $survey['puntaje'],
                'fecha_respuesta' => $survey['fecha_respuesta'],
            ],
        ]);
    } catch (Throwable $error) {
        apiRespondInternalError('usability_survey_read', $error);
    }
}

$data = apiReadJson();
$answers = $data['respuestas'] ?? null;

if (
    !is_array($answers)
    || !array_is_list($answers)
    || count($answers) !== 10
    || array_filter(
        $answers,
        static fn (mixed $answer): bool => !is_int($answer) || $answer < 1 || $answer > 5
    ) !== []
) {
    apiRespond(400, [
        'error' => [
            'code' => 'invalid_usability_survey',
            'message' => 'Respondé las diez preguntas con una valoración entre 1 y 5.',
        ],
    ]);
}

$adjustedTotal = 0;
foreach ($answers as $index => $answer) {
    $questionNumber = $index + 1;
    $isPositiveQuestion = in_array($questionNumber, [1, 3, 5, 6, 9], true);
    $adjustedTotal += $isPositiveQuestion ? $answer - 1 : 5 - $answer;
}
$score = $adjustedTotal * 2.5;
$values = array_combine($answerColumns, $answers);
$insertColumns = implode(', ', array_merge(['id_usuario'], $answerColumns, ['puntaje']));
$placeholders = implode(', ', array_merge(
    [':id_usuario'],
    array_map(static fn (string $column): string => ':' . $column, $answerColumns),
    [':puntaje']
));
$updates = implode(
    ', ',
    array_map(static fn (string $column): string => $column . ' = VALUES(' . $column . ')', $answerColumns)
);

try {
    $connection = database();
    $statement = $connection->prepare(
        'INSERT INTO respuestas_encuesta_usabilidad
            (' . $insertColumns . ')
         VALUES (' . $placeholders . ')
         ON DUPLICATE KEY UPDATE
            ' . $updates . ',
            puntaje = VALUES(puntaje),
            fecha_respuesta = CURRENT_TIMESTAMP'
    );
    $statement->execute([
        'id_usuario' => $session['id'],
        ...$values,
        'puntaje' => $score,
    ]);

    apiRespond(200, [
        'encuesta' => [
            'respuestas' => $answers,
            'puntaje' => $score,
        ],
    ]);
} catch (Throwable $error) {
    apiRespondInternalError('usability_survey_save', $error);
}
