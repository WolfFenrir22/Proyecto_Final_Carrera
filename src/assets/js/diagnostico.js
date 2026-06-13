document.addEventListener("DOMContentLoaded", () => {
    // ##################Obtiene referencias a los elementos del DOM relacionados con la evaluación de la contraseña
    const inputPassword = document.getElementById("inputPassword");
    const btnVerPassword = document.getElementById("btnVerPassword");
    const iconoVerPassword = document.getElementById("iconoVerPassword");
    const barraPassword = document.getElementById("barraPassword");
    const porcentajePassword = document.getElementById("porcentajePassword");
    const nivelPassword = document.getElementById("nivelPassword");
    const recomendacionPassword = document.getElementById("recomendacionPassword");

    // #################Referencias a los criterios de evaluación
    const criterioLongitud = document.getElementById("criterioLongitud");
    const criterioMayuscula = document.getElementById("criterioMayuscula");
    const criterioMinuscula = document.getElementById("criterioMinuscula");
    const criterioNumero = document.getElementById("criterioNumero");
    const criterioSimbolo = document.getElementById("criterioSimbolo");
    const criterioPatron = document.getElementById("criterioPatron");

    // #################Referencias a los elementos del DOM relacionados con los recordatorios de backup
    const formBackup = document.getElementById("formBackup");
    const nombreBackup = document.getElementById("nombreBackup");
    const ubicacionBackup = document.getElementById("ubicacionBackup");
    const frecuenciaBackup = document.getElementById("frecuenciaBackup");
    const ultimoBackup = document.getElementById("ultimoBackup");
    const mensajeBackup = document.getElementById("mensajeBackup");
    const listaBackups = document.getElementById("listaBackups");
    const cantidadBackups = document.getElementById("cantidadBackups");

    //#################Funciones relacionadas con la evaluación de la contraseña #################
    const formBrechas = document.getElementById("formBrechas");
    const correoBrechas = document.getElementById("correoBrechas");
    const botonBuscarBrechas = document.getElementById(
        "botonBuscarBrechas"
    );
    const iconoBuscarBrechas = document.getElementById(
        "iconoBuscarBrechas"
    );
    const textoBotonBrechas = document.getElementById(
        "textoBotonBrechas"
    );
    const mensajeBrechas = document.getElementById("mensajeBrechas");
    const resultadoBrechas = document.getElementById(
        "resultadoBrechas"
    );
    const estadoInicialBrechas = document.getElementById(
        "estadoInicialBrechas"
    );
    const iconoResultadoBrechas = document.getElementById(
        "iconoResultadoBrechas"
    );
    const tituloResultadoBrechas = document.getElementById(
        "tituloResultadoBrechas"
    );
    const descripcionResultadoBrechas = document.getElementById(
        "descripcionResultadoBrechas"
    );
    const listaBrechas = document.getElementById("listaBrechas");
    const recomendacionBrechas = document.getElementById(
        "recomendacionBrechas"
    );
    const textoRecomendacionBrechas = document.getElementById(
        "textoRecomendacionBrechas"
    );

    //##############################################################################

  //  if (!inputPassword) {
  //      return;
  //  }

    const patronesComunes = [
        "123456",
        "123456789",
        "password",
        "contraseña",
        "admin",
        "qwerty",
        "abc123",
        "111111",
        "000000",
        "fabio"
    ];

    function evaluarPassword(password) {
        const longitudOk = password.length >= 12;
        const mayusculaOk = /[A-ZÁÉÍÓÚÑ]/.test(password);
        const minusculaOk = /[a-záéíóúñ]/.test(password);
        const numeroOk = /[0-9]/.test(password);
        const simboloOk = /[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9]/.test(password);

        const passwordMinuscula = password.toLowerCase();

        const patronComun = patronesComunes.some((patron) =>
            passwordMinuscula.includes(patron)
        );

        let puntaje = 0;

        if (password.length > 0) {
            puntaje += Math.min(password.length * 4, 40);
        }

        if (longitudOk) {
            puntaje += 15;
        }

        if (mayusculaOk) {
            puntaje += 10;
        }

        if (minusculaOk) {
            puntaje += 10;
        }

        if (numeroOk) {
            puntaje += 10;
        }

        if (simboloOk) {
            puntaje += 15;
        }

        if (patronComun) {
            puntaje -= 25;
        }

        if (password.length === 0) {
            puntaje = 0;
        }

        puntaje = Math.max(0, Math.min(puntaje, 100));

        let nivel = "Sin evaluar";

        if (puntaje > 0 && puntaje < 40) {
            nivel = "Débil";
        } else if (puntaje >= 40 && puntaje < 70) {
            nivel = "Media";
        } else if (puntaje >= 70 && puntaje < 90) {
            nivel = "Fuerte";
        } else if (puntaje >= 90) {
            nivel = "Muy fuerte";
        }

        const recomendacion = generarRecomendacion({
            password,
            longitudOk,
            mayusculaOk,
            minusculaOk,
            numeroOk,
            simboloOk,
            patronComun,
            puntaje
        });

        return {
            puntaje,
            nivel,
            longitudOk,
            mayusculaOk,
            minusculaOk,
            numeroOk,
            simboloOk,
            patronComun,
            recomendacion
        };
    }

    function generarRecomendacion(resultado) {
        if (resultado.password.length === 0) {
            return "Ingresá una contraseña para recibir sugerencias.";
        }

        if (resultado.patronComun) {
            return "Evitá usar patrones comunes como 123456, admin, password, qwerty o datos personales fáciles de adivinar.";
        }

        if (!resultado.longitudOk) {
            return "Aumentá la longitud de la contraseña. Se recomienda utilizar al menos 12 caracteres.";
        }

        if (!resultado.mayusculaOk) {
            return "Agregá al menos una letra mayúscula para mejorar la variedad de caracteres.";
        }

        if (!resultado.minusculaOk) {
            return "Agregá al menos una letra minúscula para mejorar la combinación de caracteres.";
        }

        if (!resultado.numeroOk) {
            return "Incluí al menos un número para aumentar la robustez de la contraseña.";
        }

        if (!resultado.simboloOk) {
            return "Agregá caracteres especiales como @, #, $, %, &, ! o ? para fortalecer la contraseña.";
        }

        if (resultado.puntaje >= 90) {
            return "La contraseña presenta una robustez alta. Recordá no reutilizarla en distintos servicios.";
        }

        return "La contraseña es aceptable, pero puede mejorar combinando más variedad de caracteres.";
    }

    function actualizarCriterio(elemento, cumple) {
        if (!elemento) {
            return;
        }

        const icono = elemento.querySelector(".material-symbols-outlined");

        if (!icono) {
            return;
        }

        if (cumple) {
            icono.textContent = "check_circle";
            icono.classList.remove("text-error");
            icono.classList.add("text-secondary");

            elemento.classList.add("border", "border-secondary/20");
        } else {
            icono.textContent = "cancel";
            icono.classList.remove("text-secondary");
            icono.classList.add("text-error");

            elemento.classList.remove("border", "border-secondary/20");
        }
    }

    function actualizarVista(resultado) {
        barraPassword.style.width = `${resultado.puntaje}%`;
        porcentajePassword.textContent = `${resultado.puntaje}%`;
        nivelPassword.textContent = `Nivel: ${resultado.nivel}`;
        recomendacionPassword.textContent = resultado.recomendacion;

        barraPassword.classList.remove(
            "bg-error",
            "bg-tertiary-container",
            "bg-secondary",
            "bg-primary"
        );

        if (resultado.puntaje < 40) {
            barraPassword.classList.add("bg-error");
        } else if (resultado.puntaje < 70) {
            barraPassword.classList.add("bg-tertiary-container");
        } else if (resultado.puntaje < 90) {
            barraPassword.classList.add("bg-secondary");
        } else {
            barraPassword.classList.add("bg-primary");
        }

        actualizarCriterio(criterioLongitud, resultado.longitudOk);
        actualizarCriterio(criterioMayuscula, resultado.mayusculaOk);
        actualizarCriterio(criterioMinuscula, resultado.minusculaOk);
        actualizarCriterio(criterioNumero, resultado.numeroOk);
        actualizarCriterio(criterioSimbolo, resultado.simboloOk);

        const passwordIngresada = inputPassword.value.length > 0;
        actualizarCriterio(
            criterioPatron,
            passwordIngresada && !resultado.patronComun
        );
    }

    if (inputPassword) {
    inputPassword.addEventListener("input", () => {
        const resultado = evaluarPassword(inputPassword.value);
        actualizarVista(resultado);
    });

    if (btnVerPassword && iconoVerPassword) {
        btnVerPassword.addEventListener("click", () => {
            const passwordOculta = inputPassword.type === "password";

            inputPassword.type = passwordOculta
                ? "text"
                : "password";

            iconoVerPassword.textContent = passwordOculta
                ? "visibility_off"
                : "visibility";
        });
    }

    actualizarVista(evaluarPassword(""));
}
    //#################Fin de la sección relacionada con la evaluación de la contraseña #################


    //#################Funciones relacionadas con los recordatorios de backup ###########################
    let usuarioActual = null;

    function mostrarMensajeBackup(mensaje) {
        if (!mensajeBackup) {
            return;
        }

        mensajeBackup.textContent = mensaje;
        mensajeBackup.classList.remove("hidden");
    }

    function ocultarMensajeBackup() {
        if (!mensajeBackup) {
            return;
        }

        mensajeBackup.textContent = "";
        mensajeBackup.classList.add("hidden");
    }

    function formatearFecha(fechaISO) {
        if (!fechaISO) {
            return "Sin fecha";
        }

        const fecha = new Date(fechaISO);

        return fecha.toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    }

    function obtenerTextoFrecuencia(frecuencia) {
        if (frecuencia === "diario") {
            return "Diario";
        }

        if (frecuencia === "semanal") {
            return "Semanal";
        }

        if (frecuencia === "mensual") {
            return "Mensual";
        }

        return frecuencia;
    }

    function obtenerEstadoBackup(proximoBackupISO) {
    if (!proximoBackupISO) {
        return {
            texto: "SIN FECHA",
            clases: "text-outline bg-surface-container",
            icono: "help"
        };
    }

    const hoy = new Date();
    const proximoBackup = new Date(proximoBackupISO);

    hoy.setHours(0, 0, 0, 0);
    proximoBackup.setHours(0, 0, 0, 0);

    const diferenciaMs = proximoBackup - hoy;
    const diferenciaDias = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));

    if (diferenciaDias < 0) {
        return {
            texto: "VENCIDO",
            clases: "text-error bg-red-100",
            icono: "warning"
        };
    }

    if (diferenciaDias <= 2) {
        return {
            texto: "PENDIENTE",
            clases: "text-primary bg-blue-100",
            icono: "schedule"
        };
    }

    return {
        texto: "AL DÍA",
        clases: "text-secondary bg-secondary-container",
        icono: "check_circle"
    };
}

    function obtenerTextoProximoBackup(proximoBackupISO) {
    if (!proximoBackupISO) {
        return "Sin fecha programada";
    }

    const hoy = new Date();
    const proximoBackup = new Date(proximoBackupISO);

    hoy.setHours(0, 0, 0, 0);
    proximoBackup.setHours(0, 0, 0, 0);

    const diferenciaMs = proximoBackup - hoy;
    const diferenciaDias = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));

    if (diferenciaDias < 0) {
        return `Vencido hace ${Math.abs(diferenciaDias)} día/s`;
    }

    if (diferenciaDias === 0) {
        return "Debe realizarse hoy";
    }

    if (diferenciaDias === 1) {
        return "Próximo: mañana";
    }

    return `Próximo: en ${diferenciaDias} días`;
}


    function renderizarBackups(recordatorios) {
        if (!listaBackups || !cantidadBackups) {
            return;
        }

        cantidadBackups.textContent = `${recordatorios.length} activos`;

        if (recordatorios.length === 0) {
            listaBackups.innerHTML = `
                <div class="bg-white/40 border-2 border-dashed border-outline-variant rounded-2xl flex flex-col items-center justify-center p-8">
                    <div class="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-outline">
                        <span class="material-symbols-outlined text-3xl">
                            cloud_off
                        </span>
                    </div>

                    <p class="mt-4 font-label-md text-outline text-center">
                        Todavía no hay recordatorios cargados.
                    </p>
                </div>
            `;

            return;
        }

        listaBackups.innerHTML = "";

        recordatorios.forEach((recordatorio) => {
            const item = document.createElement("div");

            const estadoBackup = obtenerEstadoBackup(recordatorio.proximo_backup);
           // const textoProximoBackup = obtenerTextoProximoBackup(recordatorio.proximo_backup);

            item.className =
                "bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between";

            item.innerHTML = `
                <div>
                    <div class="flex justify-between items-start mb-4">
                        <div class="bg-blue-50 p-2 rounded-lg text-primary">
                            <span class="material-symbols-outlined">
                                folder_copy
                            </span>
                        </div>

                        <span class="text-[10px] font-bold ${estadoBackup.clases} px-2 py-1 rounded-full flex items-center gap-1">
                            <span class="material-symbols-outlined text-[14px]">
                                ${estadoBackup.icono}
                            </span>
                            ${estadoBackup.texto}
                        </span>
                    </div>

                    <h4 class="font-bold text-on-background mb-1">
                        ${recordatorio.nombre}
                    </h4>

                    <p class="text-caption text-outline mb-4">
                        ${recordatorio.ubicacion}
                    </p>
                </div>

                <div class="space-y-4">
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-sm text-outline">
                            calendar_month
                        </span>

                        <span class="text-xs text-on-surface">
                            Frecuencia: ${obtenerTextoFrecuencia(recordatorio.frecuencia)}
                        </span>
                    </div>

                    <div class="text-caption text-outline">
                        Último respaldo: ${formatearFecha(recordatorio.ultimo_backup)}
                    </div>

                    <p class="text-[11px] text-primary font-bold">
                        Próximo respaldo: ${formatearFecha(recordatorio.proximo_backup)}
                    </p>

                    <div class="flex items-center gap-3 flex-wrap">
                        <button
                            type="button"
                            class="btnBackupRealizado text-xs text-secondary font-bold flex items-center gap-1 hover:underline"
                            data-id="${recordatorio.id_recordatorio}">
                            <span class="material-symbols-outlined text-sm">
                                check_circle
                            </span>
                            Marcar realizado
                        </button>
                        <button
                            type="button"
                            class="btnEliminarBackup text-xs text-error font-bold flex items-center gap-1 hover:underline"
                            data-id="${recordatorio.id_recordatorio}">
                            <span class="material-symbols-outlined text-sm">
                                delete
                            </span>
                            Eliminar
                        </button>
                    </div>
                </div>
            `;

            listaBackups.appendChild(item);
        });
    }

    async function cargarBackups() {
        if (!usuarioActual || !window.hadesAPI?.obtenerRecordatoriosBackup) {
            return;
        }

        const recordatorios = await window.hadesAPI.obtenerRecordatoriosBackup(
            usuarioActual.id_usuario
        );

        renderizarBackups(recordatorios);
    }

    async function iniciarModuloBackups() {
    if (!formBackup) {
        return;
    }

    try {
        usuarioActual = await window.hadesAPI.obtenerUsuario();

        if (!usuarioActual) {
            mostrarMensajeBackup("No se encontró un usuario activo.");
            return;
        }

        await cargarBackups();
    } catch (error) {
        mostrarMensajeBackup("No se pudieron cargar los recordatorios.");
        console.error("Error al cargar recordatorios:", error);
    }

    formBackup.addEventListener("submit", async (event) => {
        event.preventDefault();

        ocultarMensajeBackup();

        const nombre = nombreBackup.value.trim();
        const ubicacion = ubicacionBackup.value.trim();
        const frecuencia = frecuenciaBackup.value;
        const ultimo = ultimoBackup.value;

        if (nombre.length < 3) {
            mostrarMensajeBackup("Ingresá un nombre válido para el respaldo.");
            return;
        }

        if (ubicacion.length < 3) {
            mostrarMensajeBackup("Ingresá una ubicación válida para el respaldo.");
            return;
        }

        if (!ultimo) {
            mostrarMensajeBackup("Seleccioná la fecha del último backup realizado.");
            return;
        }

        try {
            await window.hadesAPI.guardarRecordatorioBackup({
                id_usuario: usuarioActual.id_usuario,
                nombre,
                ubicacion,
                frecuencia,
                ultimo_backup: new Date(ultimo).toISOString()
            });

            formBackup.reset();
            frecuenciaBackup.value = "semanal";

            await cargarBackups();
        } catch (error) {
            mostrarMensajeBackup("No se pudo guardar el recordatorio.");
            console.error("Error al guardar recordatorio:", error);
        }
    });

    if (listaBackups) {
        listaBackups.addEventListener("click", async (event) => {
            const botonRealizado = event.target.closest(".btnBackupRealizado");
            const botonEliminar = event.target.closest(".btnEliminarBackup");

            if (botonRealizado) {
                const idRecordatorio = Number(botonRealizado.dataset.id);

                console.log("Botón Marcar realizado presionado");
                console.log("ID del recordatorio:", idRecordatorio);
                console.log("API disponible:", window.hadesAPI);

                if (!window.hadesAPI?.marcarBackupRealizado) {
                    mostrarMensajeBackup("La función para marcar backup realizado no está disponible.");
                    console.error("No existe window.hadesAPI.marcarBackupRealizado");
                    return;
                }

                try {
                    await window.hadesAPI.marcarBackupRealizado(idRecordatorio);
                    await cargarBackups();
                } catch (error) {
                    mostrarMensajeBackup("No se pudo actualizar el recordatorio.");
                    console.error("Error al marcar backup como realizado:", error);
                }

                return;
            }

            if (botonEliminar) {
                const idRecordatorio = Number(botonEliminar.dataset.id);

                const confirmar = confirm("¿Querés eliminar este recordatorio?");

                if (!confirmar) {
                    return;
                }

                try {
                    await window.hadesAPI.eliminarRecordatorioBackup(idRecordatorio);
                    await cargarBackups();
                } catch (error) {
                    mostrarMensajeBackup("No se pudo eliminar el recordatorio.");
                    console.error("Error al eliminar recordatorio:", error);
                }
            }
        });
    }
}

