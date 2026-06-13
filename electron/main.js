const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

const {
    initDatabase,
    obtenerUsuarioPrincipal,
    guardarUsuario,
    actualizarUltimoAcceso,
    eliminarUsuarioPrincipal,
    guardarRecordatorioBackup,
    obtenerRecordatoriosBackup,
    eliminarRecordatorioBackup,
    marcarBackupRealizado
} = require("../src/database/db");

// Clave de prueba de Have I Been Pwned.
// Para consultas reales se deberá configurar HIBP_API_KEY
// como variable de entorno.
const HIBP_API_KEY =
    process.env.HIBP_API_KEY ||
    "00000000000000000000000000000000";

const HIBP_MODO_PRUEBA = !process.env.HIBP_API_KEY;

/**
 * Valida el formato básico de una dirección de correo.
 *
 * @param {string} correo
 * @returns {boolean}
 */
function validarFormatoCorreo(correo) {
    const expresionCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return expresionCorreo.test(correo);
}

/**
 * Consulta Have I Been Pwned para verificar si un correo
 * aparece en brechas de datos conocidas.
 *
 * @param {string} correo
 * @returns {Promise<object>}
 */
async function verificarBrechasCorreo(correo) {
    if (typeof correo !== "string") {
        throw new Error("El correo ingresado no es válido.");
    }

    const correoLimpio = correo.trim().toLowerCase();

    if (!validarFormatoCorreo(correoLimpio)) {
        throw new Error("Ingresá una dirección de correo válida.");
    }

    if (
        HIBP_MODO_PRUEBA &&
        !correoLimpio.endsWith("@hibp-integration-tests.com")
    ) {
        throw new Error(
            "El modo de prueba solo permite correos del dominio hibp-integration-tests.com."
        );
    }

    const correoCodificado = encodeURIComponent(correoLimpio);

    const url =
        "https://haveibeenpwned.com/api/v3/breachedAccount/" +
        `${correoCodificado}?truncateResponse=false`;

    let respuesta;

    try {
        respuesta = await fetch(url, {
            method: "GET",
            headers: {
                "hibp-api-key": HIBP_API_KEY,
                "user-agent": "HADES-Proyecto-Final-Carrera",
                accept: "application/json"
            }
        });
    } catch (error) {
        console.error("Error de conexión con HIBP:", error);

        throw new Error(
            "No se pudo conectar con el servicio de verificación."
        );
    }

    console.log(
        "Estado HTTP recibido desde HIBP:",
        respuesta.status
    );

    if (respuesta.status === 404) {
        return {
            estado: "sin_brechas",
            cantidad: 0,
            brechas: []
        };
    }

    if (respuesta.status === 401) {
        throw new Error(
            "La clave utilizada para consultar el servicio no es válida."
        );
    }

    if (respuesta.status === 403) {
        throw new Error(
            "El servicio rechazó la consulta. Revisá la configuración de acceso."
        );
    }

    if (respuesta.status === 429) {
        throw new Error(
            "Se realizaron demasiadas consultas. Esperá un momento e intentá nuevamente."
        );
    }

    if (!respuesta.ok) {
        const detalle = await respuesta.text();

        console.error(
            `Error de HIBP. Estado ${respuesta.status}:`,
            detalle
        );

        throw new Error(
            `El servicio de verificación respondió con el código ${respuesta.status}.`
        );
    }

    const datosRecibidos = await respuesta.json();

    console.log(
        "Respuesta recibida desde HIBP:",
        datosRecibidos
    );

    const brechasRecibidas = Array.isArray(datosRecibidos)
        ? datosRecibidos
        : [];

    const brechas = brechasRecibidas.map((brecha) => ({
        nombre: brecha.Name || "Brecha sin nombre",

        titulo:
            brecha.Title ||
            brecha.Name ||
            "Servicio desconocido",

        dominio:
            brecha.Domain ||
            "Sin dominio informado",

        fecha:
            brecha.BreachDate ||
            null,

        cantidadAfectados:
            brecha.PwnCount ||
            0,

        datosExpuestos: Array.isArray(brecha.DataClasses)
            ? brecha.DataClasses
            : [],

        verificada: Boolean(brecha.IsVerified)
    }));

    return {
        estado:
            brechas.length > 0
                ? "encontrado"
                : "sin_brechas",

        cantidad: brechas.length,
        brechas
    };
}

/**
 * Crea la ventana principal de Electron.
 */
function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1400,
        height: 850,
        minWidth: 1100,
        minHeight: 700,
        title: "HADES",

        icon: path.join(
            __dirname,
            "..",
            "src",
            "assets",
            "img",
            "logo_hades.ico"
        ),

        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    mainWindow.loadFile(
        path.join(
            __dirname,
            "..",
            "src",
            "pages",
            "bienvenida.html"
        )
    );

    // Activar temporalmente para revisar errores:
    // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
    initDatabase();

    // ============================================================
    // MANEJADORES DEL USUARIO
    // ============================================================

    ipcMain.handle("usuario:obtener", async () => {
        const usuario = await obtenerUsuarioPrincipal();

        if (usuario) {
            await actualizarUltimoAcceso(
                usuario.id_usuario
            );
        }

        return usuario || null;
    });

    ipcMain.handle(
        "usuario:guardar",
        async (event, nombre) => {
            if (
                !nombre ||
                typeof nombre !== "string"
            ) {
                throw new Error(
                    "El nombre ingresado no es válido."
                );
            }

            const nombreLimpio = nombre.trim();

            if (nombreLimpio.length < 2) {
                throw new Error(
                    "El nombre debe tener al menos 2 caracteres."
                );
            }

            if (nombreLimpio.length > 40) {
                throw new Error(
                    "El nombre no puede superar los 40 caracteres."
                );
            }

            return await guardarUsuario(nombreLimpio);
        }
    );

    ipcMain.handle("usuario:eliminar", async () => {
        return await eliminarUsuarioPrincipal();
    });

    // ============================================================
    // MANEJADORES DE BACKUPS
    // ============================================================

    ipcMain.handle(
        "backup:guardar",
        async (event, datos) => {
            return await guardarRecordatorioBackup(datos);
        }
    );

    ipcMain.handle(
        "backup:listar",
        async (event, idUsuario) => {
            return await obtenerRecordatoriosBackup(
                idUsuario
            );
        }
    );

    ipcMain.handle(
        "backup:eliminar",
        async (event, idRecordatorio) => {
            return await eliminarRecordatorioBackup(
                idRecordatorio
            );
        }
    );

    ipcMain.handle(
        "backup:realizado",
        async (event, idRecordatorio) => {
            return await marcarBackupRealizado(
                idRecordatorio
            );
        }
    );

    // ============================================================
    // MANEJADOR DEL VERIFICADOR DE BRECHAS
    // ============================================================

    ipcMain.handle(
        "brechas:verificar",
        async (event, correo) => {
            const resultado =
                await verificarBrechasCorreo(correo);

            console.log(
                "Resultado enviado a la vista:",
                resultado
            );

            return resultado;
        }
    );

    createWindow();

    app.on("activate", () => {
        if (
            BrowserWindow.getAllWindows().length === 0
        ) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});