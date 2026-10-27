<?php

declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;

function enviarCorreoRecuperacion(string $recipient, string $token): void
{
    $autoloadPath = __DIR__ . '/../vendor/autoload.php';

    if (!is_file($autoloadPath)) {
        throw new RuntimeException('PHPMailer no está instalado. Ejecutá composer install en backend.');
    }

    require_once $autoloadPath;

    $config = require __DIR__ . '/../config/config.php';
    $configuredSmtp = $config['smtp'] ?? [];
    $configuredRecovery = $config['recovery'] ?? [];

    if (!is_array($configuredSmtp) || !is_array($configuredRecovery)) {
        throw new RuntimeException('La configuración SMTP o de recuperación no es válida.');
    }

    $smtp = array_replace($configuredSmtp, [
        'host' => getenv('HADES_SMTP_HOST') ?: ($configuredSmtp['host'] ?? ''),
        'port' => getenv('HADES_SMTP_PORT') ?: ($configuredSmtp['port'] ?? 465),
        'encryption' => getenv('HADES_SMTP_ENCRYPTION') ?: ($configuredSmtp['encryption'] ?? 'ssl'),
        'username' => getenv('HADES_SMTP_USERNAME') ?: ($configuredSmtp['username'] ?? ''),
        'password' => getenv('HADES_SMTP_PASSWORD') ?: ($configuredSmtp['password'] ?? ''),
        'from_email' => getenv('HADES_SMTP_FROM_EMAIL') ?: ($configuredSmtp['from_email'] ?? ''),
        'from_name' => getenv('HADES_SMTP_FROM_NAME') ?: ($configuredSmtp['from_name'] ?? 'HADES'),
    ]);
    $recovery = array_replace($configuredRecovery, [
        'reset_url' => getenv('HADES_RECOVERY_RESET_URL')
            ?: ($configuredRecovery['reset_url'] ?? ''),
        'token_lifetime_minutes' => getenv('HADES_RECOVERY_TOKEN_LIFETIME_MINUTES')
            ?: ($configuredRecovery['token_lifetime_minutes'] ?? 30),
    ]);

    if (!in_array($smtp['encryption'], ['ssl', 'tls'], true)) {
        throw new RuntimeException('La encriptación SMTP debe ser ssl o tls.');
    }

    $port = filter_var(
        $smtp['port'],
        FILTER_VALIDATE_INT,
        ['options' => ['min_range' => 1, 'max_range' => 65535]]
    );
    if ($port === false) {
        throw new RuntimeException('El puerto SMTP no es válido.');
    }

    foreach (['host', 'port', 'username', 'password', 'from_email', 'from_name'] as $key) {
        if (!isset($smtp[$key]) || $smtp[$key] === '') {
            throw new RuntimeException("Falta la configuración SMTP: {$key}.");
        }
    }

    $resetUrl = $recovery['reset_url'] ?? '';

    if (!is_string($resetUrl) || filter_var($resetUrl, FILTER_VALIDATE_URL) === false) {
        throw new RuntimeException('La URL de recuperación no está configurada correctamente.');
    }

    $urlParts = parse_url($resetUrl);

    $isAppLink = ($urlParts['scheme'] ?? '') === 'hades'
        && ($urlParts['host'] ?? '') === 'recuperar-password'
        && !isset($urlParts['user'])
        && !isset($urlParts['pass'])
        && !isset($urlParts['port'])
        && !isset($urlParts['path'])
        && !isset($urlParts['query'])
        && !isset($urlParts['fragment']);
    $isWebLink = in_array($urlParts['scheme'] ?? '', ['http', 'https'], true);

    if (!$isAppLink && !$isWebLink) {
        throw new RuntimeException('La URL de recuperación debe usar HTTP/HTTPS o hades://recuperar-password.');
    }

    $resetLink = $resetUrl . '#' . http_build_query(['token' => $token]);

    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = $smtp['host'];
    $mail->SMTPAuth = true;
    $mail->Username = $smtp['username'];
    $mail->Password = $smtp['password'];
    $mail->SMTPSecure = $smtp['encryption'] === 'tls'
        ? PHPMailer::ENCRYPTION_STARTTLS
        : PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port = $port;
    $mail->CharSet = PHPMailer::CHARSET_UTF8;
    $mail->setFrom($smtp['from_email'], $smtp['from_name']);
    $mail->addAddress($recipient);
    $mail->isHTML(true);
    $mail->Subject = 'Recuperación de contraseña de HADES';
    $escapedLink = htmlspecialchars($resetLink, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $mail->Body = '<p>Recibimos una solicitud para cambiar tu contraseña de HADES.</p>'
        . '<p>Abrí este enlace desde un dispositivo con HADES instalado y verificá tu respuesta de seguridad:</p>'
        . '<p><a href="' . $escapedLink . '">Verificar identidad y cambiar contraseña</a></p>'
        . '<p>El enlace vence en ' . (int) ($recovery['token_lifetime_minutes'] ?? 30)
        . ' minutos y solo puede utilizarse una vez. Si no solicitaste este cambio, ignorá este correo.</p>';
    $mail->AltBody = "Para cambiar tu contraseña de HADES, abrí este enlace desde un dispositivo con HADES instalado y verificá tu respuesta de seguridad:\n"
        . $resetLink . "\nEl enlace es de un solo uso y tiene una duración limitada.";
    $mail->send();
}
