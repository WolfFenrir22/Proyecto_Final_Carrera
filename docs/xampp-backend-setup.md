# Backend PHP en XAMPP

El backend vive en el repositorio, separado de las páginas de Electron:

```text
backend/
├── config/
│   └── config.php          # configuración local; no se versiona
├── public/
│   └── api/v1/health.php   # único endpoint público inicial
└── src/
    └── database.php        # conexión PDO
```

## Configurar la base

1. En `backend/config/`, copiá `config.example.php` como `config.php`.
2. Revisá host, puerto, nombre de base, usuario y contraseña con los valores que tengas en XAMPP.
3. `config.php` está excluido de Git; no subas credenciales al repositorio.

La conexión usa PDO, excepciones y sentencias preparadas nativas. `health.php` solo ejecuta `SELECT 1`; no devuelve detalles internos si falla.

## Publicar el directorio del backend con Apache

No hace falta mover el proyecto completo a `C:\xampp\htdocs`. En la configuración de Apache, agregá un alias `/hades` que apunte a la carpeta `backend/public` del repositorio y un bloque `<Directory>` que permita acceso a ese directorio. Usá la ruta absoluta real de tu copia del repositorio y reiniciá Apache desde el panel de XAMPP. No configures como raíz pública la carpeta del repositorio.

La ruta local esperada queda:

```text
http://localhost/hades/api/v1/health.php
```

Electron usa por defecto `http://localhost/hades/api/v1` para registro e inicio de sesión. Para probar otra URL en desarrollo, definí `HADES_API_URL` al iniciar Electron; no agregues la URL de producción fija al código. La URL de producción deberá usar HTTPS.

Después de iniciar sesión, Electron conserva el token junto con los datos mínimos del usuario en `localStorage`, consulta `auth/sesion.php` al abrir las pantallas protegidas y lo invalida mediante `auth/logout.php` al cerrar sesión.

Al abrirla, con Apache y MySQL iniciados y la configuración lista, debería responder:

```json
{"status":"ok","database":"connected"}
```

Si responde con `503`, consultá el log de errores de Apache/PHP en XAMPP para ver el detalle de configuración. No publiques ese detalle al cliente.

## Requisitos

- PHP 8.x con las extensiones `PDO` y `pdo_mysql` habilitadas.
- La extensión `mbstring` habilitada para validar nombres, correos y longitud de contraseñas en UTF-8.
- Apache y MySQL iniciados en XAMPP.
- La base `hades` y sus tablas creadas con `docs/schema-auth.sql`.
- La migración de actividad `backend/database/migrations/002_activity_data.sql` importada en phpMyAdmin después del esquema de autenticación.
- La migración de academia `backend/database/migrations/003_academy_content.sql`, importada después de las anteriores.
- La migración `backend/database/migrations/004_usability_survey.sql`, importada después de la migración de academia.

La migración `002` crea las tablas de recordatorios y resultados de trivia/phishing; `003` crea la tabla de contenido de la academia; `004` crea el almacenamiento de las valoraciones de usabilidad de HADES. La encuesta invierte las preguntas 2, 4, 7, 8 y 10, y normaliza el total a una escala de 0 a 100. Cada usuario doméstico conserva una respuesta, que puede actualizar desde su dashboard. Las migraciones usan `CREATE TABLE IF NOT EXISTS`, por lo que pueden importarse nuevamente sin reemplazar las tablas existentes.

## Contenido de la academia

Después de importar `003_academy_content.sql`, desde la raíz del repositorio ejecutá:

```powershell
C:\xampp\php\php.exe backend\database\seeds\import_academy.php
```

El importador carga el contenido inicial de `backend/database/seeds/academy.json` en MySQL. Usa `INSERT IGNORE`: se puede ejecutar nuevamente para agregar registros faltantes, pero no reemplaza el contenido que ya exista en la base. La aplicación descarga el contenido publicado al abrir la pantalla de entrenamiento; si el servidor no está disponible, muestra el error en lugar de usar copias locales desactualizadas.

El archivo incluye escenarios de phishing y smishing, conceptos, mitos, preguntas de trivia y secciones. Este contenido compartido se importa al servidor con el seed; no se deben confundir estos registros con los resultados personales de las actividades.

Las vistas administrativas de contenidos y analíticas están en `src/pages/admin`. Su acceso requiere una cuenta cuyo rol en `usuarios.rol` sea `Administrador`; la API vuelve a comprobar ese rol en cada solicitud. El registro público siempre crea usuarios `Doméstico`. Asigná el rol administrativo de forma manual y confiable en la base de datos; nunca lo habilites mediante el formulario público.

Los historiales personales y las cuentas de instalaciones antiguas de SQLite quedan fuera del alcance y no se importan. Los nuevos registros de cada usuario se guardan en el servidor mediante la API; cada persona debe registrarse en el sistema actual. La aplicación ya no inicializa ni consulta SQLite. Si existe un `hades.db` de una versión anterior, permanece en la carpeta de datos de Electron y no se borra automáticamente.

Para habilitar una cuenta propia ya registrada, abrí la pestaña SQL de phpMyAdmin y ejecutá la siguiente consulta reemplazando el correo:

```sql
UPDATE hades.usuarios
SET rol = 'Administrador'
WHERE correo = 'tu-correo@example.com';
```

## Correo de recuperación

1. Instalá Composer si todavía no está disponible en Windows.
2. Ejecutá `composer install` desde la carpeta `backend`; esto instala PHPMailer en `backend/vendor`, que no se versiona.
3. En `backend/config/config.php`, agregá las secciones `recovery` y `smtp` siguiendo `backend/config/config.example.php`. Conservá tu configuración de base de datos y no compartas ni subas la contraseña SMTP.
4. Para una cuenta Gmail, configurá la verificación en dos pasos y usá una contraseña de aplicación; el SMTP de Gmail normalmente usa `smtp.gmail.com`, puerto `465` con SMTPS. No uses la contraseña normal de Gmail.
5. En local, dejá `recovery.reset_url` como `http://localhost/hades/recuperar-password.html`. Para publicar, reemplazala por la URL HTTPS del sitio público.

El endpoint responde con el mismo mensaje para correos existentes y no existentes. Si falla el envío SMTP, invalida el token generado y registra el fallo en el log del servidor sin revelar la existencia de la cuenta.

El alias `/hades` sirve únicamente `backend/public`; los archivos de configuración y código interno quedan fuera del directorio público.
