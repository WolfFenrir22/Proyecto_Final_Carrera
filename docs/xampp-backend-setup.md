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
- La migración `backend/database/migrations/005_content_difficulty.sql`, importada después de la migración de encuesta.
- La migración `backend/database/migrations/006_educational_presentations.sql`, importada después de las anteriores.
- La migración `backend/database/migrations/007_recovery_security_answer.sql`, importada después de las anteriores.

La migración `002` crea las tablas de recordatorios y resultados de trivia/phishing; `003` crea la tabla de contenido de la academia; `004` crea el almacenamiento de las valoraciones de usabilidad de HADES; `005` asigna niveles iniciales a las preguntas de trivia existentes; `006` habilita el nuevo tipo de diapositivas educativas; `007` agrega las respuestas hash y los controles de intentos para la recuperación de contraseña. Los niveles que ve el usuario se corresponden con Básico = Fácil, Intermedio = Intermedio y Avanzado = Difícil. La encuesta invierte las preguntas 2, 4, 7, 8 y 10, y normaliza el total a una escala de 0 a 100. Cada usuario doméstico conserva una respuesta, que puede actualizar desde su dashboard.

## Contenido de la academia

Después de importar `003_academy_content.sql`, desde la raíz del repositorio ejecutá:

```powershell
C:\xampp\php\php.exe backend\database\seeds\import_academy.php
```

El importador carga el contenido inicial de `backend/database/seeds/academy.json` en MySQL. Usa `INSERT IGNORE`: se puede ejecutar nuevamente para agregar registros faltantes, pero no reemplaza el contenido que ya exista en la base. La aplicación descarga el contenido publicado al abrir la pantalla de entrenamiento; si el servidor no está disponible, muestra el error en lugar de usar copias locales desactualizadas.

El archivo incluye 15 casos de phishing y 15 casos de smishing/vishing (5 por nivel: Básico, Intermedio y Avanzado en cada simulador), conceptos, mitos, 30 preguntas de trivia (10 por cada nivel: Básico, Intermedio y Avanzado), secciones y presentaciones educativas. Para incorporar contenido nuevo a una base existente, volvé a ejecutar el importador: agrega los registros faltantes sin reemplazar los existentes. Para habilitar las diapositivas en una base existente, importá `006_educational_presentations.sql` y volvé a ejecutar el importador para agregar las cuatro presentaciones iniciales. Las imágenes de las presentaciones iniciales permanecen en `src/assets/img/presentaciones`; desde el CRUD se puede actualizar la lista de rutas o URLs, una por diapositiva. Este contenido compartido se importa al servidor con el seed; no se deben confundir estos registros con los resultados personales de las actividades.

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
3. La configuración local `backend/config/config.php` debe conservar la base de datos y tener las secciones `recovery` y `smtp` siguiendo `backend/config/config.example.php`. Para Gmail, usá `smtp.gmail.com`, puerto `465`, cifrado `ssl` y la misma dirección para usuario y remitente. `config.php` está excluido de Git; no compartas ni subas la contraseña SMTP.
4. Para una cuenta Gmail, configurá la verificación en dos pasos y usá una contraseña de aplicación; el SMTP de Gmail normalmente usa `smtp.gmail.com`, puerto `465` con SMTPS. No uses la contraseña normal de Gmail.
5. Pegá en `smtp.password` únicamente en tu `backend/config/config.php` local los 16 caracteres de la contraseña de aplicación, sin los espacios visuales que Google agrega al mostrarla. Para abrir la recuperación dentro de Electron, configurá `recovery.reset_url` como `hades://recuperar-password`.

El endpoint responde con el mismo mensaje para correos existentes y no existentes. Si falla el envío SMTP, invalida el token generado y registra el motivo en el log de errores de Apache/PHP de XAMPP, sin revelar la existencia de la cuenta. Si no llega el correo, revisá ese log, la carpeta de spam, que la dirección esté registrada y que PHP tenga habilitada la extensión `openssl`; no habilites el debug SMTP en una API pública.

También se pueden definir los valores SMTP como variables de entorno de Apache: `HADES_SMTP_HOST`, `HADES_SMTP_PORT`, `HADES_SMTP_ENCRYPTION` (`ssl` o `tls`), `HADES_SMTP_USERNAME`, `HADES_SMTP_PASSWORD`, `HADES_SMTP_FROM_EMAIL`, `HADES_SMTP_FROM_NAME`, `HADES_RECOVERY_RESET_URL` y `HADES_RECOVERY_TOKEN_LIFETIME_MINUTES`. Estos valores tienen prioridad sobre la configuración local. No guardes contraseñas en archivos versionados.

El botón **Olvidé mi contraseña** abre una pantalla local de Electron. El enlace `hades://recuperar-password#token=...` del correo también abre esa pantalla en la aplicación; iniciá HADES al menos una vez después de actualizar para registrar el protocolo `hades` en Windows. El usuario debe tener HADES instalado en el dispositivo donde abra el correo. Si se configura una URL web en vez del protocolo de la aplicación, la página pública debe implementar el mismo paso de verificación.

Al registrarse se guarda un hash de la respuesta de recuperación. Las cuentas antiguas deben iniciar sesión, configurar su respuesta desde **Configuración** y luego podrán usar la recuperación. Para proteger la cuenta, el enlace exige verificar la respuesta antes de habilitar el cambio; hay un máximo de cinco intentos por enlace y la verificación habilita el cambio durante diez minutos.

El alias `/hades` sirve únicamente `backend/public`; los archivos de configuración y código interno quedan fuera del directorio público.
