<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../../src/http.php';

apiRequireMethod('GET');
apiRequireAdminSession();

try {
    $connection = database();

    $summary = $connection->query(
        'SELECT
            (SELECT COUNT(*) FROM usuarios) AS usuarios_total,
            (SELECT COUNT(*) FROM usuarios WHERE rol = "Doméstico") AS usuarios_domesticos,
            (SELECT COUNT(*) FROM contenido_academia WHERE activo = 1) AS contenidos_publicados,
            (SELECT COUNT(*) FROM contenido_academia WHERE activo = 0) AS contenidos_inactivos,
            (SELECT COUNT(*) FROM resultados_phishing) AS simulaciones_phishing,
            (SELECT COUNT(*) FROM resultados_trivia) AS evaluaciones_trivia,
            (SELECT COALESCE(AVG(puntaje), 0) FROM resultados_phishing) AS promedio_phishing,
            (SELECT COALESCE(AVG(porcentaje), 0) FROM resultados_trivia) AS promedio_trivia'
    )->fetch();

    $daily = $connection->query(
        'SELECT fecha, SUM(phishing) AS phishing, SUM(trivia) AS trivia
         FROM (
             SELECT DATE(fecha_simulacion) AS fecha, COUNT(*) AS phishing, 0 AS trivia
             FROM resultados_phishing
             WHERE fecha_simulacion >= UTC_DATE() - INTERVAL 6 DAY
             GROUP BY DATE(fecha_simulacion)
             UNION ALL
             SELECT DATE(fecha_resultado) AS fecha, 0 AS phishing, COUNT(*) AS trivia
             FROM resultados_trivia
             WHERE fecha_resultado >= UTC_DATE() - INTERVAL 6 DAY
             GROUP BY DATE(fecha_resultado)
         ) AS actividad
         GROUP BY fecha
         ORDER BY fecha'
    )->fetchAll();

    $contentTypes = $connection->query(
        'SELECT tipo, COUNT(*) AS total,
                SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) AS publicados
         FROM contenido_academia
         WHERE TRIM(tipo) <> ""
         GROUP BY tipo
         ORDER BY tipo'
    )->fetchAll();

    $recentUsers = $connection->query(
        'SELECT nombre, rol,
                DATE_FORMAT(fecha_creacion, "%Y-%m-%dT%H:%i:%sZ") AS fecha_creacion
         FROM usuarios
         ORDER BY fecha_creacion DESC, id DESC
         LIMIT 8'
    )->fetchAll();

    $usabilitySurveyScores = $connection->query(
        'SELECT usuarios.nombre, respuestas_encuesta_usabilidad.puntaje,
                DATE_FORMAT(respuestas_encuesta_usabilidad.fecha_respuesta, "%Y-%m-%dT%H:%i:%s") AS fecha_respuesta
         FROM respuestas_encuesta_usabilidad
         INNER JOIN usuarios ON usuarios.id = respuestas_encuesta_usabilidad.id_usuario
         WHERE usuarios.rol = "Doméstico"
         ORDER BY respuestas_encuesta_usabilidad.fecha_respuesta DESC, usuarios.nombre'
    )->fetchAll();

    foreach ($usabilitySurveyScores as &$row) {
        $row['puntaje'] = (float) $row['puntaje'];
    }
    unset($row);

    $metricKeys = [
        'usuarios_total',
        'usuarios_domesticos',
        'contenidos_publicados',
        'contenidos_inactivos',
        'simulaciones_phishing',
        'evaluaciones_trivia',
    ];
    foreach ($metricKeys as $key) {
        $summary[$key] = (int) $summary[$key];
    }
    $summary['promedio_phishing'] = (int) round((float) $summary['promedio_phishing']);
    $summary['promedio_trivia'] = (int) round((float) $summary['promedio_trivia']);

    foreach ($daily as &$row) {
        $row['phishing'] = (int) $row['phishing'];
        $row['trivia'] = (int) $row['trivia'];
    }
    unset($row);

    foreach ($contentTypes as &$row) {
        $row['total'] = (int) $row['total'];
        $row['publicados'] = (int) $row['publicados'];
    }
    unset($row);

    apiRespond(200, [
        'resumen' => $summary,
        'actividad_semanal' => $daily,
        'contenidos_por_tipo' => $contentTypes,
        'usuarios_recientes' => $recentUsers,
        'puntajes_encuesta_usabilidad' => $usabilitySurveyScores,
    ]);
} catch (Throwable $error) {
    apiRespondInternalError('admin_analytics_summary', $error);
}
