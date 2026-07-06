const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("hadesAPI", {
    // ============================================================
    // USUARIO - FUNCIONES VIEJAS
    // Se mantienen por ahora para no romper las pantallas actuales.
    // ============================================================

    obtenerUsuario: () =>
        ipcRenderer.invoke("usuario:obtener"),

    guardarUsuario: (nombre) =>
        ipcRenderer.invoke("usuario:guardar", nombre),

    eliminarUsuario: () =>
        ipcRenderer.invoke("usuario:eliminar"),

    // ============================================================
    // USUARIO - LOGIN / REGISTRO / CONFIGURACIÓN
    // ============================================================

    crearUsuarioConPassword: (datos) =>
        ipcRenderer.invoke("usuario:crearConPassword", datos),

    iniciarSesion: (datos) =>
        ipcRenderer.invoke("usuario:login", datos),

    actualizarNombreUsuario: (datos) =>
        ipcRenderer.invoke("usuario:actualizarNombre", datos),

    actualizarPasswordUsuario: (datos) =>
        ipcRenderer.invoke("usuario:actualizarPassword", datos),

    // ============================================================
    // BACKUPS
    // ============================================================

    guardarRecordatorioBackup: (datos) =>
        ipcRenderer.invoke("backup:guardar", datos),

    obtenerRecordatoriosBackup: (idUsuario) =>
        ipcRenderer.invoke("backup:listar", idUsuario),

    eliminarRecordatorioBackup: (idRecordatorio) =>
        ipcRenderer.invoke("backup:eliminar", idRecordatorio),

    marcarBackupRealizado: (idRecordatorio) =>
        ipcRenderer.invoke("backup:realizado", idRecordatorio),

    // ============================================================
    // BRECHAS
    // ============================================================

    verificarBrechasCorreo: (correo) =>
        ipcRenderer.invoke("brechas:verificar", correo),

    // ============================================================
    // ENTRENAMIENTO
    // ============================================================

    guardarResultadoPhishing: (datos) =>
        ipcRenderer.invoke("phishing:guardarResultado", datos),

    guardarResultadoTrivia: (datos) =>
        ipcRenderer.invoke("trivia:guardarResultado", datos)
});