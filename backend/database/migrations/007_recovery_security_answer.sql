ALTER TABLE usuarios
    ADD COLUMN respuesta_recuperacion_hash VARCHAR(255) NULL
    AFTER password_hash;

ALTER TABLE tokens_recuperacion
    ADD COLUMN verificado_en DATETIME NULL AFTER usado_en,
    ADD COLUMN intentos_respuesta TINYINT UNSIGNED NOT NULL DEFAULT 0
    AFTER verificado_en;
