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

        if (resumen.proximoBackup) {
            fechaBackup.textContent =
                resumen.proximoBackup.proximo_backup;

            descripcionBackup.textContent =
                `${resumen.proximoBackup.nombre} - ${resumen.proximoBackup.ubicacion}`;
        }

        // ==========================
        // PHISHING
        // ==========================
        const puntajePhishing = document.getElementById(
            "dashboardPuntajePhishing"
        );

        const barraPhishing = document.getElementById(
            "dashboardBarraPhishing"
        );

        const detallePhishing = document.getElementById(
            "dashboardDetallePhishing"
        );

        if (resumen.ultimoPhishing) {
            const porcentaje =
                resumen.ultimoPhishing.puntaje || 0;

            puntajePhishing.textContent =
                `${porcentaje}%`;

            barraPhishing.style.width =
                `${porcentaje}%`;

            detallePhishing.textContent =
                `Escenario ${resumen.ultimoPhishing.tipo_escenario} · Dificultad ${resumen.ultimoPhishing.dificultad}`;
        }

        // ==========================
        // TRIVIA
        // ==========================
        const nivelTrivia = document.getElementById(
            "dashboardNivelTrivia"
        );

        const detalleTrivia = document.getElementById(
            "dashboardDetalleTrivia"
        );

        if (resumen.ultimaTrivia) {
            nivelTrivia.textContent =
                resumen.ultimaTrivia.nivel;

            detalleTrivia.textContent =
                `${resumen.ultimaTrivia.porcentaje}% de aciertos (${resumen.ultimaTrivia.respuestas_correctas}/${resumen.ultimaTrivia.total_preguntas})`;
        }

        const estadisticas = resumen.estadisticas || {};
        const totalActividades =
            Number(estadisticas.simulacionesRealizadas || 0) +
            Number(estadisticas.triviasRealizadas || 0);
        const totalActividadesElemento = document.getElementById(
            "dashboardTotalActividades"
        );
        const detalleActividades = document.getElementById(
            "dashboardDetalleActividades"
        );
        const promedioSimulaciones = document.getElementById(
            "dashboardPromedioSimulaciones"
        );
        const detalleSimulaciones = document.getElementById(
            "dashboardDetalleSimulaciones"
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

        promedioSimulaciones.textContent =
            `${estadisticas.promedioSimulaciones || 0}%`;
        detalleSimulaciones.textContent =
            `${estadisticas.simulacionesRealizadas || 0} casos completados · Mejor puntaje: ${estadisticas.mejorPuntajeSimulacion || 0}%.`;

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

    verificarSesion();
    cargarResumenDashboard();

});