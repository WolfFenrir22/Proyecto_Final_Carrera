# Contrato inicial de API: cuentas y autenticación

Este documento define el contrato inicial entre el cliente Electron y el backend PHP. No implementa todavía endpoints ni modifica el comportamiento de la aplicación.

## Entorno

- Desarrollo con XAMPP: `http://localhost/hades/api/v1/`.
- Producción: una URL HTTPS configurable; el cliente no debe asumir que `localhost` es el servidor publicado.
- Los nombres de los archivos PHP indicados abajo son convenciones para la primera versión.
- La API recibe y responde JSON con `Content-Type: application/json; charset=utf-8`.
- Las fechas se expresan en UTC como ISO 8601.

## Reglas comunes

- Las operaciones autenticadas reciben `Authorization: Bearer <token>`.
- El servidor genera tokens opacos aleatorios y guarda únicamente su SHA-256 en `sesiones.token_hash`. El token original se entrega al cliente una sola vez.
- Cada solicitud autenticada valida que la sesión exista, no esté revocada y no haya expirado. El servidor obtiene el ID y rol desde esa sesión, nunca de un `id_usuario` enviado por el cliente.
- Una cuenta nueva siempre se crea con rol `Doméstico`. El rol `Administrador` se asigna por un procedimiento administrativo confiable, nunca desde el registro público.
- Las contraseñas se almacenan con `password_hash()` usando el algoritmo predeterminado de PHP y se verifican con `password_verify()`.
- La política inicial propuesta para contraseñas es un mínimo de 12 caracteres y un máximo de 72 bytes para evitar truncamiento con bcrypt; no se exige una combinación arbitraria de mayúsculas, números o símbolos.
- El correo se recorta y normaliza a minúsculas antes de buscarlo o guardarlo. La restricción `UNIQUE` de MySQL es la protección final contra duplicados.
- La duración inicial de las sesiones es de 12 horas; se guarda como vencimiento en UTC y se puede ajustar al conectar el cliente.
- Las respuestas de error usan el formato `{ "error": { "code": "...", "message": "..." } }`. No incluyen SQL, trazas ni secretos.
- Los endpoints no aceptan roles, hashes, IDs de sesión ni hashes de tokens en los datos enviados por el cliente.

## Endpoints

### `POST auth/registro.php`

Público. Crea una cuenta doméstica.

Solicitud:

```json
{
  "nombre": "Ana",
  "correo": "ana@example.com",
  "password": "una contraseña válida",
  "respuesta_recuperacion": "respuesta secreta"
}
```

Respuesta `201 Created`:

```json
{
  "usuario": {
    "id": 42,
    "nombre": "Ana",
    "correo": "ana@example.com",
    "rol": "Doméstico"
  }
}
```

No devuelve contraseña ni claves API y no inicia sesión automáticamente; el cliente puede llamar al login.

Errores esperados: `400` datos inválidos, `409` correo ya registrado.

### `POST auth/login.php`

Público. Verifica correo y contraseña, actualiza `ultimo_acceso` y crea una sesión.

Solicitud:

```json
{
  "correo": "ana@example.com",
  "password": "una contraseña válida"
}
```

Respuesta `200 OK`:

```json
{
  "token": "token opaco generado por el servidor",
  "fecha_expiracion": "2026-10-27T14:00:00Z",
  "usuario": {
    "id": 42,
    "nombre": "Ana",
    "correo": "ana@example.com",
    "rol": "Doméstico"
  }
}
```

Errores esperados: `400` solicitud inválida, `401` credenciales incorrectas.

### `POST auth/logout.php`

Requiere una sesión vigente. Revoca la sesión asociada al token actual; repetir la solicitud con el token revocado devuelve `401`.

Respuesta `204 No Content`.

### `GET auth/sesion.php`

Requiere sesión. Devuelve la identidad vigente para restaurar la interfaz tras navegar entre páginas.

Respuesta `200 OK`:

```json
{
  "usuario": {
    "id": 42,
    "nombre": "Ana",
    "correo": "ana@example.com",
    "rol": "Doméstico"
  },
  "fecha_expiracion": "2026-10-27T14:00:00Z"
}
```

### `POST auth/solicitar_recuperacion.php`

Público. Recibe `{ "correo": "ana@example.com" }`. Para no revelar si la cuenta existe, devuelve la misma respuesta `202 Accepted` en ambos casos:

```json
{
  "message": "Si la cuenta existe, recibirás instrucciones para restablecer la contraseña."
}
```

Para una cuenta existente que tenga una respuesta de recuperación configurada, genera un token aleatorio de un solo uso, almacena solo su SHA-256 en `tokens_recuperacion`, aplica una expiración corta configurada por el servidor y envía el enlace por correo. Para abrir la pantalla dentro de Electron, el enlace usa el protocolo `hades://recuperar-password#token=...`. El token viaja en el fragmento para que no se envíe en la solicitud HTTP ni en los logs de acceso. No registrar el token en logs. Las cuentas sin respuesta configurada no reciben un enlace; deben guardar una desde la configuración mientras tengan una sesión válida.

### `POST auth/verificar_respuesta_recuperacion.php`

Público. Recibe `{ "token": "...", "respuesta_recuperacion": "respuesta secreta" }`. Normaliza la respuesta sin distinguir mayúsculas y minúsculas, compara su hash almacenado y permite como máximo cinco intentos por enlace. Ante un acierto marca el token como verificado; el cambio de contraseña queda habilitado durante diez minutos.

### `POST auth/cambiar_password.php`

Público, autorizado por un token vigente y con la respuesta de recuperación verificada en los últimos diez minutos. Valida que el hash del token corresponda a un registro no usado y no vencido, actualiza la contraseña y marca el token como usado. La actualización del hash y el consumo del token se realizan en una transacción. También revoca las sesiones existentes del usuario.

Solicitud:

```json
{
  "token": "token recibido en el enlace",
  "password_nueva": "una contraseña nueva"
}
```

Respuesta `200 OK`: `{ "message": "La contraseña se actualizó correctamente." }`.

Errores esperados: `400` contraseña inválida, `410` token inválido, vencido o ya usado.

### `PATCH perfil/nombre.php`

Requiere sesión. Recibe `{ "nombre": "Ana Pérez" }`; el servidor actualiza el nombre del usuario autenticado.

Respuesta `200 OK`: `{ "usuario": { "id": 42, "nombre": "Ana Pérez", "correo": "ana@example.com", "rol": "Doméstico" } }`.

### `PATCH perfil/password.php`

Requiere sesión. Recibe `{ "password_actual": "...", "password_nueva": "..." }`. Verifica la contraseña actual, actualiza su hash y revoca las demás sesiones, conservando activa la sesión usada para el cambio. La política de contraseña es la misma que en registro.

### `PATCH perfil/respuesta_recuperacion.php`

Requiere sesión. Recibe `{ "password_actual": "...", "respuesta_recuperacion": "respuesta secreta" }`. Verifica la contraseña actual y guarda el hash de la respuesta normalizada para mayúsculas/minúsculas. Se usa para habilitar la recuperación en cuentas creadas antes de incorporar esta pregunta.

## Resultados, backups y dashboard

Todos estos endpoints requieren `Authorization: Bearer <token>`. El ID del usuario se obtiene de la sesión validada; el cliente no lo envía ni elige a qué usuario afecta.

### `GET academia/contenido.php`

Requiere una sesión válida. Devuelve el contenido publicado de la academia, agrupado por tipo (`scenario_sv`, `scenario_phishing`, `concept`, `myth`, `trivia` y `section`) y ordenado según `orden`. Los clientes no pueden enviar el rol ni modificar contenido mediante este endpoint.

### Administración de contenidos y analíticas

Estos endpoints requieren una sesión vigente con rol `Administrador`; el rol se consulta en la sesión del servidor y nunca se toma de datos enviados por Electron.

