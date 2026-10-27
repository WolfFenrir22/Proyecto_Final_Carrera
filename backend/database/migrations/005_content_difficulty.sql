USE hades;

UPDATE contenido_academia
SET payload = JSON_SET(payload, '$.dificultad', CASE clave
    WHEN 'pregunta_1' THEN 'Básico'
    WHEN 'pregunta_2' THEN 'Básico'
    WHEN 'pregunta_3' THEN 'Intermedio'
    WHEN 'pregunta_4' THEN 'Intermedio'
    WHEN 'pregunta_5' THEN 'Avanzado'
END)
WHERE tipo = 'trivia'
  AND clave IN ('pregunta_1', 'pregunta_2', 'pregunta_3', 'pregunta_4', 'pregunta_5')
  AND JSON_EXTRACT(payload, '$.dificultad') IS NULL;
