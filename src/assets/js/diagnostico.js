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

    const nombreUsuarioSesion = document.getElementById(
    "nombreUsuarioSesion"
);

function mostrarUsuarioEnSesion() {
    const usuarioGuardado = localStorage.getItem(
        "hades_usuario_activo"
    );

    if (!usuarioGuardado) {
        return;
    }

    try {
        const usuarioActual = JSON.parse(usuarioGuardado);

        if (nombreUsuarioSesion) {
            nombreUsuarioSesion.textContent = usuarioActual.nombre;
        }
    } catch (error) {
        console.error("No se pudo mostrar el usuario en sesión:", error);
    }
}

mostrarUsuarioEnSesion();

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

    function obtenerUsuarioActivoDesdeSesion() {
    const usuarioGuardado = localStorage.getItem("hades_usuario_activo");

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
        usuarioActual = obtenerUsuarioActivoDesdeSesion();

        if (!usuarioActual) {
            mostrarMensajeBackup(
                "No se encontró una sesión activa. Volvé a iniciar sesión."
            );

            setTimeout(() => {
                window.location.href = "bienvenida.html";
            }, 1200);

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
            mostrarMensajeBackup(
                "Ingresá un nombre válido para el respaldo."
            );
            return;
        }

        if (ubicacion.length < 3) {
            mostrarMensajeBackup(
                "Ingresá una ubicación válida para el respaldo."
            );
            return;
        }

        if (!ultimo) {
            mostrarMensajeBackup(
                "Seleccioná la fecha del último backup realizado."
            );
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
            const botonRealizado = event.target.closest(
                ".btnBackupRealizado"
            );

            const botonEliminar = event.target.closest(
                ".btnEliminarBackup"
            );

            if (botonRealizado) {
                const idRecordatorio = Number(
                    botonRealizado.dataset.id
                );

                if (!window.hadesAPI?.marcarBackupRealizado) {
                    mostrarMensajeBackup(
                        "La función para marcar backup realizado no está disponible."
                    );

                    console.error(
                        "No existe window.hadesAPI.marcarBackupRealizado"
                    );

                    return;
                }

                try {
                    await window.hadesAPI.marcarBackupRealizado(
                        idRecordatorio
                    );

                    await cargarBackups();
                } catch (error) {
                    mostrarMensajeBackup(
                        "No se pudo actualizar el recordatorio."
                    );

                    console.error(
                        "Error al marcar backup como realizado:",
                        error
                    );
                }

                return;
            }

            if (botonEliminar) {
                const idRecordatorio = Number(
                    botonEliminar.dataset.id
                );

                const confirmar = confirm(
                    "¿Querés eliminar este recordatorio?"
                );

                if (!confirmar) {
                    return;
                }

                try {
                    await window.hadesAPI.eliminarRecordatorioBackup(
                        idRecordatorio
                    );

                    await cargarBackups();
                } catch (error) {
                    mostrarMensajeBackup(
                        "No se pudo eliminar el recordatorio."
                    );

                    console.error(
                        "Error al eliminar recordatorio:",
                        error
                    );
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

            function traducirDatoExpuesto(dato) {
        const traducciones = {
            "Email addresses": "Direcciones de correo",
            "Passwords": "Contraseñas",
            "Usernames": "Nombres de usuario",
            "Phone numbers": "Números de teléfono",
            "Names": "Nombres completos",
            "Dates of birth": "Fechas de nacimiento",
            "Physical addresses": "Direcciones físicas",
            "Geographic locations": "Ubicaciones geográficas",
            "IP addresses": "Direcciones IP",
            "Security questions and answers":
                "Preguntas y respuestas de seguridad",
            "Social media profiles": "Perfiles de redes sociales",
            "Website activity": "Actividad en sitios web",
            "Job titles": "Puestos laborales",
            "Employers": "Empleadores",
            "Genders": "Géneros",
            "Payment histories": "Historiales de pago",
            "Credit cards": "Tarjetas de crédito",
            "Bank account numbers": "Números de cuentas bancarias",
            "Account balances": "Saldos de cuentas",
            "Partial credit card data":
                "Datos parciales de tarjetas de crédito",
            "Purchases": "Compras",
            "Device information": "Información de dispositivos",
            "Browser user agent details":
                "Información del navegador",
            "Authentication tokens":
                "Tokens de autenticación",
            "Password hints": "Pistas de contraseñas",
            "Recovery email addresses":
                "Correos electrónicos de recuperación",
            "Email messages": "Mensajes de correo",
            "Private messages": "Mensajes privados",
            "Photos": "Fotografías",
            "Biometric data": "Datos biométricos"
        };

        return traducciones[dato] || dato;
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

            if (
                    Array.isArray(brecha.datosExpuestos) &&
                    brecha.datosExpuestos.length > 0
                ) {
                    const datosTraducidos = brecha.datosExpuestos.map(
                        traducirDatoExpuesto
                    );

                    datos.textContent =
                        `Datos expuestos: ${datosTraducidos.join(", ")}`;
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
    
    try {
        iniciarModuloGestorPasswords();
        console.log("Módulo de gestor de contraseñas iniciado.");
    } catch (error) {
        console.error(
            "Error al iniciar el módulo de gestor de contraseñas:",
            error
        );
    }
    
    try {
        iniciarModuloScanner();
        console.log("Módulo de escáner VirusTotal iniciado.");
    } catch (error) {
        console.error(
            "Error al iniciar el módulo de escáner VirusTotal:",
            error
        );
    }
}

//#######################Funciones relacionadas con el Gestor de Contraseñas#################################
const formGestorPasswords = document.getElementById("formGestorPasswords");
const sitioPassword = document.getElementById("sitioPassword");
const valorPassword = document.getElementById("valorPassword");
const btnVerValorPassword = document.getElementById("btnVerValorPassword");
const iconoVerValorPassword = document.getElementById("iconoVerValorPassword");
const mensajeGestorPassword = document.getElementById("mensajeGestorPassword");
const listaGestorPasswords = document.getElementById("listaGestorPasswords");
const cantidadGestorPasswords = document.getElementById("cantidadGestorPasswords");

const btnSubmitGestorPassword = document.getElementById("btnSubmitGestorPassword");
const textoSubmitGestorPassword = document.getElementById("textoSubmitGestorPassword");
const iconoSubmitGestorPassword = document.getElementById("iconoSubmitGestorPassword");
const btnCancelarEdicionPassword = document.getElementById("btnCancelarEdicionPassword");

let passwordEnEdicionId = null;

function mostrarMensajeGestorPassword(mensaje) {
    if (!mensajeGestorPassword) return;
    mensajeGestorPassword.textContent = mensaje;
    mensajeGestorPassword.classList.remove("hidden");
}

function ocultarMensajeGestorPassword() {
    if (!mensajeGestorPassword) return;
    mensajeGestorPassword.textContent = "";
    mensajeGestorPassword.classList.add("hidden");
}

function obtenerPasswordsGuardadas() {
    const usuarioActual = obtenerUsuarioActivoDesdeSesion();
    const idUsuario = usuarioActual ? usuarioActual.id_usuario : "default";
    const clave = `hades_passwords_${idUsuario}`;
    const data = localStorage.getItem(clave);
    return data ? JSON.parse(data) : [];
}

function guardarPasswordLocal(sitio, password) {
    const usuarioActual = obtenerUsuarioActivoDesdeSesion();
    const idUsuario = usuarioActual ? usuarioActual.id_usuario : "default";
    const clave = `hades_passwords_${idUsuario}`;
    const passwords = obtenerPasswordsGuardadas();
    
    passwords.push({
        id: Date.now(),
        sitio: sitio,
        valor: password,
        fecha: new Date().toISOString()
    });
    
    localStorage.setItem(clave, JSON.stringify(passwords));
}

function actualizarPasswordLocal(id, sitio, password) {
    const usuarioActual = obtenerUsuarioActivoDesdeSesion();
    const idUsuario = usuarioActual ? usuarioActual.id_usuario : "default";
    const clave = `hades_passwords_${idUsuario}`;
    let passwords = obtenerPasswordsGuardadas();
    
    const index = passwords.findIndex(p => p.id === id);
    if(index !== -1) {
        passwords[index].sitio = sitio;
        passwords[index].valor = password;
        localStorage.setItem(clave, JSON.stringify(passwords));
    }
}

function eliminarPasswordLocal(id) {
    const usuarioActual = obtenerUsuarioActivoDesdeSesion();
    const idUsuario = usuarioActual ? usuarioActual.id_usuario : "default";
    const clave = `hades_passwords_${idUsuario}`;
    let passwords = obtenerPasswordsGuardadas();
    
    passwords = passwords.filter(p => p.id !== id);
    localStorage.setItem(clave, JSON.stringify(passwords));
}

function restablecerFormularioPassword() {
    formGestorPasswords.reset();
    valorPassword.type = "password";
    if(iconoVerValorPassword) iconoVerValorPassword.textContent = "visibility";
    
    passwordEnEdicionId = null;
    
    if(textoSubmitGestorPassword) textoSubmitGestorPassword.textContent = "Guardar contraseña";
    if(iconoSubmitGestorPassword) iconoSubmitGestorPassword.textContent = "save";
    if(btnCancelarEdicionPassword) btnCancelarEdicionPassword.classList.add("hidden");
}

function renderizarGestorPasswords() {
    if (!listaGestorPasswords || !cantidadGestorPasswords) return;
    
    const passwords = obtenerPasswordsGuardadas();
    cantidadGestorPasswords.textContent = `${passwords.length} guardadas`;
    
    if (passwords.length === 0) {
        listaGestorPasswords.innerHTML = `
            <div class="bg-[#e2effd] dark:bg-[#1a3162] border-2 border-dashed border-[#a4c9f7] dark:border-blue-700/50 rounded-2xl flex flex-col items-center justify-center p-8 w-full md:col-span-2">
                <div class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center text-primary dark:text-blue-300">
                    <span class="material-symbols-outlined text-3xl">
                        key_off
                    </span>
                </div>
                <p class="mt-4 font-label-md font-medium text-slate-700 dark:text-slate-300 text-center">
                    Todavía no hay contraseñas guardadas.
                </p>
            </div>
        `;
        return;
    }
    
    listaGestorPasswords.innerHTML = "";
    
    passwords.forEach((item) => {
        const div = document.createElement("div");
        div.className = "bg-white dark:bg-[#1a3162] p-6 rounded-2xl shadow-sm border border-[#a4c9f7] dark:border-blue-700/50 flex flex-col justify-between";
        div.innerHTML = `
            <div>
                <div class="flex justify-between items-start mb-4">
                    <div class="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg text-primary dark:text-blue-300">
                        <span class="material-symbols-outlined">
                            public
                        </span>
                    </div>
                </div>

                <h4 class="font-bold text-slate-900 dark:text-white mb-1 truncate" title="${item.sitio}">
                    ${item.sitio}
                </h4>

                <div class="flex items-center gap-2 mb-4 bg-slate-50 dark:bg-[#18284f] p-2 rounded-lg border border-slate-200 dark:border-blue-800/50">
                    <input type="password" readonly value="${item.valor}" class="bg-transparent border-none focus:ring-0 text-slate-600 dark:text-slate-300 w-full text-sm font-mono" />
                    <button type="button" class="btnToggleVisibility text-slate-500 hover:text-primary dark:text-slate-400 transition-colors">
                        <span class="material-symbols-outlined text-sm">visibility</span>
                    </button>
                </div>
            </div>

            <div class="flex justify-end gap-3 mt-2">
                <button
                    type="button"
                    class="btnEditarPassword text-xs text-secondary font-bold flex items-center gap-1 hover:underline"
                    data-id="${item.id}">
                    <span class="material-symbols-outlined text-sm">
                        edit
                    </span>
                    Editar
                </button>
                <button
                    type="button"
                    class="btnEliminarPassword text-xs text-error font-bold flex items-center gap-1 hover:underline"
                    data-id="${item.id}">
                    <span class="material-symbols-outlined text-sm">
                        delete
                    </span>
                    Eliminar
                </button>
            </div>
        `;
        listaGestorPasswords.appendChild(div);
    });
}

function iniciarModuloGestorPasswords() {
    if (!formGestorPasswords) return;
    
    renderizarGestorPasswords();

    if (btnVerValorPassword && iconoVerValorPassword) {
        btnVerValorPassword.addEventListener("click", () => {
            const esPassword = valorPassword.type === "password";
            valorPassword.type = esPassword ? "text" : "password";
            iconoVerValorPassword.textContent = esPassword ? "visibility_off" : "visibility";
        });
    }
    
    if (btnCancelarEdicionPassword) {
        btnCancelarEdicionPassword.addEventListener("click", () => {
            restablecerFormularioPassword();
            ocultarMensajeGestorPassword();
        });
    }

    formGestorPasswords.addEventListener("submit", (event) => {
        event.preventDefault();
        ocultarMensajeGestorPassword();

        const sitio = sitioPassword.value.trim();
        const valor = valorPassword.value.trim();

        if (sitio.length === 0 || valor.length === 0) {
            mostrarMensajeGestorPassword("Por favor, completa ambos campos.");
            return;
        }

        if (passwordEnEdicionId) {
            actualizarPasswordLocal(passwordEnEdicionId, sitio, valor);
        } else {
            guardarPasswordLocal(sitio, valor);
        }
        
        restablecerFormularioPassword();
        renderizarGestorPasswords();
    });

    if (listaGestorPasswords) {
        listaGestorPasswords.addEventListener("click", (event) => {
            const btnEliminar = event.target.closest(".btnEliminarPassword");
            const btnEditar = event.target.closest(".btnEditarPassword");
            const btnToggle = event.target.closest(".btnToggleVisibility");

            if (btnEliminar) {
                const id = Number(btnEliminar.dataset.id);
                if (confirm("¿Seguro que quieres eliminar esta contraseña?")) {
                    eliminarPasswordLocal(id);
                    if (passwordEnEdicionId === id) {
                        restablecerFormularioPassword();
                    }
                    renderizarGestorPasswords();
                }
            } else if (btnEditar) {
                const id = Number(btnEditar.dataset.id);
                const passwords = obtenerPasswordsGuardadas();
                const pass = passwords.find(p => p.id === id);
                if (pass) {
                    sitioPassword.value = pass.sitio;
                    valorPassword.value = pass.valor;
                    valorPassword.type = "text";
                    if(iconoVerValorPassword) iconoVerValorPassword.textContent = "visibility_off";
                    
                    passwordEnEdicionId = id;
                    
                    if(textoSubmitGestorPassword) textoSubmitGestorPassword.textContent = "Actualizar contraseña";
                    if(iconoSubmitGestorPassword) iconoSubmitGestorPassword.textContent = "update";
                    if(btnCancelarEdicionPassword) btnCancelarEdicionPassword.classList.remove("hidden");
                    
                    // Hacer scroll al formulario para dispositivos móviles
                    formGestorPasswords.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else if (btnToggle) {
                const input = btnToggle.previousElementSibling;
                const icono = btnToggle.querySelector(".material-symbols-outlined");
                if (input && input.tagName === "INPUT") {
                    const esPassword = input.type === "password";
                    input.type = esPassword ? "text" : "password";
                    icono.textContent = esPassword ? "visibility_off" : "visibility";
                }
            }
        });
    }
}
//#######################Fin de Gestor de Contraseñas#################################

//#######################Funciones relacionadas con el Escáner VirusTotal#################################
const formVirusTotal = document.getElementById("formVirusTotal");
const inputApiKeyVT = document.getElementById("inputApiKeyVT");
const btnTabArchivo = document.getElementById("btnTabArchivo");
const btnTabUrl = document.getElementById("btnTabUrl");
const containerArchivo = document.getElementById("containerArchivo");
const containerUrl = document.getElementById("containerUrl");
const btnSeleccionarArchivoVT = document.getElementById("btnSeleccionarArchivoVT");
const textoArchivoSeleccionadoVT = document.getElementById("textoArchivoSeleccionadoVT");
const inputUrlVT = document.getElementById("inputUrlVT");
const btnSubmitVT = document.getElementById("btnSubmitVT");
const iconoSubmitVT = document.getElementById("iconoSubmitVT");
const textoSubmitVT = document.getElementById("textoSubmitVT");
const mensajeErrorVT = document.getElementById("mensajeErrorVT");

const vtEstadoInicial = document.getElementById("vtEstadoInicial");
const vtAnalizando = document.getElementById("vtAnalizando");
const vtResultado = document.getElementById("vtResultado");
const vtStatMalicious = document.getElementById("vtStatMalicious");
const vtStatSuspicious = document.getElementById("vtStatSuspicious");
const vtStatUndetected = document.getElementById("vtStatUndetected");
const vtVeredictoContainer = document.getElementById("vtVeredictoContainer");

let modoEscanerActivo = "archivo"; // 'archivo' | 'url'
let rutaArchivoSeleccionado = null;

function mostrarErrorVT(mensaje) {
    if (!mensajeErrorVT) return;
    mensajeErrorVT.textContent = mensaje;
    mensajeErrorVT.classList.remove("hidden");
}

function ocultarErrorVT() {
    if (!mensajeErrorVT) return;
    mensajeErrorVT.textContent = "";
    mensajeErrorVT.classList.add("hidden");
}

function setEstadoVT(estado) {
    if(vtEstadoInicial) vtEstadoInicial.classList.add("hidden");
    if(vtAnalizando) vtAnalizando.classList.add("hidden");
    if(vtResultado) vtResultado.classList.add("hidden");

    if (estado === "inicial" && vtEstadoInicial) {
        vtEstadoInicial.classList.remove("hidden");
    } else if (estado === "analizando" && vtAnalizando) {
        vtAnalizando.classList.remove("hidden");
    } else if (estado === "resultado" && vtResultado) {
        vtResultado.classList.remove("hidden");
    }
}

function mostrarResultadosVT(stats) {
    if (!stats) return;
    
    const malicious = stats.malicious || 0;
    const suspicious = stats.suspicious || 0;
    const undetected = stats.undetected || 0;
    const harmless = stats.harmless || 0;
    const limpios = undetected + harmless;

    if(vtStatMalicious) vtStatMalicious.textContent = malicious;
    if(vtStatSuspicious) vtStatSuspicious.textContent = suspicious;
    if(vtStatUndetected) vtStatUndetected.textContent = limpios;

    if (vtVeredictoContainer) {
        vtVeredictoContainer.className = "p-4 rounded-xl text-center font-bold text-lg ";
        if (malicious > 0) {
            vtVeredictoContainer.classList.add("bg-red-100", "text-red-700", "dark:bg-red-900/40", "dark:text-red-400");
            vtVeredictoContainer.textContent = "PELIGROSO: Se detectaron amenazas.";
        } else if (suspicious > 0) {
            vtVeredictoContainer.classList.add("bg-amber-100", "text-amber-700", "dark:bg-amber-900/40", "dark:text-amber-400");
            vtVeredictoContainer.textContent = "SOSPECHOSO: Revisar con precaución.";
        } else {
            vtVeredictoContainer.classList.add("bg-emerald-100", "text-emerald-700", "dark:bg-emerald-900/40", "dark:text-emerald-400");
            vtVeredictoContainer.textContent = "SEGURO: No se detectaron amenazas.";
        }
    }

    setEstadoVT("resultado");
}

function iniciarModuloScanner() {
    if (!formVirusTotal) return;

    if (inputApiKeyVT) {
        const savedApiKey = localStorage.getItem("hades_vt_apikey");
        if (savedApiKey) {
            inputApiKeyVT.value = savedApiKey;
        }
    }

    if (btnTabArchivo && btnTabUrl) {
        btnTabArchivo.addEventListener("click", () => {
            modoEscanerActivo = "archivo";
            btnTabArchivo.className = "px-4 py-1 rounded text-sm font-bold bg-white dark:bg-blue-600 shadow-sm transition-all text-primary dark:text-white";
            btnTabUrl.className = "px-4 py-1 rounded text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-all";
            containerArchivo.classList.remove("hidden");
            containerUrl.classList.add("hidden");
            inputUrlVT.required = false;
            ocultarErrorVT();
        });

        btnTabUrl.addEventListener("click", () => {
            modoEscanerActivo = "url";
            btnTabUrl.className = "px-4 py-1 rounded text-sm font-bold bg-white dark:bg-blue-600 shadow-sm transition-all text-primary dark:text-white";
            btnTabArchivo.className = "px-4 py-1 rounded text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-all";
            containerUrl.classList.remove("hidden");
            containerArchivo.classList.add("hidden");
            inputUrlVT.required = true;
            ocultarErrorVT();
        });
    }

    if (btnSeleccionarArchivoVT) {
        btnSeleccionarArchivoVT.addEventListener("click", async () => {
            ocultarErrorVT();
            try {
                const ruta = await window.hadesAPI.seleccionarArchivo();
                if (ruta) {
                    rutaArchivoSeleccionado = ruta;
                    textoArchivoSeleccionadoVT.textContent = ruta;
                    textoArchivoSeleccionadoVT.classList.remove("hidden");
                }
            } catch (error) {
                mostrarErrorVT("Error al abrir el explorador de archivos.");
            }
        });
    }

    formVirusTotal.addEventListener("submit", async (e) => {
        e.preventDefault();
        ocultarErrorVT();
        
        const apiKey = inputApiKeyVT ? inputApiKeyVT.value.trim() : "";
        if (!apiKey) {
            mostrarErrorVT("Por favor ingresá tu API Key de VirusTotal.");
            return;
        }
        
        // Guardar la API Key para futuras sesiones
        localStorage.setItem("hades_vt_apikey", apiKey);

        if (modoEscanerActivo === "archivo") {
            if (!rutaArchivoSeleccionado) {
                mostrarErrorVT("Por favor seleccioná un archivo.");
                return;
            }

            try {
                btnSubmitVT.disabled = true;
                textoSubmitVT.textContent = "Subiendo...";
                iconoSubmitVT.classList.add("animate-spin");
                iconoSubmitVT.textContent = "refresh";
                setEstadoVT("analizando");

                const stats = await window.hadesAPI.escanearArchivoVirusTotal(rutaArchivoSeleccionado, apiKey);
                mostrarResultadosVT(stats);
            } catch (error) {
                mostrarErrorVT(error.message || "Ocurrió un error inesperado al analizar el archivo.");
                setEstadoVT("inicial");
            } finally {
                btnSubmitVT.disabled = false;
                textoSubmitVT.textContent = "Analizar";
                iconoSubmitVT.classList.remove("animate-spin");
                iconoSubmitVT.textContent = "search";
            }
        } else {
            const urlValue = inputUrlVT.value.trim();
            if (!urlValue) {
                mostrarErrorVT("Por favor ingresá una URL válida.");
                return;
            }

            try {
                btnSubmitVT.disabled = true;
                textoSubmitVT.textContent = "Analizando...";
                iconoSubmitVT.classList.add("animate-spin");
                iconoSubmitVT.textContent = "refresh";
                setEstadoVT("analizando");

                const stats = await window.hadesAPI.escanearUrlVirusTotal(urlValue, apiKey);
                mostrarResultadosVT(stats);
            } catch (error) {
                mostrarErrorVT(error.message || "Ocurrió un error inesperado al analizar la URL.");
                setEstadoVT("inicial");
            } finally {
                btnSubmitVT.disabled = false;
                textoSubmitVT.textContent = "Analizar";
                iconoSubmitVT.classList.remove("animate-spin");
                iconoSubmitVT.textContent = "search";
            }
        }
    });
}
//#######################Fin de Escáner VirusTotal#################################

iniciarModulosDiagnostico();
});