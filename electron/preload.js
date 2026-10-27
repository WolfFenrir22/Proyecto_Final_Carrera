const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("hadesAPI", {
    // ============================================================
    // USUARIO - LOGIN / REGISTRO / CONFIGURACIÓN
    // ============================================================

    registrarUsuarioRemoto: (datos) =>
        ipcRenderer.invoke("auth:registrar", datos),

    iniciarSesionRemoto: (datos) =>
        ipcRenderer.invoke("auth:login", datos),

    abrirRecuperacionPassword: () =>
        ipcRenderer.invoke("auth:abrirRecuperacion"),

    solicitarRecuperacionPassword: (datos) =>
        ipcRenderer.invoke("auth:solicitarRecuperacion", datos),

    cambiarPasswordRecuperacion: (datos) =>
        ipcRenderer.invoke("auth:cambiarPasswordRecuperacion", datos),

    verificarRespuestaRecuperacion: (datos) =>
        ipcRenderer.invoke("auth:verificarRespuestaRecuperacion", datos),

    validarSesionRemota: (token) =>
        ipcRenderer.invoke("auth:validarSesion", token),

    cerrarSesionRemota: (token) =>
        ipcRenderer.invoke("auth:logout", token),

    actualizarNombreRemoto: (datos) =>
        ipcRenderer.invoke("perfil:actualizarNombre", datos),

    actualizarPasswordRemoto: (datos) =>
        ipcRenderer.invoke("perfil:actualizarPassword", datos),

    actualizarRespuestaRecuperacionRemota: (datos) =>
        ipcRenderer.invoke("perfil:actualizarRespuestaRecuperacion", datos),

    listarBackupsRemotos: (token) =>
        ipcRenderer.invoke("backup:remoto:listar", token),

    guardarBackupRemoto: (datos) =>
        ipcRenderer.invoke("backup:remoto:guardar", datos),

    actualizarBackupRemoto: (datos) =>
        ipcRenderer.invoke("backup:remoto:actualizar", datos),

    guardarResultadoTriviaRemoto: (datos) =>
        ipcRenderer.invoke("resultado:remoto:trivia", datos),

    guardarResultadoPhishingRemoto: (datos) =>
        ipcRenderer.invoke("resultado:remoto:phishing", datos),

    obtenerEncuestaUsabilidadRemota: (token) =>
        ipcRenderer.invoke("encuesta:remota:obtener", token),

    guardarEncuestaUsabilidadRemota: (datos) =>
        ipcRenderer.invoke("encuesta:remota:guardar", datos),

    obtenerResumenDashboardRemoto: (token) =>
        ipcRenderer.invoke("dashboard:remoto:resumen", token),

    administrarContenidoRemoto: (metodo, datos) =>
        ipcRenderer.invoke("admin:contenido", metodo, datos),

    obtenerAnaliticasAdminRemoto: (token) =>
        ipcRenderer.invoke("admin:analiticas", token),

    // ============================================================
    // BRECHAS
    // ============================================================

    verificarBrechasCorreo: (correo, apiKey) =>
        ipcRenderer.invoke("brechas:verificar", correo, apiKey),

    // ============================================================
    // ARCHIVOS
    // ============================================================
    seleccionarArchivo: () => ipcRenderer.invoke("dialog:abrirArchivo"),

    // ============================================================
    // VIRUSTOTAL
    // ============================================================

    escanearArchivoVirusTotal: (rutaArchivo, apiKey) =>
        ipcRenderer.invoke("virustotal:escanearArchivo", rutaArchivo, apiKey),
        
    escanearUrlVirusTotal: (url, apiKey) =>
        ipcRenderer.invoke("virustotal:escanearUrl", url, apiKey),

    // ============================================================
    // ENTRENAMIENTO
    // ============================================================

    obtenerContenidoAcademiaRemoto: (token) =>
        ipcRenderer.invoke("academia:remoto:contenido", token),

});