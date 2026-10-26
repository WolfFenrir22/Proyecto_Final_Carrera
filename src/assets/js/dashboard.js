document.addEventListener("DOMContentLoaded", () => {
    const encuestaPreguntas = [
        "Me gustaría usar HADES con frecuencia.",
        "Encontré el sistema innecesariamente complejo.",
        "Me pareció que la aplicación web era fácil de usar.",
        "Creo que necesitaría el apoyo de un técnico para poder usar esta plataforma.",
        "Encontré que las diversas funciones de HADES se entendían.",
        "Los contenidos educativos son fáciles de entender.",
        "Los simuladores son difíciles de usar y comprender.",
        "Encontré el sistema muy complicado de usar.",
        "Me sentí seguro/a y confiado/a al navegar y utilizar HADES.",
        "Necesité aprender muchas cosas antes de poder empezar a usar la aplicación."
    ];
    const encuestaPreguntasElement = document.getElementById("encuestaPreguntas");
    const encuestaFormulario = document.getElementById("formularioEncuesta");
    const encuestaMensaje = document.getElementById("mensajeEncuesta");
    const encuestaGuardar = document.getElementById("guardarEncuesta");
    let encuestaRespondida = false;

    const nombreUsuarioSesion = document.getElementById(
        "nombreUsuarioSesion"
    );

    function mostrarMensajeEncuesta(message, isError = false) {
        encuestaMensaje.textContent = message;
        encuestaMensaje.className = `mt-4 rounded-xl p-3 text-sm ${
            isError
                ? "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200"
                : "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
        }`;
    }

    function construirPreguntasEncuesta(respuestas = []) {
        encuestaPreguntasElement.replaceChildren();

        encuestaPreguntas.forEach((pregunta, index) => {
            const numero = index + 1;
            const fieldset = document.createElement("fieldset");
            fieldset.className = "rounded-xl border border-[#d1e5fa] p-4 dark:border-[#2b4e80]";

            const legend = document.createElement("legend");
            legend.className = "px-1 font-semibold text-slate-800 dark:text-slate-100";
            legend.textContent = `${numero}. ${pregunta}`;

            const choices = document.createElement("div");
            choices.className = "mt-3 grid grid-cols-5 gap-2";

            for (let value = 1; value <= 5; value += 1) {
                const label = document.createElement("label");
                label.className = "flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-[#b8d2f4] p-2 text-sm hover:bg-blue-50 has-[:checked]:border-blue-700 has-[:checked]:bg-blue-100 has-[:checked]:font-bold dark:border-[#2b4e80] dark:hover:bg-blue-950/40 dark:has-[:checked]:border-blue-300 dark:has-[:checked]:bg-blue-950/60";

                const input = document.createElement("input");
                input.type = "radio";
                input.name = `respuesta-${numero}`;
                input.value = String(value);
                input.required = true;
                input.checked = respuestas[index] === value;
                input.setAttribute(
                    "aria-label",
                    `${value}: ${value === 1 ? "Totalmente en desacuerdo" : value === 5 ? "Totalmente de acuerdo" : "Valoración intermedia"}`
                );
                input.className = "accent-blue-700";

                const valueLabel = document.createElement("span");
                valueLabel.textContent = String(value);
                label.append(input, valueLabel);
                choices.appendChild(label);
            }

            fieldset.append(legend, choices);
            encuestaPreguntasElement.appendChild(fieldset);
        });
    }

    async function cargarEncuesta() {
        const usuarioActual = obtenerUsuarioActivoDesdeSesion();
        if (!usuarioActual?.token) {
            return;
        }

        try {
            const resultado =
                await window.hadesAPI.obtenerEncuestaUsabilidadRemota(
                    usuarioActual.token
                );

            if (resultado.encuesta) {
                encuestaRespondida = true;
                construirPreguntasEncuesta(resultado.encuesta.respuestas);
                encuestaGuardar.textContent = "Actualizar mi valoración";
                mostrarMensajeEncuesta(
                    "Ya respondiste esta encuesta. Podés actualizar tus respuestas cuando quieras."
                );
            }
        } catch (error) {
            console.error("No se pudo cargar la encuesta de usabilidad:", error);
            mostrarMensajeEncuesta(
                error.message || "No se pudo consultar tu respuesta guardada.",
                true
            );
        }
    }

    encuestaFormulario.addEventListener("submit", async (event) => {
        event.preventDefault();
        const usuarioActual = obtenerUsuarioActivoDesdeSesion();
        if (!usuarioActual?.token) {
            mostrarMensajeEncuesta("Iniciá sesión nuevamente para guardar tu valoración.", true);
            return;
        }

        const respuestas = encuestaPreguntas.map((_, index) => {
            const seleccion = encuestaFormulario.querySelector(
                `input[name="respuesta-${index + 1}"]:checked`
            );
            return seleccion ? Number(seleccion.value) : null;
        });

        if (respuestas.some((respuesta) => respuesta === null)) {
            mostrarMensajeEncuesta("Completá las diez preguntas antes de guardar.", true);
            return;
        }

        encuestaGuardar.disabled = true;
        try {
            await window.hadesAPI.guardarEncuestaUsabilidadRemota({
                token: usuarioActual.token,
                respuestas
            });
            const eraActualizacion = encuestaRespondida;
            encuestaRespondida = true;
            encuestaGuardar.textContent = "Actualizar mi valoración";
            mostrarMensajeEncuesta(
                eraActualizacion
                    ? "Tu valoración se actualizó correctamente."
                    : "Tu valoración se guardó correctamente. Gracias por ayudarnos a mejorar HADES."
            );
        } catch (error) {
            console.error("No se pudo guardar la encuesta de usabilidad:", error);
            mostrarMensajeEncuesta(
                error.message || "No se pudo guardar tu valoración. Intentá nuevamente.",
                true
            );
        } finally {
            encuestaGuardar.disabled = false;
        }
    });

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
    construirPreguntasEncuesta();
    cargarEncuesta();
    

});