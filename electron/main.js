const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const path = require("path");

const fs = require("fs");
const { Blob } = require("buffer");

const VT_API_KEY = process.env.VT_API_KEY || "fb3c9ba0dc065e1eb3268832a8932fc44dd8bc09d8be929a7516a245d625bc2b"; // Public default for demo, but highly restricted. In a real app we leave empty or prompt the user.
const AUTH_API_BASE_URL =
    process.env.HADES_API_URL || "http://localhost/hades/api/v1";

async function solicitarApiAutenticacion(endpoint, opciones = {}) {
    let response;

    try {
        const headers = { Accept: "application/json" };
        const request = {
            method: opciones.method || "GET",
            headers,
            signal: AbortSignal.timeout(10000)
        };

        if (opciones.body !== undefined) {
            headers["Content-Type"] = "application/json";
            request.body = JSON.stringify(opciones.body);
        }

        if (opciones.token) {
            headers.Authorization = `Bearer ${opciones.token}`;
        }

        response = await fetch(`${AUTH_API_BASE_URL}/${endpoint}`, request);
    } catch (error) {
        console.error("No se pudo conectar con la API de HADES:", error);
        throw new Error(
            "No se pudo conectar con el servidor central. Verificá que Apache y MySQL estén iniciados."
        );
    }

    let result = null;

    if (response.status !== 204) {
        try {
            result = await response.json();
        } catch (error) {
            console.error("La API de HADES devolvió una respuesta no válida:", error);
            throw new Error("El servidor devolvió una respuesta no válida.");
        }
    }

    return {
        ok: response.ok,
        status: response.status,
        data: result
    };
}

function exigirRespuestaApi(response) {
    if (!response.ok) {
        throw new Error(
            response.data?.error?.message ||
                `El servidor respondió con el código ${response.status}.`
        );
    }

    return response.data;
}

async function solicitarApiAutenticacionPost(endpoint, datos) {
    const response = await solicitarApiAutenticacion(endpoint, {
        method: "POST",
        body: datos
    });

    return exigirRespuestaApi(response);
}

async function solicitarApiPerfil(endpoint, token, datos) {
    if (typeof token !== "string" || !token) {
        throw new Error("No se encontró una sesión válida.");
    }

    const response = await solicitarApiAutenticacion(endpoint, {
        method: "PATCH",
        token,
        body: datos
    });

    return exigirRespuestaApi(response);
}

async function solicitarApiConSesion(endpoint, method, datos) {
    if (!datos || typeof datos !== "object" || typeof datos.token !== "string") {
        throw new Error("No se encontró una sesión válida.");
    }

    const { token, ...body } = datos;
    const response = await solicitarApiAutenticacion(endpoint, {
        method,
        token,
        ...(method === "GET" ? {} : { body })
    });

    return exigirRespuestaApi(response);
}

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
 * @param {string} apiKey
 * @returns {Promise<object>}
 */
