const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("hadesAPI", {
    obtenerUsuario: () => ipcRenderer.invoke("usuario:obtener"),
    guardarUsuario: (nombre) => ipcRenderer.invoke("usuario:guardar", nombre),
    eliminarUsuario: () => ipcRenderer.invoke("usuario:eliminar")
});