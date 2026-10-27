USE hades;

ALTER TABLE contenido_academia
    MODIFY tipo ENUM(
        'scenario_sv',
        'scenario_phishing',
        'concept',
        'myth',
        'trivia',
        'section',
        'presentation'
    ) NOT NULL;