async function verificarBrechasCorreo(correo, apiKey) {
    if (typeof correo !== "string") {
        throw new Error("El correo ingresado no es válido.");
    }

    const correoLimpio = correo.trim().toLowerCase();

    if (!validarFormatoCorreo(correoLimpio)) {
        throw new Error("Ingresá una dirección de correo válida.");
    }

    if (typeof apiKey !== "string" || !apiKey.trim()) {
        throw new Error("Configurá una clave API válida de Have I Been Pwned.");
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
                "hibp-api-key": apiKey.trim(),
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
        width: 1280,
        height: 820,
        minWidth: 760,
        minHeight: 620,
        center: true,
        title: "HADES",

        icon: path.join(
            __dirname,
            "..",
            "src",
            "assets",
            "img",
            "logo_final.png"
        ),

        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    mainWindow.webContents.on("did-navigate", (_event, navigationUrl) => {
        const page = path.basename(new URL(navigationUrl).pathname);

        if (
            navigationUrl.startsWith("file://") &&
            ["dashboard.html", "analiticas.html", "contenidos.html"].includes(page)
        ) {
            mainWindow.maximize();
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
    ipcMain.handle("auth:registrar", async (_event, datos) => {
        if (!datos || typeof datos !== "object") {
            throw new Error("Los datos de registro no son válidos.");
        }

        return await solicitarApiAutenticacionPost("auth/registro.php", datos);
    });

    ipcMain.handle("auth:login", async (_event, datos) => {
        if (!datos || typeof datos !== "object") {
            throw new Error("Los datos de inicio de sesión no son válidos.");
        }

        return await solicitarApiAutenticacionPost("auth/login.php", datos);
    });

    ipcMain.handle("auth:abrirRecuperacion", async (event) => {
        const window = BrowserWindow.fromWebContents(event.sender);
        if (!window) {
            throw new Error("No se encontró la ventana de HADES.");
        }

        await window.loadFile(
            path.join(__dirname, "..", "src", "pages", "recuperar-password.html")
        );
    });

    ipcMain.handle("auth:solicitarRecuperacion", async (_event, datos) => {
        if (!datos || typeof datos !== "object" || typeof datos.correo !== "string") {
            throw new Error("Ingresá una dirección de correo válida.");
        }

        return await solicitarApiAutenticacionPost(
            "auth/solicitar_recuperacion.php",
            datos
        );
    });

    ipcMain.handle("auth:cambiarPasswordRecuperacion", async (_event, datos) => {
        if (
            !datos ||
            typeof datos !== "object" ||
            typeof datos.token !== "string" ||
            typeof datos.password_nueva !== "string"
        ) {
            throw new Error("El enlace o la nueva contraseña no son válidos.");
        }

        return await solicitarApiAutenticacionPost(
            "auth/cambiar_password.php",
            datos
        );
    });

    ipcMain.handle("auth:validarSesion", async (_event, token) => {
        if (typeof token !== "string" || !token) {
            return null;
        }

        const response = await solicitarApiAutenticacion("auth/sesion.php", {
            method: "GET",
            token
        });

        if (response.status === 401) {
            return null;
        }

        return exigirRespuestaApi(response);
    });

    ipcMain.handle("auth:logout", async (_event, token) => {
        if (typeof token !== "string" || !token) {
            throw new Error("No se encontró el token de sesión.");
        }

        const response = await solicitarApiAutenticacion("auth/logout.php", {
            method: "POST",
            token
        });

        if (response.status === 401) {
            return true;
        }

        exigirRespuestaApi(response);
        return true;
    });

    ipcMain.handle("perfil:actualizarNombre", async (_event, datos) => {
        if (!datos || typeof datos !== "object") {
            throw new Error("Los datos para actualizar el nombre no son válidos.");
        }

        return await solicitarApiPerfil(
            "perfil/nombre.php",
            datos.token,
            { nombre: datos.nombre }
        );
    });

    ipcMain.handle("perfil:actualizarPassword", async (_event, datos) => {
        if (!datos || typeof datos !== "object") {
            throw new Error("Los datos para actualizar la contraseña no son válidos.");
        }

        return await solicitarApiPerfil(
            "perfil/password.php",
            datos.token,
            {
                password_actual: datos.passwordActual,
                password_nueva: datos.passwordNueva
            }
        );
    });

    ipcMain.handle("backup:remoto:listar", async (_event, token) => {
        const response = await solicitarApiAutenticacion("backups.php", {
            method: "GET",
            token
        });
        return exigirRespuestaApi(response).recordatorios;
    });

    ipcMain.handle("backup:remoto:guardar", async (_event, datos) =>
        await solicitarApiConSesion("backups.php", "POST", datos)
    );

    ipcMain.handle("backup:remoto:actualizar", async (_event, datos) =>
        await solicitarApiConSesion("backups.php", "PATCH", datos)
    );

    ipcMain.handle("resultado:remoto:trivia", async (_event, datos) =>
        await solicitarApiConSesion("resultados/trivia.php", "POST", datos)
    );

    ipcMain.handle("resultado:remoto:phishing", async (_event, datos) =>
        await solicitarApiConSesion("resultados/phishing.php", "POST", datos)
    );

    ipcMain.handle("encuesta:remota:obtener", async (_event, token) =>
        await solicitarApiConSesion("encuestas/usabilidad.php", "GET", { token })
    );

    ipcMain.handle("encuesta:remota:guardar", async (_event, datos) =>
        await solicitarApiConSesion("encuestas/usabilidad.php", "POST", datos)
    );

    ipcMain.handle("dashboard:remoto:resumen", async (_event, token) => {
        const response = await solicitarApiAutenticacion("dashboard/resumen.php", {
            method: "GET",
            token
        });
        return exigirRespuestaApi(response);
    });

    // ============================================================
    // MANEJADOR DEL VERIFICADOR DE BRECHAS
    // ============================================================

    ipcMain.handle(
        "brechas:verificar",
        async (event, correo, apiKey) => {
            const resultado =
            await verificarBrechasCorreo(correo, apiKey);

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

    ipcMain.handle("academia:remoto:contenido", async (event, token) => {
    return await solicitarApiConSesion(
        "academia/contenido.php",
        "GET",
        { token }
    );
});

ipcMain.handle("admin:contenido", async (_event, method, datos) => {
    if (!["GET", "POST", "PATCH", "DELETE"].includes(method)) {
        throw new Error("El método de administración de contenido no es válido.");
    }

    return await solicitarApiConSesion(
        "academia/administrar.php",
        method,
        datos
    );
});

ipcMain.handle("admin:analiticas", async (_event, token) =>
    await solicitarApiConSesion("analiticas/resumen.php", "GET", { token })
);

});


app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