- `GET academia/administrar.php`: lista contenidos activos e inactivos.
- `POST academia/administrar.php`: crea un contenido con `tipo`, `clave`, `orden`, `activo` y `payload`.
- `PATCH academia/administrar.php`: reemplaza esos campos para un `id` existente; `activo: false` lo pasa a borrador sin borrarlo.
- `DELETE academia/administrar.php`: elimina definitivamente un contenido mediante `{ "id": 1 }`.
- `GET analiticas/resumen.php`: devuelve indicadores globales, actividad diaria de los últimos siete días, contenidos por tipo y usuarios registrados recientemente.

### `GET backups.php`

Lista los recordatorios activos del usuario autenticado:

```json
{
  "recordatorios": [
    {
      "id_recordatorio": 8,
      "nombre": "Documentos",
      "ubicacion": "Disco externo",
      "frecuencia": "semanal",
      "ultimo_backup": "2026-10-20T10:00:00Z",
      "proximo_backup": "2026-10-27T10:00:00Z",
      "activo": 1,
      "fecha_creacion": "2026-10-20T10:00:00Z"
    }
  ]
}
```

### `POST backups.php`

Crea un recordatorio. Recibe `nombre`, `ubicacion`, `frecuencia` (`diario`, `semanal` o `mensual`) y `ultimo_backup` ISO 8601. El servidor calcula la próxima fecha.

### `PATCH backups.php`

Recibe `{ "id_recordatorio": 8, "accion": "realizado" }` para guardar la fecha realizada y crear una entrada de historial, o `{ "id_recordatorio": 8, "accion": "eliminar" }` para desactivar el recordatorio. El servidor comprueba que pertenezca al usuario autenticado.

### `POST resultados/trivia.php`

Recibe `respuestas_correctas`, `total_preguntas` y `nivel`. El servidor calcula el porcentaje y guarda el resultado.

### `POST resultados/phishing.php`

Recibe `id_escenario`, `tipo_escenario`, `dificultad`, `decision_usuario`, `decision_correcta`, `puntaje`, `aciertos` y `errores`.

### `GET dashboard/resumen.php`

Devuelve `proximoBackup`, `ultimoPhishing`, `ultimaTrivia` y `estadisticas` con la forma que consume la pantalla del dashboard. Todos los valores corresponden a la sesión autenticada.

Respuesta `204 No Content`.

## Respuestas y estados HTTP

- `400`: JSON inválido o validación de campos fallida.
- `401`: no autenticado, sesión inválida o credenciales incorrectas.
- `403`: autenticado, pero sin permiso para la operación.
- `404`: recurso no encontrado cuando revelar su existencia no implique enumeración de cuentas.
- `409`: conflicto, por ejemplo correo duplicado.
- `410`: token de recuperación inválido, vencido o consumido.
- `429`: límite de solicitudes alcanzado.
- `500`: error inesperado; mensaje genérico para el cliente y detalle solo en logs del servidor sin credenciales ni tokens.

## Decisiones de implementación pendientes

- Configurar en PHP/Apache una lista explícita de orígenes permitidos. No habilitar CORS con `*` para solicitudes autenticadas. Las páginas `file://` de Electron pueden tener origen `null`; para desarrollo y producción debe elegirse y probarse una estrategia de origen permitida antes de conectar el frontend.
- Definir la caducidad de recuperación en la configuración del servidor.
- Implementar límites de intentos para login y solicitudes de recuperación.
- Las cuentas de instalaciones antiguas de SQLite no se migran al backend. Si se conserva un archivo `hades.db` anterior, sus usuarios y hashes locales no se utilizan para iniciar sesión en el servicio remoto.
- No incluir aún endpoints ni persistencia para las contraseñas de otros sitios que el diagnóstico guarda actualmente en `localStorage`.
- La columna `usuarios.api_keys` está prevista en el esquema, pero sus endpoints quedan fuera de este primer contrato hasta definir el cifrado y la administración de la clave de cifrado del servidor. No almacenar las claves en texto plano.
