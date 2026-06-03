const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

const {
    initDatabase,
    obtenerUsuarioPrincipal,
    guardarUsuario,
    actualizarUltimoAcceso,
    eliminarUsuarioPrincipal
} = require("../src/database/db");

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1400,
        height: 850,
        minWidth: 1100,
        minHeight: 700,
        title: "HADES",
        icon: path.join(__dirname, "..", "src", "assets", "img", "logo_hades.ico"),
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    mainWindow.loadFile(
        path.join(__dirname, "..", "src", "pages", "bienvenida.html")
    );
}

app.whenReady().then(() => {
    initDatabase();

    ipcMain.handle("usuario:obtener", async () => {
        const usuario = await obtenerUsuarioPrincipal();

        if (usuario) {
            await actualizarUltimoAcceso(usuario.id_usuario);
        }

        return usuario || null;
    });

    ipcMain.handle("usuario:guardar", async (event, nombre) => {
        if (!nombre || typeof nombre !== "string") {
            throw new Error("El nombre ingresado no es válido.");
        }

        const nombreLimpio = nombre.trim();

        if (nombreLimpio.length < 2) {
            throw new Error("El nombre debe tener al menos 2 caracteres.");
        }

        if (nombreLimpio.length > 40) {
            throw new Error("El nombre no puede superar los 40 caracteres.");
        }

        return await guardarUsuario(nombreLimpio);
    });

    ipcMain.handle("usuario:eliminar", async () => {
        return await eliminarUsuarioPrincipal();
    });

    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});