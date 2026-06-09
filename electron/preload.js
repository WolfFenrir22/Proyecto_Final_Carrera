const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("hadesAPI", {
    obtenerUsuario: () => ipcRenderer.invoke("usuario:obtener"),
    guardarUsuario: (nombre) => ipcRenderer.invoke("usuario:guardar", nombre),
    eliminarUsuario: () => ipcRenderer.invoke("usuario:eliminar"),
    guardarRecordatorioBackup: (datos) => ipcRenderer.invoke("backup:guardar", datos),
    obtenerRecordatoriosBackup: (idUsuario) => ipcRenderer.invoke("backup:listar", idUsuario),
    eliminarRecordatorioBackup: (idRecordatorio) => ipcRenderer.invoke("backup:eliminar", idRecordatorio),
    marcarBackupRealizado: (idRecordatorio) => ipcRenderer.invoke("backup:realizado", idRecordatorio)
});