//iniciarModuloBackups();
//#################Fin de la sección relacionada con los recordatorios de backup ###########################

//#######################Funciones relacionadas con la verificación de brechas de seguridad#################################
        function validarCorreo(correo) {
            const expresionCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            return expresionCorreo.test(correo);
        }

        function mostrarMensajeBrechas(mensaje, tipo = "error") {
            if (!mensajeBrechas) {
                return;
            }

            mensajeBrechas.textContent = mensaje;
            mensajeBrechas.classList.remove(
                "hidden",
                "bg-red-500/20",
                "text-red-100",
                "bg-blue-500/20",
                "text-blue-100"
            );

            if (tipo === "informacion") {
                mensajeBrechas.classList.add(
                    "bg-blue-500/20",
                    "text-blue-100"
                );
            } else {
                mensajeBrechas.classList.add(
                    "bg-red-500/20",
                    "text-red-100"
                );
            }
        }

        function ocultarMensajeBrechas() {
            if (!mensajeBrechas) {
                return;
            }

            mensajeBrechas.textContent = "";
            mensajeBrechas.classList.add("hidden");
        }

        function establecerCargaBrechas(cargando) {
            botonBuscarBrechas.disabled = cargando;

            if (
                !botonBuscarBrechas ||
                !textoBotonBrechas ||
                !iconoBuscarBrechas
            ){
                return;
            }

            botonBuscarBrechas.disabled = cargando;

            if (cargando) {
                textoBotonBrechas.textContent = "BUSCANDO";
                iconoBuscarBrechas.textContent = "progress_activity";
                iconoBuscarBrechas.classList.add("animate-spin");
            } else {
                textoBotonBrechas.textContent = "BUSCAR";
                iconoBuscarBrechas.textContent = "search";
                iconoBuscarBrechas.classList.remove("animate-spin");
            }
        }

        function limpiarResultadoBrechas() {
            if (
                !listaBrechas ||
                !recomendacionBrechas ||
                !textoRecomendacionBrechas
            ) {
                return;
            }

            listaBrechas.innerHTML = "";
            recomendacionBrechas.classList.add("hidden");
            textoRecomendacionBrechas.textContent = "";
        }

        function formatearFechaBrecha(fecha) {
            if (!fecha) {
                return "Fecha no informada";
            }

            const [anio, mes, dia] = fecha.split("-");

            return `${dia}/${mes}/${anio}`;
        }

        function formatearCantidad(cantidad) {
            return new Intl.NumberFormat("es-AR").format(cantidad || 0);
        }

        function limpiarResultadoBrechas() {
            listaBrechas.innerHTML = "";
            recomendacionBrechas.classList.add("hidden");
            textoRecomendacionBrechas.textContent = "";
        }

        function mostrarCorreoSinBrechas() {
            limpiarResultadoBrechas();

            estadoInicialBrechas.classList.add("hidden");
            resultadoBrechas.classList.remove("hidden");

            iconoResultadoBrechas.textContent = "verified_user";
            iconoResultadoBrechas.classList.remove("text-error");
            iconoResultadoBrechas.classList.add("text-secondary-fixed");

            tituloResultadoBrechas.textContent =
                "No se encontraron brechas";

            descripcionResultadoBrechas.textContent =
                "El correo no aparece en las brechas devueltas por el servicio.";

            recomendacionBrechas.classList.remove("hidden");

            textoRecomendacionBrechas.textContent =
                "Mantené contraseñas únicas, activá la autenticación en dos pasos y repetí la consulta periódicamente.";
        }

        function crearTarjetaBrecha(brecha) {
            const tarjeta = document.createElement("article");

            tarjeta.className =
                "rounded-xl bg-white/10 border border-white/15 p-4";

            const encabezado = document.createElement("div");
            encabezado.className =
                "flex items-start justify-between gap-3";

            const informacion = document.createElement("div");

            const titulo = document.createElement("h5");
            titulo.className = "font-bold text-white";
            titulo.textContent = brecha.titulo;

            const dominio = document.createElement("p");
            dominio.className = "text-xs text-white/60 mt-1";
            dominio.textContent = brecha.dominio;

            informacion.appendChild(titulo);
            informacion.appendChild(dominio);

            const fecha = document.createElement("span");
            fecha.className =
                "text-[10px] text-white/70 bg-white/10 px-2 py-1 rounded-full";
            fecha.textContent = formatearFechaBrecha(brecha.fecha);

            encabezado.appendChild(informacion);
            encabezado.appendChild(fecha);

            const cantidad = document.createElement("p");
            cantidad.className = "text-xs text-white/70 mt-3";
            cantidad.textContent =
                `${formatearCantidad(brecha.cantidadAfectados)} cuentas afectadas`;

            const datos = document.createElement("p");
            datos.className = "text-xs text-white/70 mt-2";

            if (brecha.datosExpuestos.length > 0) {
                datos.textContent =
                    `Datos expuestos: ${brecha.datosExpuestos.join(", ")}`;
            } else {
                datos.textContent =
                    "No se informaron las categorías de datos expuestos.";
            }

            tarjeta.appendChild(encabezado);
            tarjeta.appendChild(cantidad);
            tarjeta.appendChild(datos);

            return tarjeta;
        }

        function mostrarBrechasEncontradas(resultado) {
            limpiarResultadoBrechas();

            estadoInicialBrechas.classList.add("hidden");
            resultadoBrechas.classList.remove("hidden");

            iconoResultadoBrechas.textContent = "warning";
            iconoResultadoBrechas.classList.remove(
                "text-secondary-fixed"
            );
            iconoResultadoBrechas.classList.add("text-tertiary-fixed");

            tituloResultadoBrechas.textContent =
                "Se encontraron exposiciones";

            descripcionResultadoBrechas.textContent =
                `El correo apareció en ${resultado.cantidad} brecha(s) conocida(s).`;

            resultado.brechas.forEach((brecha) => {
                listaBrechas.appendChild(crearTarjetaBrecha(brecha));
            });

            recomendacionBrechas.classList.remove("hidden");

            textoRecomendacionBrechas.textContent =
                "Cambiá las contraseñas de los servicios afectados, evitá reutilizarlas y activá la autenticación en dos pasos.";
        }

        async function iniciarModuloBrechas() {
            if (!formBrechas) {
                return;
            }

            formBrechas.addEventListener("submit", async (event) => {
                event.preventDefault();

                ocultarMensajeBrechas();

                const correo = correoBrechas.value.trim();

                if (!validarCorreo(correo)) {
                    mostrarMensajeBrechas(
                        "Ingresá una dirección de correo válida."
                    );
                    return;
                }

                establecerCargaBrechas(true);

                try {
                    const resultado =
                        await window.hadesAPI.verificarBrechasCorreo(correo);

                    if (resultado.estado === "sin_brechas") {
                        mostrarCorreoSinBrechas();
                    } else {
                        mostrarBrechasEncontradas(resultado);
                    }
                } catch (error) {
                    console.error(
                        "Error al verificar brechas:",
                        error
                    );

                    mostrarMensajeBrechas(
                        error.message ||
                        "No se pudo completar la verificación."
                    );
                } finally {
                    establecerCargaBrechas(false);
                }
            });
        }

//iniciarModuloBrechas();

async function iniciarModulosDiagnostico() {
    try {
        await iniciarModuloBackups();
        console.log("Módulo de backups iniciado.");
    } catch (error) {
        console.error(
            "Error al iniciar el módulo de backups:",
            error
        );
    }

    try {
        iniciarModuloBrechas();
        console.log("Módulo de brechas iniciado.");
    } catch (error) {
        console.error(
            "Error al iniciar el módulo de brechas:",
            error
        );
    }
}

iniciarModulosDiagnostico();
});