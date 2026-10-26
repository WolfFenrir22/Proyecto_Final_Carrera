USE hades;

CREATE TABLE IF NOT EXISTS contenido_academia (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    tipo ENUM(
        'scenario_sv',
        'scenario_phishing',
        'concept',
        'myth',
        'trivia',
        'section'
    ) NOT NULL,
    clave VARCHAR(100) NOT NULL,
    orden SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    payload JSON NOT NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_contenido_academia_tipo_clave (tipo, clave),
    KEY idx_contenido_academia_publicado_orden (activo, tipo, orden)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
