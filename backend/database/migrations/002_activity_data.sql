USE hades;

CREATE TABLE IF NOT EXISTS recordatorios_backup (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_usuario BIGINT UNSIGNED NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    ubicacion VARCHAR(500) NOT NULL,
    frecuencia ENUM('diario', 'semanal', 'mensual') NOT NULL,
    ultimo_backup DATETIME NOT NULL,
    proximo_backup DATETIME NOT NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_recordatorios_usuario_activo_proximo (id_usuario, activo, proximo_backup),
    CONSTRAINT fk_recordatorios_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios (id)
        ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS historial_backups (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_recordatorio BIGINT UNSIGNED NOT NULL,
    fecha_realizado DATETIME NOT NULL,
    PRIMARY KEY (id),
    KEY idx_historial_recordatorio_fecha (id_recordatorio, fecha_realizado),
    CONSTRAINT fk_historial_recordatorio
        FOREIGN KEY (id_recordatorio) REFERENCES recordatorios_backup (id)
        ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS resultados_phishing (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_usuario BIGINT UNSIGNED NOT NULL,
    id_escenario INT UNSIGNED NOT NULL,
    tipo_escenario VARCHAR(80) NOT NULL,
    dificultad VARCHAR(40) NOT NULL,
    decision_usuario VARCHAR(40) NOT NULL,
    decision_correcta VARCHAR(40) NOT NULL,
    puntaje TINYINT UNSIGNED NOT NULL,
    aciertos SMALLINT UNSIGNED NOT NULL,
    errores SMALLINT UNSIGNED NOT NULL,
    fecha_simulacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_phishing_usuario_fecha (id_usuario, fecha_simulacion),
    CONSTRAINT fk_phishing_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios (id)
        ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS resultados_trivia (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_usuario BIGINT UNSIGNED NOT NULL,
    respuestas_correctas SMALLINT UNSIGNED NOT NULL,
    total_preguntas SMALLINT UNSIGNED NOT NULL,
    porcentaje TINYINT UNSIGNED NOT NULL,
    nivel VARCHAR(40) NOT NULL,
    fecha_resultado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_trivia_usuario_fecha (id_usuario, fecha_resultado),
    CONSTRAINT fk_trivia_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios (id)
        ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
