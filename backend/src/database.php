<?php

declare(strict_types=1);

function database(): PDO
{
    static $connection = null;

    if ($connection instanceof PDO) {
        return $connection;
    }

    $configPath = __DIR__ . '/../config/config.php';

    if (!is_file($configPath)) {
        throw new RuntimeException(
            'Falta backend/config/config.php. Copiá config.example.php y completá la configuración local.'
        );
    }

    $config = require $configPath;
    $databaseConfig = $config['database'] ?? null;

    if (!is_array($databaseConfig)) {
        throw new RuntimeException('La configuración de la base de datos no es válida.');
    }

    foreach (['host', 'port', 'name', 'username', 'password'] as $key) {
        if (!array_key_exists($key, $databaseConfig)) {
            throw new RuntimeException("Falta la opción de base de datos: {$key}.");
        }
    }

    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
        $databaseConfig['host'],
        $databaseConfig['port'],
        $databaseConfig['name']
    );

    $connection = new PDO(
        $dsn,
        $databaseConfig['username'],
        $databaseConfig['password'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_TIMEOUT => 5,
        ]
    );

    return $connection;
}
