# Inventario SQLite y datos locales

## Situación actual

La aplicación usa la API PHP/MySQL para autenticación, perfil, backups, resultados de phishing y trivia, dashboard y contenido de la academia. Las pantallas activas no requieren SQLite.

Se retiraron del cliente la inicialización de `hades.db`, los handlers IPC locales, el módulo `src/database/db.js` y la dependencia `sqlite3`. Si una instalación anterior conserva un archivo `hades.db` en la carpeta de datos de Electron, la aplicación nueva no lo abre, modifica ni elimina. Sus cuentas y sus historiales personales no se migran.

## Esquema histórico de SQLite

Estas tablas describen información de versiones anteriores y se documentan solo como referencia:

| Tabla | Campos relevantes | Tratamiento actual |
|---|---|---|
| `usuarios` | `id_usuario`, `nombre`, `password_hash`, `password_salt`, fechas | Las cuentas y credenciales locales no se importan. Cada persona debe registrarse en el sistema remoto. |
| `recordatorios_backup` | usuario local, nombre, ubicación, frecuencia, fechas, activo | Los recordatorios nuevos se guardan en MySQL; el historial local no se importa. |
| `simulaciones_phishing` | usuario local, escenario, decisión, puntaje, aciertos, errores, fecha | Los resultados nuevos se guardan en MySQL; el historial local no se importa. |
| `resultados_trivia` | usuario local, aciertos, total, porcentaje, nivel, fecha | Los resultados nuevos se guardan en MySQL; el historial local no se importa. |

## Datos que continúan almacenándose localmente

| Dato | Almacenamiento | Tratamiento |
|---|---|---|
| Sesión activa | `localStorage` (`hades_usuario_activo`), incluido el token | Se usa con la API remota. Conviene evaluar almacenamiento seguro con `safeStorage` de Electron. |
| Preferencia de tema | `localStorage` (`hades_theme`) | Preferencia local de interfaz. |
| API key de VirusTotal | `localStorage` (`hades_vt_apikey`) | Secreto de servicio; no se envía a la API HADES. |
| API key de Have I Been Pwned | `localStorage` (`hades_hibp_apikey`) | Secreto de servicio; no se envía a la API HADES. |
| Contraseñas guardadas por la persona | `localStorage` con claves `hades_passwords_<id_usuario>`, en JSON legible | No se transfieren al servidor. Actualmente no están cifradas y deben protegerse antes de considerar una migración. |

## Persistencia remota

- `GET/POST/PATCH backups.php`: consulta y gestiona recordatorios asociados a la sesión autenticada.
- `POST resultados/phishing.php` y `POST resultados/trivia.php`: registra nuevos resultados para el usuario autenticado.
- `GET dashboard/resumen.php`: consulta actividad y recordatorios remotos.
- `GET academia/contenido.php`: obtiene el contenido publicado de la academia desde MySQL.

El contenido compartido de entrenamiento se carga por separado mediante `backend/database/seeds/academy.json` y `backend/database/seeds/import_academy.php`. Incluye escenarios, conceptos, mitos, preguntas de trivia, secciones y presentaciones educativas. Las presentaciones se administran desde el CRUD y sus rutas de diapositivas se sirven desde los recursos de la aplicación o desde URLs configuradas.
