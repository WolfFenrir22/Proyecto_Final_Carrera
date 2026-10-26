USE hades;

CREATE TABLE IF NOT EXISTS respuestas_encuesta_usabilidad (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_usuario BIGINT UNSIGNED NOT NULL,
    respuesta_1 TINYINT UNSIGNED NOT NULL,
    respuesta_2 TINYINT UNSIGNED NOT NULL,
    respuesta_3 TINYINT UNSIGNED NOT NULL,
    respuesta_4 TINYINT UNSIGNED NOT NULL,
    respuesta_5 TINYINT UNSIGNED NOT NULL,
    respuesta_6 TINYINT UNSIGNED NOT NULL,
    respuesta_7 TINYINT UNSIGNED NOT NULL,
    respuesta_8 TINYINT UNSIGNED NOT NULL,
    respuesta_9 TINYINT UNSIGNED NOT NULL,
    respuesta_10 TINYINT UNSIGNED NOT NULL,
    puntaje DECIMAL(5, 1) UNSIGNED NOT NULL,
    fecha_respuesta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_encuesta_usabilidad_usuario (id_usuario),
    KEY idx_encuesta_usabilidad_puntaje (puntaje),
    CONSTRAINT fk_encuesta_usabilidad_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios (id)
        ON DELETE CASCADE,
    CONSTRAINT chk_encuesta_usabilidad_respuestas CHECK (
        respuesta_1 BETWEEN 1 AND 5
        AND respuesta_2 BETWEEN 1 AND 5
        AND respuesta_3 BETWEEN 1 AND 5
        AND respuesta_4 BETWEEN 1 AND 5
        AND respuesta_5 BETWEEN 1 AND 5
        AND respuesta_6 BETWEEN 1 AND 5
        AND respuesta_7 BETWEEN 1 AND 5
        AND respuesta_8 BETWEEN 1 AND 5
        AND respuesta_9 BETWEEN 1 AND 5
        AND respuesta_10 BETWEEN 1 AND 5
    )
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
