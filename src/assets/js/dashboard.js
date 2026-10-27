document.addEventListener("DOMContentLoaded", () => {
    const nombreUsuarioSesion = document.getElementById(
        "nombreUsuarioSesion"
    );

    function obtenerUsuarioActivoDesdeSesion() {
        const usuarioGuardado = localStorage.getItem(
            "hades_usuario_activo"
        );

        if (!usuarioGuardado) {
            return null;
        }

        try {
            return JSON.parse(usuarioGuardado);
        } catch (error) {
            console.error("No se pudo leer el usuario activo:", error);
            localStorage.removeItem("hades_usuario_activo");
            return null;
        }
    }

    function verificarSesion() {
        const usuarioActual = obtenerUsuarioActivoDesdeSesion();

        if (!usuarioActual) {
            window.location.href = "bienvenida.html";
            return;
        }

        if (nombreUsuarioSesion) {
            nombreUsuarioSesion.textContent = usuarioActual.nombre;
        }

        // También actualizar elementos del sidebar que muestren el nombre (clase .sidebar-nombreUsuario)
        const sidebarNombres = document.querySelectorAll('.sidebar-nombreUsuario');
        if (sidebarNombres && sidebarNombres.length) {
            sidebarNombres.forEach(el => {
                el.textContent = usuarioActual.nombre;
            });
        }
    }

    async function cargarResumenDashboard() {
    const usuarioActual = obtenerUsuarioActivoDesdeSesion();

    if (!usuarioActual) {
        return;
    }

    try {
        const resumen =
            await window.hadesAPI.obtenerResumenDashboardRemoto(
                usuarioActual.token
            );

        // ==========================
        // BACKUP
        // ==========================
        const fechaBackup = document.getElementById(
            "dashboardFechaBackup"
        );

        const descripcionBackup = document.getElementById(
            "dashboardDescripcionBackup"
        );
        const ubicacionBackup = document.getElementById(
            "dashboardUbicacionBackup"
        );

        if (resumen.proximoBackup) {
            const fecha = new Date(resumen.proximoBackup.proximo_backup);
            if (Number.isNaN(fecha.getTime())) {
                console.error("La fecha del próximo backup no es válida.");
                fechaBackup.textContent = "Fecha no válida.";
            } else {
                fechaBackup.textContent = new Intl.DateTimeFormat("es-AR", {
                    dateStyle: "long",
                    timeStyle: "short"
                }).format(fecha);
            }

            descripcionBackup.textContent = resumen.proximoBackup.nombre;
            ubicacionBackup.textContent = resumen.proximoBackup.ubicacion;
        }

        // ==========================
        // PHISHING
        // ==========================
        const estadisticas = resumen.estadisticas || {};
        const puntajePhishing = document.getElementById(
            "dashboardPuntajePhishing"
        );

        const barraPhishing = document.getElementById(
            "dashboardBarraPhishing"
        );

        const detallePhishing = document.getElementById(
            "dashboardDetallePhishing"
        );
        const promedioPhishing =
            Number(estadisticas.promedioPhishing || 0);
        const simulacionesPhishing =
            Number(estadisticas.simulacionesPhishingRealizadas || 0);

        puntajePhishing.textContent = `${promedioPhishing}%`;
        barraPhishing.style.width = `${promedioPhishing}%`;
        if (simulacionesPhishing > 0) {
            detallePhishing.textContent =
                `${simulacionesPhishing} caso(s) completado(s) · Mejor puntaje: ${estadisticas.mejorPuntajePhishing || 0}%.`;
        }

        const promedioSmishingVishing = Number(
            estadisticas.promedioSmishingVishing || 0
        );
        const barraSmishingVishing = document.getElementById(
            "dashboardBarraSmishingVishing"
        );
        const puntajeSmishingVishing = document.getElementById(
            "dashboardPromedioSmishingVishing"
        );
        const detalleSmishingVishing = document.getElementById(
            "dashboardDetalleSmishingVishing"
        );
        const simulacionesSmishingVishing = Number(
            estadisticas.simulacionesSmishingVishingRealizadas || 0
        );

        puntajeSmishingVishing.textContent = `${promedioSmishingVishing}%`;
        barraSmishingVishing.style.width = `${promedioSmishingVishing}%`;
        if (simulacionesSmishingVishing > 0) {
            detalleSmishingVishing.textContent =
                `${simulacionesSmishingVishing} caso(s) completado(s) · Promedio acumulado de puntaje.`;
        }

        const totalActividades =
            Number(estadisticas.simulacionesRealizadas || 0) +
            Number(estadisticas.triviasRealizadas || 0);
        const totalActividadesElemento = document.getElementById(
            "dashboardTotalActividades"
        );
        const detalleActividades = document.getElementById(
            "dashboardDetalleActividades"
        );
        const promedioTrivia = document.getElementById(
            "dashboardPromedioTrivia"
        );
        const detalleTriviaGeneral = document.getElementById(
            "dashboardDetalleTriviaGeneral"
        );

        totalActividadesElemento.textContent = totalActividades;
        detalleActividades.textContent =
            `${estadisticas.simulacionesRealizadas || 0} simulaciones y ${estadisticas.triviasRealizadas || 0} trivias realizadas.`;

        promedioTrivia.textContent =
            `${estadisticas.promedioTrivia || 0}%`;
        detalleTriviaGeneral.textContent =
            `${estadisticas.triviasRealizadas || 0} intento(s) registrado(s) · Promedio general de aciertos.`;

    } catch (error) {
        console.error(
            "Error cargando resumen del dashboard:",
            error
        );
    }
}

    async function cargarProgresoAcademia(usuarioActual) {
        const detalle = document.getElementById(
            "dashboardDetalleProgresoAcademia"
        );
        const porcentajeElemento = document.getElementById(
            "dashboardPorcentajeAcademia"
        );
        const barra = document.getElementById(
            "dashboardBarraProgresoAcademia"
        );
        const conceptosLeidosElemento = document.getElementById(
            "dashboardConceptosLeidos"
        );
        const conceptosPendientesElemento = document.getElementById(
            "dashboardConceptosPendientes"
        );

        try {
            if (!window.hadesAPI?.obtenerContenidoAcademiaRemoto) {
                throw new Error("No está disponible la API de contenido de la academia.");
            }

            const respuesta = await window.hadesAPI.obtenerContenidoAcademiaRemoto(
                usuarioActual.token
            );
            const conceptos = respuesta?.contenido?.concept;
            const mitos = respuesta?.contenido?.myth;
            if (!Array.isArray(conceptos) || !Array.isArray(mitos)) {
                throw new Error("El servidor no devolvió listas válidas de conceptos y mitos.");
            }

            const idUsuario = usuarioActual.id_usuario ?? usuarioActual.id;
            if (!idUsuario) {
                throw new Error("No se encontró el identificador de usuario.");
            }

            const progresoGuardado = localStorage.getItem(
                `hades_conceptos_leidos_${idUsuario}`
            );
            const progresoMitosGuardado = localStorage.getItem(
                `hades_mitos_leidos_${idUsuario}`
            );
            const parsearIdsLeidos = (progreso, tipo) => {
                if (!progreso) {
                    return [];
                }
                const ids = JSON.parse(progreso);
                if (!Array.isArray(ids)) {
                    throw new Error(`El progreso de ${tipo} guardado no es válido.`);
                }
                return ids.filter((id) => typeof id === "string");
            };
            const idsConceptosLeidos = parsearIdsLeidos(
                progresoGuardado,
                "conceptos"
            );
            const idsMitosLeidos = parsearIdsLeidos(
                progresoMitosGuardado,
                "mitos"
            );

            const idsConceptosDisponibles = new Set(
                conceptos.map((concepto) => String(concepto.id))
            );
            const idsMitosDisponibles = new Set(
                mitos.map((mito) => String(mito.id))
            );
            const cantidadConceptosLeidos = new Set(
                idsConceptosLeidos.filter((id) =>
                    idsConceptosDisponibles.has(id)
                )
            ).size;
            const cantidadMitosLeidos = new Set(
                idsMitosLeidos.filter((id) => idsMitosDisponibles.has(id))
            ).size;
            const cantidadLeidos = cantidadConceptosLeidos + cantidadMitosLeidos;
            const total = conceptos.length + mitos.length;
            const cantidadPendientes = total - cantidadLeidos;
            const porcentaje = total > 0
                ? Math.round((cantidadLeidos / total) * 100)
                : 0;

            porcentajeElemento.textContent = `${porcentaje}%`;
            barra.style.width = `${porcentaje}%`;
            barra.setAttribute("aria-valuenow", String(porcentaje));
            conceptosLeidosElemento.textContent =
                `${cantidadLeidos} ${cantidadLeidos === 1 ? "elemento leído" : "elementos leídos"}`;
            conceptosPendientesElemento.textContent =
                `${cantidadPendientes} ${cantidadPendientes === 1 ? "elemento pendiente" : "elementos pendientes"}`;
            detalle.textContent = total > 0
                ? `Has leído ${cantidadLeidos} de ${total} elementos de la Academia. ¡Seguí avanzando!`
                : "Todavía no hay contenidos de lectura publicados en la Academia.";
        } catch (error) {
            console.error("No se pudo cargar el progreso de la academia:", error);
            detalle.textContent =
                "No se pudo cargar el progreso de lectura. Intentá nuevamente más tarde.";
        }
    }

    verificarSesion();
    cargarResumenDashboard();
    const usuarioActual = obtenerUsuarioActivoDesdeSesion();
    if (usuarioActual) {
        cargarProgresoAcademia(usuarioActual);
    }

});