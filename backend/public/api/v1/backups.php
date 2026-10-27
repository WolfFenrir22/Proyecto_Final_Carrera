<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../src/http.php';

$session = apiRequireSession();
$method = $_SERVER['REQUEST_METHOD'] ?? '';

function backupDate(mixed $value): ?DateTimeImmutable
{
    if (!is_string($value) || $value === '') {
        return null;
    }

    try {
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $value) === 1) {
            $date = DateTimeImmutable::createFromFormat(
                '!Y-m-d',
                $value,
                new DateTimeZone('UTC')
            );
            $errors = DateTimeImmutable::getLastErrors();

            if (
                $date === false
                || ($errors !== false && ($errors['warning_count'] > 0 || $errors['error_count'] > 0))
                || $date->format('Y-m-d') !== $value
            ) {
                return null;
            }

            return $date;
        }

        return (new DateTimeImmutable($value))->setTimezone(new DateTimeZone('UTC'));
    } catch (Throwable) {
        return null;
    }
}

try {
    $connection = database();

    if ($method === 'GET') {
        $statement = $connection->prepare(
            'SELECT id AS id_recordatorio, nombre, ubicacion, frecuencia,
                    DATE_FORMAT(ultimo_backup, "%Y-%m-%dT%H:%i:%sZ") AS ultimo_backup,
                    DATE_FORMAT(proximo_backup, "%Y-%m-%dT%H:%i:%sZ") AS proximo_backup,
                    activo,
                    DATE_FORMAT(fecha_creacion, "%Y-%m-%dT%H:%i:%sZ") AS fecha_creacion
             FROM recordatorios_backup
             WHERE id_usuario = :id_usuario AND activo = 1
             ORDER BY proximo_backup ASC'
        );
        $statement->execute(['id_usuario' => $session['id']]);
        apiRespond(200, ['recordatorios' => $statement->fetchAll()]);
    }

    if ($method === 'POST') {
        $data = apiReadJson();
        $name = $data['nombre'] ?? null;
        $location = $data['ubicacion'] ?? null;
        $frequency = $data['frecuencia'] ?? null;
        $lastBackup = backupDate($data['ultimo_backup'] ?? null);

        if (
            !is_string($name) || mb_strlen(trim($name), 'UTF-8') < 3
            || mb_strlen(trim($name), 'UTF-8') > 120
            || !is_string($location) || mb_strlen(trim($location), 'UTF-8') < 3
            || mb_strlen(trim($location), 'UTF-8') > 500
            || !in_array($frequency, ['diario', 'semanal', 'mensual'], true)
            || $lastBackup === null
        ) {
            apiRespond(400, [
                'error' => [
                    'code' => 'invalid_backup',
                    'message' => 'Revisá el nombre, la ubicación, la frecuencia y la fecha del backup.',
                ],
            ]);
        }

        $interval = match ($frequency) {
            'diario' => '+1 day',
            'semanal' => '+7 days',
            'mensual' => '+1 month',
        };
        $nextBackup = $lastBackup->modify($interval);
        $statement = $connection->prepare(
            'INSERT INTO recordatorios_backup
                (id_usuario, nombre, ubicacion, frecuencia, ultimo_backup, proximo_backup)
             VALUES (:id_usuario, :nombre, :ubicacion, :frecuencia, :ultimo_backup, :proximo_backup)'
        );
        $statement->execute([
            'id_usuario' => $session['id'],
            'nombre' => trim($name),
            'ubicacion' => trim($location),
            'frecuencia' => $frequency,
            'ultimo_backup' => $lastBackup->format('Y-m-d H:i:s'),
            'proximo_backup' => $nextBackup->format('Y-m-d H:i:s'),
        ]);

        apiRespond(201, [
            'recordatorio' => [
                'id_recordatorio' => (int) $connection->lastInsertId(),
                'nombre' => trim($name),
                'ubicacion' => trim($location),
                'frecuencia' => $frequency,
                'ultimo_backup' => $lastBackup->format(DateTimeInterface::ATOM),
                'proximo_backup' => $nextBackup->format(DateTimeInterface::ATOM),
                'activo' => 1,
            ],
        ]);
    }

    if ($method === 'PATCH') {
        $data = apiReadJson();
        $id = filter_var($data['id_recordatorio'] ?? null, FILTER_VALIDATE_INT);
        $action = $data['accion'] ?? null;

        if (!$id || !in_array($action, ['realizado', 'eliminar'], true)) {
            apiRespond(400, [
                'error' => [
                    'code' => 'invalid_backup_action',
                    'message' => 'La acción o el recordatorio no son válidos.',
                ],
            ]);
        }

        $connection->beginTransaction();
        $find = $connection->prepare(
            'SELECT id, frecuencia
             FROM recordatorios_backup
             WHERE id = :id AND id_usuario = :id_usuario AND activo = 1
             FOR UPDATE'
        );
        $find->execute(['id' => $id, 'id_usuario' => $session['id']]);
        $reminder = $find->fetch();

        if (!$reminder) {
            $connection->rollBack();
            apiRespond(404, [
                'error' => [
                    'code' => 'backup_not_found',
                    'message' => 'No se encontró el recordatorio activo.',
                ],
            ]);
        }

        if ($action === 'eliminar') {
            $update = $connection->prepare(
                'UPDATE recordatorios_backup SET activo = 0
                 WHERE id = :id AND id_usuario = :id_usuario'
            );
            $update->execute(['id' => $id, 'id_usuario' => $session['id']]);
            $connection->commit();
            apiRespondNoContent();
        }

        $now = new DateTimeImmutable('now', new DateTimeZone('UTC'));
        $interval = match ($reminder['frecuencia']) {
            'diario' => '+1 day',
            'semanal' => '+7 days',
            'mensual' => '+1 month',
        };
        $nextBackup = $now->modify($interval);
        $update = $connection->prepare(
            'UPDATE recordatorios_backup
             SET ultimo_backup = :ultimo_backup, proximo_backup = :proximo_backup
             WHERE id = :id AND id_usuario = :id_usuario'
        );
        $update->execute([
            'ultimo_backup' => $now->format('Y-m-d H:i:s'),
            'proximo_backup' => $nextBackup->format('Y-m-d H:i:s'),
            'id' => $id,
            'id_usuario' => $session['id'],
        ]);
        $history = $connection->prepare(
            'INSERT INTO historial_backups (id_recordatorio, fecha_realizado)
             VALUES (:id_recordatorio, :fecha_realizado)'
        );
        $history->execute([
            'id_recordatorio' => $id,
            'fecha_realizado' => $now->format('Y-m-d H:i:s'),
        ]);
        $connection->commit();

        apiRespond(200, [
            'id_recordatorio' => (int) $id,
            'ultimo_backup' => $now->format(DateTimeInterface::ATOM),
            'proximo_backup' => $nextBackup->format(DateTimeInterface::ATOM),
        ]);
    }

    header('Allow: GET, POST, PATCH');
    apiRespond(405, [
        'error' => [
            'code' => 'method_not_allowed',
            'message' => 'El método HTTP no está permitido para este endpoint.',
        ],
    ]);
} catch (Throwable $error) {
    if (isset($connection) && $connection->inTransaction()) {
        $connection->rollBack();
    }

    apiRespondInternalError('backups', $error);
}
