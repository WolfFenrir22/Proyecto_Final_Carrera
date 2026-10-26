<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../../src/http.php';

apiRequireMethod('GET');
$session = apiRequireSession();

try {
    $connection = database();

    $backupQuery = $connection->prepare(
        'SELECT id AS id_recordatorio, nombre, ubicacion, frecuencia,
                DATE_FORMAT(ultimo_backup, "%Y-%m-%dT%H:%i:%sZ") AS ultimo_backup,
                DATE_FORMAT(proximo_backup, "%Y-%m-%dT%H:%i:%sZ") AS proximo_backup,
                activo
         FROM recordatorios_backup
         WHERE id_usuario = :id_usuario AND activo = 1
         ORDER BY proximo_backup ASC LIMIT 1'
    );
    $backupQuery->execute(['id_usuario' => $session['id']]);
    $nextBackup = $backupQuery->fetch() ?: null;

    $phishingQuery = $connection->prepare(
        'SELECT id AS id_simulacion, id_escenario, tipo_escenario, dificultad,
                decision_usuario, decision_correcta, puntaje, aciertos, errores,
                DATE_FORMAT(fecha_simulacion, "%Y-%m-%dT%H:%i:%sZ") AS fecha_simulacion
         FROM resultados_phishing WHERE id_usuario = :id_usuario
         ORDER BY fecha_simulacion DESC, id DESC LIMIT 1'
    );
    $phishingQuery->execute(['id_usuario' => $session['id']]);
    $lastPhishing = $phishingQuery->fetch() ?: null;

    $triviaQuery = $connection->prepare(
        'SELECT id AS id_resultado, respuestas_correctas, total_preguntas,
                porcentaje, nivel,
                DATE_FORMAT(fecha_resultado, "%Y-%m-%dT%H:%i:%sZ") AS fecha_resultado
         FROM resultados_trivia WHERE id_usuario = :id_usuario
         ORDER BY fecha_resultado DESC, id DESC LIMIT 1'
    );
    $triviaQuery->execute(['id_usuario' => $session['id']]);
    $lastTrivia = $triviaQuery->fetch() ?: null;

    $statisticsQuery = $connection->prepare(
        'SELECT
            (SELECT COUNT(*) FROM resultados_phishing WHERE id_usuario = :phishing_count) AS simulaciones_realizadas,
            (SELECT COALESCE(AVG(puntaje), 0) FROM resultados_phishing WHERE id_usuario = :phishing_avg) AS promedio_simulaciones,
            (SELECT COALESCE(MAX(puntaje), 0) FROM resultados_phishing WHERE id_usuario = :phishing_max) AS mejor_puntaje_simulacion,
            (SELECT COUNT(*) FROM resultados_trivia WHERE id_usuario = :trivia_count) AS trivias_realizadas,
            (SELECT COALESCE(AVG(porcentaje), 0) FROM resultados_trivia WHERE id_usuario = :trivia_avg) AS promedio_trivia,
            (SELECT COUNT(*) FROM recordatorios_backup WHERE id_usuario = :backup_count AND activo = 1) AS backups_activos'
    );
    $statisticsQuery->execute([
        'phishing_count' => $session['id'],
        'phishing_avg' => $session['id'],
        'phishing_max' => $session['id'],
        'trivia_count' => $session['id'],
        'trivia_avg' => $session['id'],
        'backup_count' => $session['id'],
    ]);
    $statistics = $statisticsQuery->fetch();

    apiRespond(200, [
        'proximoBackup' => $nextBackup,
        'ultimoPhishing' => $lastPhishing,
        'ultimaTrivia' => $lastTrivia,
        'estadisticas' => [
            'simulacionesRealizadas' => (int) $statistics['simulaciones_realizadas'],
            'promedioSimulaciones' => (int) round((float) $statistics['promedio_simulaciones']),
            'mejorPuntajeSimulacion' => (int) $statistics['mejor_puntaje_simulacion'],
            'triviasRealizadas' => (int) $statistics['trivias_realizadas'],
            'promedioTrivia' => (int) round((float) $statistics['promedio_trivia']),
            'backupsActivos' => (int) $statistics['backups_activos'],
        ],
    ]);
} catch (Throwable $error) {
    apiRespondInternalError('dashboard_summary', $error);
}
