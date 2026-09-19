const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");

const {
    initDatabase,
    obtenerUsuarioPrincipal,
    guardarUsuario,
    actualizarUltimoAcceso,
    eliminarUsuarioPrincipal,

    crearUsuarioConPassword,
    iniciarSesion,
    actualizarNombreUsuario,
    actualizarPasswordUsuario,

    guardarRecordatorioBackup,
    obtenerRecordatoriosBackup,
    eliminarRecordatorioBackup,
    marcarBackupRealizado,
    obtenerProximoBackup,

    guardarResultadoPhishing,
    obtenerUltimoPhishing,

    guardarResultadoTrivia,
    obtenerUltimaTrivia
} = require("../src/database/db");

const fs = require("fs");
const { Blob } = require("buffer");

// Clave de prueba de Have I Been Pwned.
// Para consultas reales se deberá configurar HIBP_API_KEY
// como variable de entorno.
const HIBP_API_KEY =
    process.env.HIBP_API_KEY ||
    "00000000000000000000000000000000";

const HIBP_MODO_PRUEBA = !process.env.HIBP_API_KEY;

const VT_API_KEY = process.env.VT_API_KEY || "fb3c9ba0dc065e1eb3268832a8932fc44dd8bc09d8be929a7516a245d625bc2b"; // Public default for demo, but highly restricted. In a real app we leave empty or prompt the user.

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

// ============================================================
// FUNCIONES DE VIRUSTOTAL
// ============================================================
async function escanearArchivoVirusTotal(rutaArchivo, apiKey) {
    if (!fs.existsSync(rutaArchivo)) {
        throw new Error("El archivo no existe.");
    }
    const stats = fs.statSync(rutaArchivo);
    if (stats.size > 32 * 1024 * 1024) {
        throw new Error("El archivo supera el límite de 32MB de la API de VirusTotal.");
    }

    const fileBuffer = fs.readFileSync(rutaArchivo);
    const blob = new Blob([fileBuffer]);
    
    // Node.js nativo FormData (disponible desde Node 18, usado por Electron 28+)
    const formData = new FormData();
    formData.append("file", blob, path.basename(rutaArchivo));

    const response = await fetch("https://www.virustotal.com/api/v3/files", {
        method: "POST",
        headers: {
            "x-apikey": apiKey
        },
        body: formData
    });

    if (response.status === 401) {
        throw new Error("La API Key de VirusTotal es inválida o incorrecta.");
    }
    if (response.status === 429) {
        throw new Error("Cuota excedida. Por favor espera un momento o intenta más tarde.");
    }
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Error al subir a VirusTotal: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    return await esperarAnalisisVirusTotal(data.data.id, apiKey);
}

async function escanearUrlVirusTotal(urlScan, apiKey) {
    const formData = new URLSearchParams();
    formData.append("url", urlScan);

    const response = await fetch("https://www.virustotal.com/api/v3/urls", {
        method: "POST",
        headers: {
            "x-apikey": apiKey,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData
    });

    if (response.status === 401) {
        throw new Error("La API Key de VirusTotal es inválida o incorrecta.");
    }
    if (response.status === 429) {
        throw new Error("Cuota excedida. Por favor espera un momento o intenta más tarde.");
    }
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Error al escanear URL: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    return await esperarAnalisisVirusTotal(data.data.id, apiKey);
}

async function esperarAnalisisVirusTotal(analysisId, apiKey) {
    const url = `https://www.virustotal.com/api/v3/analyses/${analysisId}`;
    
    for (let i = 0; i < 15; i++) {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "x-apikey": apiKey
            }
        });
        
        if (response.status === 401) {
            throw new Error("La API Key de VirusTotal es inválida o incorrecta.");
        }
        if (response.status === 429) {
            throw new Error("Cuota excedida al verificar resultados. Espera un momento.");
        }
        if (!response.ok) {
            throw new Error(`Error al consultar el análisis: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.data.attributes.status === "completed") {
            return data.data.attributes.stats;
        }
        
        await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    throw new Error("El análisis tardó demasiado. Por favor, inténtalo más tarde.");
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
    console.log("Carpeta userData:", app.getPath("userData"));

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

        ipcMain.handle(
        "usuario:crearConPassword",
        async (event, datos) => {
            if (!datos || typeof datos !== "object") {
                throw new Error("Los datos del usuario no son válidos.");
            }

            const { nombre, password } = datos;

            return await crearUsuarioConPassword(nombre, password);
        }
    );

    ipcMain.handle(
        "usuario:login",
        async (event, datos) => {
            if (!datos || typeof datos !== "object") {
                throw new Error("Los datos de inicio de sesión no son válidos.");
            }

            const { nombre, password } = datos;

            return await iniciarSesion(nombre, password);
        }
    );

    ipcMain.handle(
        "usuario:actualizarNombre",
        async (event, datos) => {
            if (!datos || typeof datos !== "object") {
                throw new Error("Los datos para actualizar el nombre no son válidos.");
            }

            const { idUsuario, nuevoNombre } = datos;

            return await actualizarNombreUsuario(
                idUsuario,
                nuevoNombre
            );
        }
    );

    ipcMain.handle(
        "usuario:actualizarPassword",
        async (event, datos) => {
            if (!datos || typeof datos !== "object") {
                throw new Error("Los datos para actualizar la contraseña no son válidos.");
            }

            const {
                idUsuario,
                passwordActual,
                passwordNueva
            } = datos;

            return await actualizarPasswordUsuario(
                idUsuario,
                passwordActual,
                passwordNueva
            );
        }
    );

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

    // ============================================================
    // MANEJADORES DE VIRUSTOTAL
    // ============================================================
    ipcMain.handle(
        "virustotal:escanearArchivo",
        async (event, rutaArchivo, apiKey) => {
            console.log("Iniciando escaneo de archivo en VirusTotal:", rutaArchivo);
            return await escanearArchivoVirusTotal(rutaArchivo, apiKey);
        }
    );

    ipcMain.handle(
        "virustotal:escanearUrl",
        async (event, url, apiKey) => {
            console.log("Iniciando escaneo de URL en VirusTotal:", url);
            return await escanearUrlVirusTotal(url, apiKey);
        }
    );

    ipcMain.handle("dialog:abrirArchivo", async () => {
        const result = await dialog.showOpenDialog({
            properties: ["openFile"],
            title: "Seleccionar archivo para escanear",
            buttonLabel: "Seleccionar"
        });

        if (result.canceled || result.filePaths.length === 0) {
            return null;
        }
        
        return result.filePaths[0];
    });

    createWindow();

    app.on("activate", () => {
        if (
            BrowserWindow.getAllWindows().length === 0
        ) {
            createWindow();
        }
    });

    // ============================================================
// MANEJADOR DEL GUARDADO DE RESULTADOS DE PHISHING
// ============================================================
ipcMain.handle("phishing:guardarResultado", async (event, datos) => {
    return await guardarResultadoPhishing(datos);
});

//============================================================
// MANEJADOR DEL GUARDADO DE RESULTADOS DE TRIVIA
//============================================================
ipcMain.handle("trivia:guardarResultado", async (event, datos) => {
    return await guardarResultadoTrivia(datos);
});

// ============================================================
// DASHBOARD
// ============================================================

ipcMain.handle(
    "dashboard:resumen",
    async (event, idUsuario) => {
        const ultimaTrivia =
            await obtenerUltimaTrivia(idUsuario);

        const ultimoPhishing =
            await obtenerUltimoPhishing(idUsuario);

        const proximoBackup =
            await obtenerProximoBackup(idUsuario);

        return {
            ultimaTrivia,
            ultimoPhishing,
            proximoBackup
        };
    }
);

});


app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

