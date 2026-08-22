document.addEventListener("DOMContentLoaded", () => {
    //#########Elementos del Simulador de Phishing############
    const phishingRemitente = document.getElementById("phishingRemitente");
    const phishingAsunto = document.getElementById("phishingAsunto");
    const phishingSaludo = document.getElementById("phishingSaludo");
    const phishingMensajePrincipal = document.getElementById(
        "phishingMensajePrincipal"
    );
    const phishingBotonAccion = document.getElementById(
        "phishingBotonAccion"
    );
    const phishingEnlace = document.getElementById("phishingEnlace");
    const phishingMensajeFinal = document.getElementById(
        "phishingMensajeFinal"
    );
    const phishingAdjunto = document.getElementById("phishingAdjunto");
    const phishingNombreAdjunto = document.getElementById(
        "phishingNombreAdjunto"
    );

    const listaSenalesPhishing = document.getElementById(
        "listaSenalesPhishing"
    );
    const btnEvaluarPhishing = document.getElementById(
        "btnEvaluarPhishing"
    );
    const btnNuevoCasoPhishing = document.getElementById(
        "btnNuevoCasoPhishing"
    );
    const mensajePhishing = document.getElementById("mensajePhishing");
    const resultadoPhishing = document.getElementById("resultadoPhishing");
    const tituloResultadoPhishing = document.getElementById(
        "tituloResultadoPhishing"
    );
    const puntajeResultadoPhishing = document.getElementById(
        "puntajeResultadoPhishing"
    );
    const detalleResultadoPhishing = document.getElementById(
        "detalleResultadoPhishing"
    );

    const contadorCasoPhishing = document.getElementById(
    "contadorCasoPhishing"
    );
    const puntajeSesionPhishing = document.getElementById(
        "puntajeSesionPhishing"
    );
    const aciertosSesionPhishing = document.getElementById(
        "aciertosSesionPhishing"
    );

    const senalesDisponibles = [
        {
            id: "dominio_falso",
            texto: "El dominio del remitente imita a una entidad conocida."
        },
        {
            id: "urgencia",
            texto: "El mensaje intenta generar urgencia o miedo."
        },
        {
            id: "enlace_sospechoso",
            texto: "El enlace está acortado o dirige a un sitio extraño."
        },
        {
            id: "amenaza",
            texto: "El mensaje amenaza con bloquear o eliminar la cuenta."
        },
        {
            id: "adjunto_sospechoso",
            texto: "El correo incluye un archivo adjunto sospechoso."
        },
        {
            id: "premio_inesperado",
            texto: "El correo promete un premio o beneficio inesperado."
        },
        {
            id: "solicita_datos",
            texto: "Solicita datos personales, contraseña o información sensible."
        },
        {
            id: "errores_redaccion",
            texto: "Presenta errores de redacción, formato o estilo inusual."
        }
    ];

    const escenariosPhishing = [
        {
            id: 1,
            tipo: "phishing",
            dificultad: "Básico",
            remitente:
                "Soporte de Seguridad <support-security-check@paypa1-update.com>",
            asunto:
                "Acción requerida: tu cuenta ha sido suspendida temporalmente",
            saludo: "Estimado cliente,",
            mensajePrincipal:
                "Hemos detectado una actividad inusual en su cuenta desde una ubicación no reconocida. Por su seguridad, su acceso ha sido limitado.",
            textoBoton: "Verificar mi identidad ahora",
            enlace: "http://bit.ly/secure-login-293847",
            mensajeFinal:
                "Si no realiza esta acción en las próximas 24 horas, su cuenta será eliminada permanentemente.",
            adjunto: null,
            senalesPresentes: [
                "dominio_falso",
                "urgencia",
                "enlace_sospechoso",
                "amenaza"
            ],
            decisionCorrecta: "phishing",
            explicaciones: {
                dominio_falso:
                    "El dominio paypa1-update.com intenta imitar a PayPal usando un número 1 en lugar de una letra.",
                urgencia:
                    "El mensaje presiona al usuario para actuar rápido sin verificar.",
                enlace_sospechoso:
                    "El enlace bit.ly oculta el destino real.",
                amenaza:
                    "Amenazar con eliminar la cuenta busca generar miedo."
            }
        },
        {
            id: 2,
            tipo: "phishing",
            dificultad: "Intermedio",
            remitente:
                "Microsoft Security <no-reply@microsoft-security-login.com>",
            asunto: "Restablecimiento obligatorio de contraseña",
            saludo: "Hola,",
            mensajePrincipal:
                "Por una actualización de seguridad, todos los usuarios deben restablecer su contraseña antes de finalizar el día.",
            textoBoton: "Restablecer contraseña",
            enlace: "https://microsoft-security-login.com/reset",
            mensajeFinal:
                "No responder a esta solicitud puede bloquear temporalmente el acceso a su cuenta.",
            adjunto: null,
            senalesPresentes: [
                "dominio_falso",
                "urgencia",
                "solicita_datos"
            ],
            decisionCorrecta: "phishing",
            explicaciones: {
                dominio_falso:
                    "El dominio no es el oficial de Microsoft. Usa una apariencia similar para engañar.",
                urgencia:
                    "Presiona con un plazo corto para que el usuario actúe sin pensar.",
                solicita_datos:
                    "El objetivo es llevar al usuario a ingresar su contraseña en un sitio falso."
            }
        },
        {
            id: 3,
            tipo: "phishing",
            dificultad: "Básico",
            remitente:
                "Premios Online <ganador@promos-regalos-web.net>",
            asunto: "¡Ganaste un teléfono de última generación!",
            saludo: "¡Felicitaciones!",
            mensajePrincipal:
                "Tu correo fue seleccionado para recibir un teléfono gratuito. Para reclamarlo, completá tus datos personales.",
            textoBoton: "Reclamar premio",
            enlace: "http://promos-regalos-web.net/reclamo",
            mensajeFinal:
                "La promoción vence en 2 horas. Si no completás el formulario, perderás el beneficio.",
            adjunto: null,
            senalesPresentes: [
                "premio_inesperado",
                "urgencia",
                "solicita_datos",
                "enlace_sospechoso"
            ],
            decisionCorrecta: "phishing",
            explicaciones: {
                premio_inesperado:
                    "Los premios no solicitados suelen usarse para atraer a la víctima.",
                urgencia:
                    "El plazo corto busca que el usuario actúe impulsivamente.",
                solicita_datos:
                    "Solicitar datos personales para un premio inesperado es una señal de alerta.",
                enlace_sospechoso:
                    "El dominio no pertenece a una empresa reconocida."
            }
        },
        {
            id: 4,
            tipo: "phishing",
            dificultad: "Intermedio",
            remitente: "Área de Facturación <facturacion@servicios-pagos.net>",
            asunto: "Factura pendiente de pago",
            saludo: "Estimado usuario,",
            mensajePrincipal:
                "Adjuntamos una factura pendiente correspondiente al último período. Revise el archivo y regularice la situación.",
            textoBoton: "Ver instrucciones",
            enlace: "http://servicios-pagos.net/consulta",
            mensajeFinal:
                "La falta de pago puede generar intereses adicionales.",
            adjunto: "Factura_Pendiente_2026.zip",
            senalesPresentes: [
                "adjunto_sospechoso",
                "enlace_sospechoso",
                "urgencia"
            ],
            decisionCorrecta: "phishing",
            explicaciones: {
                adjunto_sospechoso:
                    "Un archivo comprimido .zip puede ocultar contenido malicioso.",
                enlace_sospechoso:
                    "El enlace dirige a un dominio genérico no verificable.",
                urgencia:
                    "El mensaje presiona con consecuencias económicas."
            }
        },
        {
            id: 5,
            tipo: "legitimo",
            dificultad: "Intermedio",
            remitente: "GitHub <noreply@github.com>",
            asunto: "Se agregó una nueva clave SSH a tu cuenta",
            saludo: "Hola,",
            mensajePrincipal:
                "Se agregó una nueva clave SSH a tu cuenta de GitHub. Si fuiste vos, no necesitás hacer nada.",
            textoBoton: "Revisar actividad",
            enlace: "https://github.com/settings/keys",
            mensajeFinal:
                "Si no reconocés esta actividad, ingresá manualmente a github.com y revisá la seguridad de tu cuenta.",
            adjunto: null,
            senalesPresentes: [],
            decisionCorrecta: "legitimo",
            explicaciones: {
                legitimo:
                    "El dominio pertenece a GitHub, no solicita contraseña y recomienda revisar la actividad desde el sitio oficial."
            }
        },
        {
            id: 6,
            tipo: "legitimo",
            dificultad: "Avanzado",
            remitente: "Google <no-reply@accounts.google.com>",
            asunto: "Nuevo inicio de sesión en tu cuenta",
            saludo: "Hola,",
            mensajePrincipal:
                "Detectamos un nuevo inicio de sesión en tu cuenta desde un dispositivo Windows.",
            textoBoton: "Revisar actividad de seguridad",
            enlace: "https://myaccount.google.com/security",
            mensajeFinal:
                "Si reconocés esta actividad, no tenés que hacer nada. Si no fuiste vos, revisá tu cuenta desde la configuración oficial.",
            adjunto: null,
            senalesPresentes: [],
            decisionCorrecta: "legitimo",
            explicaciones: {
                legitimo:
                    "El dominio es oficial, no solicita credenciales por correo y dirige a una página legítima de configuración."
            }
        }
    ];
    //#########FIN Elementos del Simulador de Phishing############

    //#########Elementos de la Academia de Defensa Digital############
    const btnVerTodosAcademia = document.getElementById("btnVerTodosAcademia");
    const btnCursoCiberHigiene = document.getElementById("btnCursoCiberHigiene");
    const btnMitosRealidades = document.getElementById("btnMitosRealidades");
    const btnAnatomiaAtaque = document.getElementById("btnAnatomiaAtaque");
    const btnTestNivel = document.getElementById("btnTestNivel");

    const panelAcademia = document.getElementById("panelAcademia");
    const categoriaAcademia = document.getElementById("categoriaAcademia");
    const tituloAcademia = document.getElementById("tituloAcademia");
    const descripcionAcademia = document.getElementById("descripcionAcademia");
    const contenidoAcademia = document.getElementById("contenidoAcademia");
    const recomendacionesAcademia = document.getElementById(
        "recomendacionesAcademia"
    );
    const btnCerrarAcademia = document.getElementById("btnCerrarAcademia");

    //#########Elementos modal Academia############
    const modalConceptoAcademia = document.getElementById(
    "modalConceptoAcademia"
    );
    const imagenConceptoAcademia = document.getElementById(
        "imagenConceptoAcademia"
    );
    const categoriaConceptoAcademia = document.getElementById(
        "categoriaConceptoAcademia"
    );
    const tituloConceptoAcademia = document.getElementById(
        "tituloConceptoAcademia"
    );
    const descripcionConceptoAcademia = document.getElementById(
        "descripcionConceptoAcademia"
    );
    const recomendacionConceptoAcademia = document.getElementById(
        "recomendacionConceptoAcademia"
    );
    const btnCerrarModalConcepto = document.getElementById(
        "btnCerrarModalConcepto"
    );
    //######### FIN Elementos del modal Academia ############

    //========== VARIABLES GLOBALES =====================
    let escenarioActual = null;
    let ultimoEscenarioId = null;

    let usuarioActual = null;
    let triviaEvaluada = false;

    let casoEvaluado = false;

    let presentacionActual = null;
    let diapositivaActual = 1;
    //===================================================

    const nombreUsuarioSesion = document.getElementById(
    "nombreUsuarioSesion"
);

//======================================================

//======================================================
const presentaciones = [
    {
        titulo: "Robo de Identidad Digital",
        carpeta: "robo_identidad",
        total: 10
    },
    {
        titulo: "Inteligencia Artificial",
        carpeta: "inteligencia_artificial",
        total: 10
    },
    {
        titulo: "Tips de Seguridad Digital",
        carpeta: "tips_ciber",
        total: 11
    },
    {
        titulo: "Ransomware",
        carpeta: "ransomware",
        total: 10
    }
];
//======================================================

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
//======================================================================

    // Función para obtener el usuario activo desde la sesión
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
//======================================================================

    //============= VARIABLES INICIALIZADOS =============
    const totalCasosSesion = 5;
    let casoActualSesion = 1;
    let puntajeAcumuladoSesion = 0;
    let aciertosAcumuladosSesion = 0;
    let evaluacionesRealizadasSesion = 0;

    function mostrarMensaje(mensaje) {
        if (!mensajePhishing) {
            return;
        }

        mensajePhishing.textContent = mensaje;
        mensajePhishing.classList.remove("hidden");
    }

    function ocultarMensaje() {
        if (!mensajePhishing) {
            return;
        }

        mensajePhishing.textContent = "";
        mensajePhishing.classList.add("hidden");
    }

    function obtenerEscenarioAleatorio() {
        const escenariosDisponibles = escenariosPhishing.filter(
            (escenario) => escenario.id !== ultimoEscenarioId
        );

        const indice = Math.floor(
            Math.random() * escenariosDisponibles.length
        );

        return escenariosDisponibles[indice];
    }

    function renderizarSenales() {
        if (!listaSenalesPhishing) {
            return;
        }

        listaSenalesPhishing.innerHTML = "";

        senalesDisponibles.forEach((senal) => {
            const label = document.createElement("label");

            label.className =
                "flex items-start gap-3 p-3 bg-white dark:bg-[#0f1b36] rounded-lg border border-gray-100 dark:border-blue-900/40 cursor-pointer hover:border-primary transition-colors text-slate-900 dark:text-white";

            label.innerHTML = `
                <input
                    class="senalPhishing mt-1 rounded text-primary focus:ring-primary h-5 w-5"
                    type="checkbox"
                    value="${senal.id}"
                />

                <span class="text-sm">
                    ${senal.texto}
                </span>
            `;

            listaSenalesPhishing.appendChild(label);
        });
    }

    function limpiarSeleccionUsuario() {
        document
            .querySelectorAll(".senalPhishing")
            .forEach((checkbox) => {
                checkbox.checked = false;
            });

        document
            .querySelectorAll('input[name="decisionPhishing"]')
            .forEach((radio) => {
                radio.checked = false;
            });
    }

    function ocultarResultado() {
        if (!resultadoPhishing || !detalleResultadoPhishing) {
            return;
        }

        resultadoPhishing.classList.add("hidden");
        detalleResultadoPhishing.innerHTML = "";
        puntajeResultadoPhishing.textContent = "";
    }

    function cargarEscenario(escenario) {
        escenarioActual = escenario;
        ultimoEscenarioId = escenario.id;

        casoEvaluado = false;

        phishingRemitente.textContent = escenario.remitente;
        phishingAsunto.textContent = escenario.asunto;
        phishingSaludo.textContent = escenario.saludo;
        phishingMensajePrincipal.textContent = escenario.mensajePrincipal;
        phishingBotonAccion.textContent = escenario.textoBoton;
        phishingEnlace.textContent = `Enlace: ${escenario.enlace}`;
        phishingMensajeFinal.textContent = escenario.mensajeFinal;

        if (escenario.adjunto) {
            phishingAdjunto.classList.remove("hidden");
            phishingNombreAdjunto.textContent = escenario.adjunto;
        } else {
            phishingAdjunto.classList.add("hidden");
            phishingNombreAdjunto.textContent = "";
        }

        renderizarSenales();
        limpiarSeleccionUsuario();
        ocultarResultado();
        ocultarMensaje();
    }

    function obtenerSenalesSeleccionadas() {
        return Array.from(
            document.querySelectorAll(".senalPhishing:checked")
        ).map((checkbox) => checkbox.value);
    }

    function obtenerDecisionSeleccionada() {
        const decision = document.querySelector(
            'input[name="decisionPhishing"]:checked'
        );

        return decision ? decision.value : null;
    }

    function calcularResultado() {
        const senalesSeleccionadas = obtenerSenalesSeleccionadas();
        const decisionSeleccionada = obtenerDecisionSeleccionada();

        if (!decisionSeleccionada) {
            mostrarMensaje("Seleccioná si el correo parece legítimo o sospechoso.");
            return null;
        }

        const senalesPresentes = escenarioActual.senalesPresentes;

        const aciertosSenales = senalesSeleccionadas.filter((senal) =>
            senalesPresentes.includes(senal)
        );

        const erroresSenales = senalesSeleccionadas.filter(
            (senal) => !senalesPresentes.includes(senal)
        );

        const senalesNoDetectadas = senalesPresentes.filter(
            (senal) => !senalesSeleccionadas.includes(senal)
        );

        let puntaje = 0;

        if (senalesPresentes.length > 0) {
            puntaje +=
                (aciertosSenales.length / senalesPresentes.length) * 70;
        } else {
            puntaje += senalesSeleccionadas.length === 0 ? 70 : 0;
        }

        if (decisionSeleccionada === escenarioActual.decisionCorrecta) {
            puntaje += 30;
        }

        puntaje -= erroresSenales.length * 10;
        puntaje = Math.max(0, Math.min(Math.round(puntaje), 100));

        return {
            puntaje,
            decisionSeleccionada,
            aciertosSenales,
            erroresSenales,
            senalesNoDetectadas
        };
    }

    function obtenerTextoSenal(idSenal) {
        const senal = senalesDisponibles.find(
            (item) => item.id === idSenal
        );

        return senal ? senal.texto : idSenal;
    }

    function obtenerNivelResultado(puntaje) {
        if (puntaje === 100) {
            return "Excelente detección";
        }

        if (puntaje >= 75) {
            return "Buen desempeño";
        }

        if (puntaje >= 50) {
            return "Nivel inicial";
        }

        return "Necesita práctica";
    }

        function mostrarResultado(resultado) {
        resultadoPhishing.classList.remove("hidden");

        const nivel = obtenerNivelResultado(resultado.puntaje);

        tituloResultadoPhishing.textContent = nivel;
        puntajeResultadoPhishing.textContent =
            `Puntuación obtenida: ${resultado.puntaje}%`;

        detalleResultadoPhishing.innerHTML = "";

        const decisionCorrecta =
            resultado.decisionSeleccionada === escenarioActual.decisionCorrecta;

        const decisionTexto = document.createElement("p");

        decisionTexto.innerHTML = decisionCorrecta
            ? "✓ Clasificaste correctamente el correo."
            : `✗ La clasificación correcta era: ${
                escenarioActual.decisionCorrecta === "phishing"
                    ? "sospechoso"
                    : "legítimo"
            }.`;

        detalleResultadoPhishing.appendChild(decisionTexto);

        if (resultado.aciertosSenales.length > 0) {
            const aciertos = document.createElement("div");

            aciertos.innerHTML = `
                <p class="font-bold text-secondary mt-3">
                    Señales detectadas correctamente:
                </p>
            `;

            resultado.aciertosSenales.forEach((senal) => {
                const item = document.createElement("p");

                item.textContent = `✓ ${obtenerTextoSenal(senal)}`;
                aciertos.appendChild(item);
            });

            detalleResultadoPhishing.appendChild(aciertos);
        }

        if (resultado.senalesNoDetectadas.length > 0) {
            const noDetectadas = document.createElement("div");

            noDetectadas.innerHTML = `
                <p class="font-bold text-error mt-3">
                    Señales que faltó identificar:
                </p>
            `;

            resultado.senalesNoDetectadas.forEach((senal) => {
                const item = document.createElement("p");

                item.textContent = `✗ ${obtenerTextoSenal(senal)}`;
                noDetectadas.appendChild(item);
            });

            detalleResultadoPhishing.appendChild(noDetectadas);
        }

        if (resultado.erroresSenales.length > 0) {
            const errores = document.createElement("div");

            errores.innerHTML = `
                <p class="font-bold text-error mt-3">
                    Señales marcadas incorrectamente:
                </p>
            `;

            resultado.erroresSenales.forEach((senal) => {
                const item = document.createElement("p");

                item.textContent = `✗ ${obtenerTextoSenal(senal)}`;
                errores.appendChild(item);
            });

            detalleResultadoPhishing.appendChild(errores);
        }

        const explicacion = document.createElement("div");

        explicacion.innerHTML = `
            <p class="font-bold text-primary mt-4">
                Explicación del caso:
            </p>
        `;

        if (escenarioActual.decisionCorrecta === "legitimo") {
            const item = document.createElement("p");

            item.textContent =
                escenarioActual.explicaciones.legitimo ||
                "Este correo no presenta señales claras de fraude.";

            explicacion.appendChild(item);
        } else {
            escenarioActual.senalesPresentes.forEach((senal) => {
                const item = document.createElement("p");

                item.textContent =
                    escenarioActual.explicaciones[senal] ||
                    obtenerTextoSenal(senal);

                explicacion.appendChild(item);
            });
        }

        detalleResultadoPhishing.appendChild(explicacion);

        guardarResultadoSimulacion(resultado);
    }

    async function guardarResultadoSimulacion(resultado) {
        if (!usuarioActual || !window.hadesAPI?.guardarResultadoPhishing) {
            console.warn(
                "No se pudo guardar el resultado porque no hay usuario o no está disponible la API."
            );
            return;
        }

        try {
            await window.hadesAPI.guardarResultadoPhishing({
                id_usuario: usuarioActual.id_usuario,
                id_escenario: escenarioActual.id,
                tipo_escenario: escenarioActual.tipo,
                dificultad: escenarioActual.dificultad,
                decision_usuario: resultado.decisionSeleccionada,
                decision_correcta: escenarioActual.decisionCorrecta,
                puntaje: resultado.puntaje,
                aciertos: resultado.aciertosSenales.length,
                errores:
                    resultado.erroresSenales.length +
                    resultado.senalesNoDetectadas.length
            });

            console.log("Resultado de phishing guardado correctamente.");
        } catch (error) {
            console.error(
                "No se pudo guardar el resultado de phishing:",
                error
            );
        }
    }

    function evaluarCasoActual() {
        ocultarMensaje();

        if (casoEvaluado) {
            mostrarMensaje(
                "Este caso ya fue evaluado. Presioná Nuevo caso para continuar."
            );
            return;
        }

        if (!escenarioActual) {
            mostrarMensaje("No hay un caso cargado para evaluar.");
            return;
        }

        const resultado = calcularResultado();

        if (!resultado) {
            return;
        }

        mostrarResultado(resultado);

        casoEvaluado = true;

        evaluacionesRealizadasSesion += 1;
        puntajeAcumuladoSesion += resultado.puntaje;
        aciertosAcumuladosSesion += resultado.aciertosSenales.length;

        actualizarResumenSesion();
    }

    function actualizarResumenSesion() {
        if (contadorCasoPhishing) {
            contadorCasoPhishing.textContent =
                `Caso ${casoActualSesion} de ${totalCasosSesion}`;
        }

        if (puntajeSesionPhishing) {
            puntajeSesionPhishing.textContent =
                `Puntaje acumulado: ${puntajeAcumuladoSesion}`;
        }

        if (aciertosSesionPhishing) {
            aciertosSesionPhishing.textContent =
                `Aciertos: ${aciertosAcumuladosSesion}`;
        }
    }

    async function iniciarSimuladorPhishing() {
    if (
        !phishingRemitente ||
        !phishingAsunto ||
        !listaSenalesPhishing ||
        !btnEvaluarPhishing ||
        !btnNuevoCasoPhishing
    ) {
        console.warn(
            "No se encontraron todos los elementos del simulador de phishing."
        );
        return;
    }

    usuarioActual = obtenerUsuarioActivoDesdeSesion();

    if (!usuarioActual) {
        mostrarMensaje(
            "No se encontró una sesión activa. Volvé a iniciar sesión."
        );

        setTimeout(() => {
            window.location.href = "bienvenida.html";
        }, 1200);

        return;
    }

    const escenarioInicial = obtenerEscenarioAleatorio();

    cargarEscenario(escenarioInicial);
    actualizarResumenSesion();

    btnEvaluarPhishing.addEventListener("click", evaluarCasoActual);

    btnNuevoCasoPhishing.addEventListener("click", () => {
        if (casoActualSesion < totalCasosSesion) {
            casoActualSesion += 1;
        } else {
            casoActualSesion = 1;
            puntajeAcumuladoSesion = 0;
            aciertosAcumuladosSesion = 0;
            evaluacionesRealizadasSesion = 0;
        }

        const nuevoEscenario = obtenerEscenarioAleatorio();

        cargarEscenario(nuevoEscenario);
        actualizarResumenSesion();
    });
}

//#########Elementos de la Academia de Defensa Digital############
    const contenidosAcademia = {
    ciberHigiene: {
        categoria: "Conceptos clave",
    titulo: "Fundamentos de la Ciber-Higiene",
    descripcion:
        "Explorá conceptos básicos de seguridad digital. Tocá una tarjeta para ver su explicación, una imagen de contexto y una recomendación práctica.",
    tipo: "tarjetasConceptos",
    contenido: [],
    recomendaciones: [
        "Empezá por los conceptos más cercanos a tu uso diario.",
        "Aplicá una recomendación por vez para no sobrecargarte.",
        "Volvé a revisar estos conceptos antes de realizar simulaciones."
    ]
    },

    mitos: {
    categoria: "Mitos vs. Realidades",
    titulo: "Mitos comunes sobre seguridad digital",
    descripcion:
        "Seleccioná una tarjeta para descubrir qué hay de cierto detrás de cada idea popular sobre seguridad digital.",
    tipo: "tarjetasMitos",
    contenido: [],
    recomendaciones: [
        "No tomes decisiones de seguridad basándote solo en creencias populares.",
        "Verificá siempre el contexto antes de confiar en un mensaje, enlace o archivo.",
        "Combiná herramientas de protección con hábitos seguros."
    ]
    },

    //############# SE DEBE CAMBIAR CUANDO ACTUALIZEMOS EL CONTENIDO DE LA ACADEMIA #############
    anatomiaAtaque: {
        categoria: "Infografía educativa",
        titulo: "Anatomía de un Ataque",
        descripcion:
            "Un ataque digital suele desarrollarse en varias etapas. Conocerlas ayuda a identificar señales tempranas.",
        contenido: [
            {
                subtitulo: "1. Reconocimiento",
                texto:
                    "El atacante obtiene información sobre la víctima, sus cuentas, intereses o servicios utilizados."
            },
            {
                subtitulo: "2. Engaño o acceso inicial",
                texto:
                    "Se utiliza un correo falso, un enlace, un archivo adjunto o una página fraudulenta para lograr que la víctima interactúe."
            },
            {
                subtitulo: "3. Robo de credenciales",
                texto:
                    "La víctima puede ingresar su usuario y contraseña en un sitio falso creyendo que es legítimo."
            },
            {
                subtitulo: "4. Uso indebido de la cuenta",
                texto:
                    "El atacante puede acceder a información personal, enviar mensajes o intentar entrar a otros servicios."
            },
            {
                subtitulo: "5. Impacto",
                texto:
                    "El ataque puede terminar en pérdida de datos, robo de identidad, extorsión o daño económico."
            }
        ],
        recomendaciones: [
            "Desconfiá de mensajes urgentes o inesperados.",
            "Ingresá manualmente a los sitios importantes desde el navegador.",
            "No descargues archivos adjuntos si no esperabas recibirlos.",
            "Activá alertas de inicio de sesión en tus cuentas principales."
        ]
    },
    //####################################################################################
        testNivel: {
        categoria: "Evaluación inicial",
        titulo: "Test de Nivel en Seguridad Digital",
        descripcion:
            "Respondé estas preguntas para conocer tu nivel inicial de conocimientos sobre ciberseguridad cotidiana.",
        tipo: "triviaSeguridad",
        contenido: [],
        recomendaciones: [
            "Leé cada pregunta con atención.",
            "No busques la respuesta: la idea es medir tu nivel actual.",
            "Después del resultado, revisá los temas donde tuviste errores."
        ]
    },
    //############# SE DEBE CAMBIAR CUANDO ACTUALIZEMOS EL CONTENIDO DE LA ACADEMIA #############
    verTodos: {
        categoria: "Biblioteca de aprendizaje",
        titulo: "Contenidos disponibles",
        descripcion:
            "Estos son los temas que HADES puede abordar dentro del módulo de aprendizaje.",
        contenido: [
            {
                subtitulo: "Phishing",
                texto:
                    "Reconocimiento de correos, enlaces y mensajes fraudulentos."
            },
            {
                subtitulo: "Contraseñas seguras",
                texto:
                    "Buenas prácticas para crear y administrar credenciales."
            },
            {
                subtitulo: "Backups",
                texto:
                    "Importancia de las copias de seguridad y frecuencia recomendada."
            },
            {
                subtitulo: "Ransomware",
                texto:
                    "Cómo prevenir y responder ante el secuestro de archivos."
            },
            {
                subtitulo: "Privacidad",
                texto:
                    "Configuraciones básicas para proteger información personal."
            },
            {
                subtitulo: "Autenticación en dos pasos",
                texto:
                    "Uso de una segunda verificación para proteger cuentas."
            }
        ],
        recomendaciones: [
            "Completá primero los conceptos básicos.",
            "Luego practicá con simuladores.",
            "Repetí los tests para medir tu progreso.",
            "Aplicá las recomendaciones en tus cuentas reales."
        ]
    }
};

const conceptosCiberHigiene = [
    {
        id: "autenticacion_2_pasos",
        titulo: "Autenticación en 2 pasos",
        categoria: "Protección de cuentas",
        color: "bg-blue-50 border-blue-100 text-blue-900",
        imagen:
            "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80",
        descripcion:
            "La autenticación en dos pasos agrega una verificación extra además de la contraseña tradicional, basándose en la combinación de al menos dos factores independientes: algo que sabés (tu clave), algo que tenés (tu celular o un token) o algo que sos (tu huella o rostro). \n Esta capa adicional puede materializarse mediante un código temporal de un solo uso (OTP), notificaciones dinámicas (push) en el smartphone, o aplicaciones autenticadoras dedicadas.  De acuerdo con las auditorías globales de seguridad de Microsoft y el marco del NIST, más del 88% de las brechas de datos actuales involucran credenciales débiles o reutilizadas, y la simple activación del doble factor de autenticación bloquea de manera automática el 99.9% de los ataques automatizados de suplantación de identidad.",
        recomendacion:
            "Activala en tus cuentas más importantes: correo, banco, redes sociales, almacenamiento en la nube y GitHub."
    },
    {
        id: "virus_informatico",
        titulo: "Virus informático",
        categoria: "Amenazas digitales",
        color: "bg-red-50 border-red-100 text-red-900",
        imagen:
            "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=1200&q=80",
        descripcion:
            "Un virus informático es un tipo específico de software malicioso (malware) diseñado con la capacidad de replicarse a sí mismo insertando su código en otros programas ejecutables, archivos o sectores del sistema operativo. Su objetivo principal es alterar el correcto funcionamiento del equipo, corromper o secuestrar datos confidenciales, y propagarse de manera sigilosa hacia otros sistemas compartidos a través de redes locales, dispositivos de almacenamiento extraíbles o archivos adjuntos en el correo electrónico.A nivel técnico y según los marcos globales de CISA, aunque el término virus suele usarse popularmente para englobar a toda amenaza digital, representa solo una categoría dentro del ecosistema del malware, diferenciándose de los gusanos (que no requieren intervención humana para propagarse) y los troyanos (que se disfrazan de software legítimo). Los reportes actuales de ENISA advierten que los virus modernos ya no solo buscan vandalizar el sistema o ralentizar el hardware, sino que actúan de forma híbrida y persistente: eluden los mecanismos de detección tradicionales inyectándose directamente en la memoria RAM (técnicas fileless) y abren puertas traseras (backdoors) para la posterior ejecución de amenazas más complejas como el ransomware.",
        recomendacion:
            "Evitá descargar archivos de sitios desconocidos y mantené actualizado el sistema operativo y el antivirus."
    },
    {
        id: "phishing",
        titulo: "Phishing",
        categoria: "Engaño digital",
        color: "bg-amber-50 border-amber-100 text-amber-900",
        imagen:
            "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
        descripcion:
            "El phishing es la clásica estafa del cuento del tío, pero versión digital. Es un engaño donde los delincuentes se hacen pasar por una empresa que conocés y usás (como tu banco, Mercado Libre, Correo Argentino o Netflix) enviándote un mail, un mensaje de WhatsApp o un SMS falso. Te inventan una urgencia (como tu cuenta fue bloqueada) para que entres a un enlace y les regales tus contraseñas o tarjetas de crédito. \n ¿Por qué es clave saber esto? \n Organizaciones que persiguen estas estafas (como el APWG) avisan que los delincuentes clonan las páginas web a la perfección, haciendo que parezcan idénticas a las reales. Además, investigadores de nuestra región (Jiménez Montenegro, 2025) confirmaron que la mayoría de las personas comunes caen en estas trampas simplemente por no saber cómo funcionan estos engaños cotidianos.",
        recomendacion:
            "Antes de hacer clic, revisá el remitente, el dominio, el tono del mensaje y si te están presionando con urgencia."
    },
    {
        id: "contrasena_segura",
        titulo: "Contraseña segura",
        categoria: "Credenciales",
        color: "bg-indigo-50 border-indigo-100 text-indigo-900",
        imagen:
            "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1200&q=80",
        descripcion:
            "Una contraseña segura es larga, única y difícil de adivinar. No debería incluir datos personales como tu nombre, fecha de nacimiento, el nombre de tu mascota o palabras obvias (como 123456 o contraseña). La regla de oro es que sea una frase que solo vos conozcas, pero que resulte fácil de recordar. ¿Por qué es clave saber esto? Los expertos en ciberseguridad del organismo internacional NIST explican que hoy en día lo más importante es la longitud. Las computadoras de los delincuentes son capaces de adivinar claves cortas (de 8 caracteres) en cuestión de minutos, aunque les metas números o mayúsculas. Sin embargo, si creás una clave larga —combinando cuatro o cinco palabras comunes pero inconexas (por ejemplo: gato-mate-azul-viento)—, a una máquina le tomaría siglos descifrarla. Además, las estadísticas de Hive Systems demuestran que usar la misma clave para todo es el error más común: si hackean una aplicación vieja que ya no usás, los atacantes probarán esa misma contraseña para intentar entrar a tu correo o a tu banco.",
        recomendacion:
            "Usá frases largas o un gestor de contraseñas. No repitas la misma clave en varios servicios."
    },
    {
        id: "backup",
        titulo: "Backup",
        categoria: "Recuperación",
        color: "bg-emerald-50 border-emerald-100 text-emerald-900",
        imagen:
            "https://images.unsplash.com/photo-1600267165477-6d4cc741b379?auto=format&fit=crop&w=1200&q=80",
        descripcion:
            "Un backup es una copia de seguridad de tus archivos digitales que se guarda en un lugar seguro y separado de tu dispositivo principal. Sirve como un salvavidas que te permite recuperar tus fotos, trabajos o documentos importantes de forma rápida si sufrís la pérdida o el robo de tu equipo, si se te rompe el disco rígido, o si sos víctima de un virus peligroso. ¿Por qué es clave saber esto? Los expertos del organismo de seguridad US-CERT recomiendan seguir siempre la regla de oro del respaldo, llamada 3-2-1: debés tener 3 copias de tus datos importantes, guardadas en 2 tipos de almacenamiento distintos (por ejemplo, una copia en el disco de tu computadora y otra en un pendrive o disco externo física), y 1 de ellas guardada fuera de tu casa (que hoy en día es la nube, como Google Drive o OneDrive). Las estadísticas actuales de firmas de ciberseguridad como Sophos advierten que las amenazas modernas, como el ransomware (un virus que secuestra y cifra tus archivos pidiéndote plata a cambio), intentan bloquear todo lo que esté conectado a la máquina. Por eso, tener un backup en un disco externo que desconectás cuando no lo usás es la única defensa 100% segura para no perder tu información.",
        recomendacion:
            "Mantené al menos una copia externa o en la nube y verificá periódicamente que puedas restaurarla."
    },
    {
        id: "ransomware",
        titulo: "Ransomware",
        categoria: "Malware",
        color: "bg-rose-50 border-rose-100 text-rose-900",
        imagen:
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
        descripcion:
            "El ransomware es un tipo de programa malicioso muy peligroso que funciona como un secuestrador digital. Una vez que entra en tu computadora o celular, bloquea por completo el acceso al equipo o cifra tus archivos (les pone una clave secreta para que no puedas abrir tus fotos, videos o documentos). Inmediatamente después, los delincuentes te muestran un cartel en la pantalla exigiendo que les pagues un rescate en dinero digital (criptomonedas) para devolverte el control. ¿Por qué es clave saber esto? Agencias de investigación como el FBI y organismos de ciberseguridad como CISA advierten con total firmeza que nunca se debe pagar el rescate. Pagar no garantiza que los delincuentes te devuelvan tus archivos (después de todo, son criminales) y, además, financia sus operaciones para que sigan atacando a más personas. La única defensa verdaderamente efectiva contra este peligro es la prevención: tener mucho cuidado con los enlaces o archivos que descargamos de internet y, fundamentalmente, mantener copias de seguridad de nuestros archivos importantes en un disco externo desenchufado, donde el secuestrador no pueda llegar.",
        recomendacion:
            "No abras adjuntos sospechosos, mantené backups actualizados y desconectá el equipo de la red si sospechás una infección."
    },
    {
        id: "actualizaciones",
        titulo: "Actualizaciones",
        categoria: "Prevención",
        color: "bg-sky-50 border-sky-100 text-sky-900",
        imagen:
            "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
        descripcion:
            "Las actualizaciones corrigen errores, mejoran el rendimiento de tus aplicaciones y solucionan fallas de seguridad (llamadas vulnerabilidades) que los atacantes podrían aprovechar para entrar a tu dispositivo. Mantener tu sistema operativo y tus aplicaciones al día es como ponerle un cerrojo nuevo a tu casa cada vez que se descubre que los ladrones aprendieron a abrir la cerradura vieja. ¿Por qué es clave saber esto? La agencia de ciberseguridad CISA advierte que la gran mayoría de los hackeos exitosos a usuarios comunes no ocurren porque los delincuentes usen técnicas de película, sino porque aprovechan fallas viejas que ya tenían un parche de seguridad disponible que el usuario nunca instaló. Equipos de investigación como Google Project Zero demuestran que, cuando se descubre un agujero de seguridad en un teléfono o computadora, los atacantes corren a usarlo antes de que la gente actualice. Por eso, posponer las actualizaciones es dejar la puerta abierta. Lo más recomendable y seguro es activar siempre las actualizaciones automáticas para que se instalen solas mientras dormís.",
        recomendacion:
            "Activá actualizaciones automáticas en el sistema operativo, navegador y aplicaciones principales."
    },
    {
        id: "red_wifi_segura",
        titulo: "Red WiFi segura",
        categoria: "Red doméstica",
        color: "bg-cyan-50 border-cyan-100 text-cyan-900",
        imagen:
            "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
        descripcion:
            "Una red WiFi segura reduce el riesgo de que personas no autorizadas se conecten a tus dispositivos y roben tus datos dentro del hogar. Tu WiFi es el puente que conecta tus celulares, computadoras, televisores y cámaras a internet; si ese puente es débil, cualquiera que esté cerca de tu casa podría colarse en tu red y espiar lo que hacés. ¿Por qué es clave saber esto? La Wi-Fi Alliance explica que no todas las contraseñas de WiFi protegen de la misma manera. Los routers antiguos usan sistemas de seguridad viejos (como WEP o WPA) que los delincuentes pueden descifrar en pocos minutos usando herramientas automáticas. Hoy en día, lo seguro es configurar el router con el estándar moderno llamado WPA3 (o en su defecto, WPA2). Además, organismos como la FTC recomiendan dos acciones muy simples para proteger el hogar: primero, cambiar la contraseña que viene de fábrica pegada en la etiqueta del módem (ya que existen listas en internet con esas claves genéricas); y segundo, desactivar la opción WPS (el botoncito que permite conectarse sin poner la clave), porque suele tener fallas que los atacantes aprovechan para entrar sin permiso.",
        recomendacion:
            "Usá WPA2 o WPA3, cambiá la clave por defecto del router y evitá compartir la contraseña principal con desconocidos."
    },
    {
        id: "privacidad_digital",
        titulo: "Privacidad digital",
        categoria: "Datos personales",
        color: "bg-purple-50 border-purple-100 text-purple-900",
        imagen:
            "https://images.unsplash.com/photo-1592495989226-03f88104f8cc?auto=format&fit=crop&w=1200&q=80",
        descripcion:
            "La privacidad digital consiste en tener el poder de controlar qué información personal compartís en internet, con quién la compartís y bajo qué condiciones. Tus fotos, tu ubicación diaria, las cosas que buscás en internet y hasta tus gustos personales forman parte de tu huella digital; cuidar tu privacidad significa decidir quién puede ver esa huella y evitar que las empresas la usen sin tu permiso. ¿Por qué es clave saber esto? La EFF explica que hoy en día nuestros datos personales se convirtieron en una moneda de cambio. Muchas aplicaciones y páginas web gratuitas rastrean en silencio todo lo que hacés para armar un perfil tuyo y vendérselo a empresas de publicidad. Organismos como la AEPD recuerdan que la privacidad no es tener algo que ocultar, sino el derecho a elegir qué proteger. Para cuidar tu privacidad en el día a día, los expertos recomiendan dos cosas muy simples: primero, revisar los permisos de las apps que instalás (denegando el acceso al micrófono o a la ubicación si no lo necesitan); y segundo, leer los carteles de aceptar cookies al entrar a una web para rechazar el rastreo publicitario.",
        recomendacion:
            "Revisá permisos de aplicaciones, configuraciones de redes sociales y datos visibles públicamente."
    },
    {
        id: "ingenieria_social",
        titulo: "Ingeniería social",
        categoria: "Manipulación",
        color: "bg-orange-50 border-orange-100 text-orange-900",
        imagen:
            "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
        descripcion:
            "La ingeniería social busca manipular a una persona para que revele información confidencial, realice una acción peligrosa (como descargar un archivo) o confíe ciegamente en una fuente que en realidad es falsa. En lugar de atacar las defensas tecnológicas de una computadora, los delincuentes deciden hackear a la persona, aprovechándose de su buena fe, de su curiosidad o de su miedo. ¿Por qué es clave saber esto? Expertos del SANS Institute señalan que la ingeniería social es la herramienta favorita de los atacantes porque es mucho más fácil engañar a un ser humano que romper un sistema de seguridad avanzado. Los delincuentes suelen usar disparadores psicológicos muy específicos, como la urgencia (hacerte creer que tenés que actuar ya mismo para evitar un problema), la autoridad (hacerse pasar por un jefe, un policía o un gerente de banco) o el miedo (decirte que cometiste una infracción). Reportes de la agencia europea ENISA confirman que el eslabón más débil en la seguridad digital sigue siendo el desconocimiento de estas técnicas. Por eso, la mejor defensa no es un programa informático costoso, sino desarrollar un escepticismo saludable: si un mensaje te genera mucha urgencia o te pide algo inusual, lo seguro es parar, dudar y verificar por otra vía.",
        recomendacion:
            "Desconfiá de pedidos urgentes, promesas demasiado buenas o mensajes que intenten generar miedo, culpa o presión."
    }
];

const mitosRealidades = [
    {
        id: "modo_incognito",
        mito: "El modo incógnito me hace invisible en internet",
        realidad:
            "El modo incógnito solo evita guardar historial, cookies y datos del sitio en el dispositivo local.",
        categoria: "Privacidad",
        color: "bg-purple-50 border-purple-100 text-purple-900",
        imagen:
            "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&w=1200&q=80",
        explicacion:
            "Aunque uses modo incógnito, los sitios web, el proveedor de internet, una red institucional o algunas plataformas todavía pueden registrar actividad. No es una herramienta de anonimato completo.",
        recomendacion:
            "Usalo para no dejar rastros locales en el navegador, pero no lo confundas con protección total de privacidad."
    },
    {
        id: "antivirus_total",
        mito: "Si tengo antivirus, ya estoy completamente protegido",
        realidad:
            "El antivirus ayuda, pero no reemplaza los buenos hábitos de seguridad.",
        categoria: "Protección",
        color: "bg-blue-50 border-blue-100 text-blue-900",
        imagen:
            "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=1200&q=80",
        explicacion:
            "Un antivirus puede detectar muchas amenazas conocidas, pero no siempre evita phishing, contraseñas débiles, enlaces falsos, estafas o errores del usuario.",
        recomendacion:
            "Combiná antivirus actualizado con contraseñas seguras, autenticación en dos pasos, backups y cuidado al abrir enlaces."
    },
    {
        id: "solo_empresas",
        mito: "Los ciberataques solo les pasan a empresas grandes",
        realidad:
            "Los usuarios domésticos también son objetivos frecuentes.",
        categoria: "Amenazas",
        color: "bg-amber-50 border-amber-100 text-amber-900",
        imagen:
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
        explicacion:
            "Los atacantes suelen buscar cuentas personales, correos, redes sociales, billeteras virtuales, dispositivos domésticos o datos reutilizables para otros fraudes.",
        recomendacion:
            "Protegé tus cuentas personales con la misma seriedad que protegerías información laboral o académica."
    },
    {
        id: "contrasena_unica",
        mito: "Una contraseña fuerte sirve para todas mis cuentas",
        realidad:
            "Aunque sea fuerte, reutilizarla en varios servicios es riesgoso.",
        categoria: "Credenciales",
        color: "bg-indigo-50 border-indigo-100 text-indigo-900",
        imagen:
            "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=1200&q=80",
        explicacion:
            "Si una página sufre una filtración y usás esa misma contraseña en otros servicios, un atacante podría probarla en varias cuentas.",
        recomendacion:
            "Usá contraseñas únicas. Para administrarlas, podés utilizar un gestor de contraseñas."
    },
    {
        id: "https_seguro",
        mito: "Si una página tiene HTTPS, entonces siempre es segura",
        realidad:
            "HTTPS protege la conexión, pero no garantiza que el sitio sea legítimo.",
        categoria: "Navegación",
        color: "bg-emerald-50 border-emerald-100 text-emerald-900",
        imagen:
            "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
        explicacion:
            "Una página falsa también puede tener HTTPS. El candado indica que la comunicación está cifrada, pero no confirma que la empresa o servicio sea real.",
        recomendacion:
            "Además del candado, revisá el dominio completo, errores de escritura y si llegaste al sitio desde un enlace sospechoso."
    },
    {
        id: "no_tengo_nada",
        mito: "No tengo nada importante, nadie me va a atacar",
        realidad:
            "Cualquier cuenta o dispositivo puede ser útil para un atacante.",
        categoria: "Concientización",
        color: "bg-sky-50 border-sky-100 text-sky-900",
        imagen:
            "https://images.unsplash.com/photo-1592495989226-03f88104f8cc?auto=format&fit=crop&w=1200&q=80",
        explicacion:
            "Una cuenta personal puede usarse para enviar spam, engañar contactos, recuperar otras cuentas, robar identidad o acceder a servicios vinculados.",
        recomendacion:
            "No subestimes el valor de tu correo, redes sociales, archivos y dispositivos personales."
    },
    {
        id: "wifi_publico",
        mito: "Usar WiFi público es igual de seguro que usar mi red de casa",
        realidad:
            "Las redes públicas tienen más riesgos y menos control.",
        categoria: "Redes",
        color: "bg-cyan-50 border-cyan-100 text-cyan-900",
        imagen:
            "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
        explicacion:
            "En una red pública puede haber usuarios desconocidos, puntos de acceso falsos o configuraciones inseguras. No siempre sabés quién administra esa red.",
        recomendacion:
            "Evitá ingresar a bancos o servicios sensibles desde WiFi público. Usá datos móviles o una VPN confiable cuando sea necesario."
    },
    {
        id: "actualizaciones_molestan",
        mito: "Las actualizaciones solo molestan y no son tan importantes",
        realidad:
            "Muchas actualizaciones corrigen vulnerabilidades de seguridad.",
        categoria: "Prevención",
        color: "bg-orange-50 border-orange-100 text-orange-900",
        imagen:
            "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
        explicacion:
            "Cuando un sistema queda desactualizado, puede conservar fallas conocidas que los atacantes ya saben aprovechar.",
        recomendacion:
            "Activá actualizaciones automáticas o revisá periódicamente sistema operativo, navegador y aplicaciones principales."
    },
    {
        id: "correo_con_logo",
        mito: "Si un correo tiene logo oficial, entonces es verdadero",
        realidad:
            "Los logos e imágenes pueden copiarse fácilmente.",
        categoria: "Phishing",
        color: "bg-rose-50 border-rose-100 text-rose-900",
        imagen:
            "https://images.unsplash.com/photo-1586769852044-692d6e3703f0?auto=format&fit=crop&w=1200&q=80",
        explicacion:
            "Un atacante puede copiar colores, logos y estilos de una marca para hacer que un mensaje falso parezca confiable.",
        recomendacion:
            "No te guíes solo por el diseño. Revisá remitente, dominio, enlaces, urgencia y contexto del mensaje."
    },
    {
        id: "borrar_archivos",
        mito: "Borrar un archivo siempre lo elimina para siempre",
        realidad:
            "En muchos casos, los archivos pueden recuperarse o quedar copias en otros lugares.",
        categoria: "Datos",
        color: "bg-slate-50 border-slate-200 text-slate-900",
        imagen:
            "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
        explicacion:
            "Un archivo borrado puede quedar en la papelera, en copias de seguridad, en la nube o incluso ser recuperable con herramientas especiales.",
        recomendacion:
            "Para información sensible, usá métodos de eliminación segura y revisá sincronizaciones en la nube."
    }
];

    const preguntasTriviaSeguridad = [
        {
            id: "pregunta_1",
            pregunta: "¿Qué deberías hacer si recibís un enlace sospechoso por correo?",
            opciones: [
                "Abrirlo rápido para verificar si es real.",
                "Revisar el remitente, el dominio y evitar ingresar datos personales.",
                "Responder el correo preguntando si es verdadero.",
                "Reenviarlo a tus contactos para consultar."
            ],
            respuestaCorrecta: 1,
            explicacion:
                "Ante un enlace sospechoso conviene revisar el remitente, verificar el dominio y no ingresar datos personales desde enlaces recibidos."
        },
        {
            id: "pregunta_2",
            pregunta: "¿Qué característica hace más segura a una contraseña?",
            opciones: [
                "Que sea corta y fácil de recordar.",
                "Que use tu nombre y fecha de nacimiento.",
                "Que sea larga, única y difícil de adivinar.",
                "Que sea la misma para todas tus cuentas."
            ],
            respuestaCorrecta: 2,
            explicacion:
                "Una contraseña segura debe ser larga, única para cada servicio y difícil de relacionar con datos personales."
        },
        {
            id: "pregunta_3",
            pregunta: "¿Para qué sirve la autenticación en dos pasos?",
            opciones: [
                "Para reemplazar completamente la contraseña.",
                "Para agregar una segunda verificación al iniciar sesión.",
                "Para acelerar el inicio de sesión.",
                "Para compartir la cuenta con otras personas."
            ],
            respuestaCorrecta: 1,
            explicacion:
                "La autenticación en dos pasos agrega una capa extra de seguridad, por ejemplo mediante un código temporal o una app autenticadora."
        },
        {
            id: "pregunta_4",
            pregunta: "¿Qué deberías hacer ante un archivo adjunto inesperado?",
            opciones: [
                "Abrirlo para ver de qué se trata.",
                "Descargarlo y compartirlo con otra persona.",
                "Verificar el remitente y no abrirlo si no lo esperabas.",
                "Cambiarle el nombre antes de abrirlo."
            ],
            respuestaCorrecta: 2,
            explicacion:
                "Los adjuntos inesperados pueden contener malware o intentar engañar al usuario. Es mejor verificar antes de abrir."
        },
        {
            id: "pregunta_5",
            pregunta: "¿Qué medida ayuda a recuperarse ante un ataque de ransomware?",
            opciones: [
                "Tener copias de seguridad actualizadas.",
                "Pagar siempre el rescate.",
                "Desactivar todas las actualizaciones.",
                "Usar la misma contraseña en todos los servicios."
            ],
            respuestaCorrecta: 0,
            explicacion:
                "Los backups actualizados permiten recuperar archivos sin depender del atacante."
        }
    ];

function mostrarContenidoAcademia(claveContenido) {
    const contenido = contenidosAcademia[claveContenido];

    if (
        !contenido ||
        !panelAcademia ||
        !categoriaAcademia ||
        !tituloAcademia ||
        !descripcionAcademia ||
        !contenidoAcademia ||
        !recomendacionesAcademia
    ) {
        return;
    }

    categoriaAcademia.textContent = contenido.categoria;
    tituloAcademia.textContent = contenido.titulo;
    descripcionAcademia.textContent = contenido.descripcion;

    contenidoAcademia.innerHTML = "";

    if (contenido.tipo === "tarjetasConceptos") {
    renderizarTarjetasConceptos();
    } else if (contenido.tipo === "tarjetasMitos") {
        renderizarTarjetasMitos();
    } else if (contenido.tipo === "tarjetasInfografias") {
        renderizarTarjetasInfografias();
    } else if (contenido.tipo === "triviaSeguridad") {
        renderizarTriviaSeguridad();
    } else {
    contenido.contenido.forEach((bloque) => {
        const bloqueHTML = document.createElement("div");

        bloqueHTML.className =
            "bg-surface-container-lowest border border-gray-100 rounded-xl p-4";

        bloqueHTML.innerHTML = `
            <h4 class="font-bold text-primary mb-1">
                ${bloque.subtitulo}
            </h4>

            <p class="text-outline">
                ${bloque.texto}
            </p>
        `;

        contenidoAcademia.appendChild(bloqueHTML);
    });
}

    recomendacionesAcademia.innerHTML = `
        <p class="font-bold text-on-surface mb-2">
            Recomendaciones:
        </p>

        <ul class="list-disc pl-5 space-y-1">
            ${contenido.recomendaciones
                .map((recomendacion) => `<li>${recomendacion}</li>`)
                .join("")}
        </ul>
    `;

    panelAcademia.classList.remove("hidden");

    panelAcademia.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function renderizarTarjetasConceptos() {
    contenidoAcademia.innerHTML = "";

    const grilla = document.createElement("div");

    grilla.className =
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";

    conceptosCiberHigiene.forEach((concepto) => {
        const tarjeta = document.createElement("button");

        tarjeta.type = "button";
        tarjeta.className =
            `${concepto.color} border rounded-xl p-4 text-left hover:shadow-md transition-all active:scale-[0.98]`;

        tarjeta.innerHTML = `
            <span class="text-xs font-bold opacity-70">
                ${concepto.categoria}
            </span>

            <h4 class="font-bold text-base mt-2">
                ${concepto.titulo}
            </h4>

            <p class="text-xs opacity-80 mt-2">
                Ver explicación y recomendación
            </p>
        `;

        tarjeta.addEventListener("click", () => {
            mostrarModalConcepto(concepto);
        });

        grilla.appendChild(tarjeta);
    });

    contenidoAcademia.appendChild(grilla);
}

function renderizarTarjetasMitos() {
    contenidoAcademia.innerHTML = "";

    const grilla = document.createElement("div");

    grilla.className =
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";

    mitosRealidades.forEach((mito) => {
        const tarjeta = document.createElement("button");

        tarjeta.type = "button";
        tarjeta.className =
            `${mito.color} border rounded-xl p-4 text-left hover:shadow-md transition-all active:scale-[0.98]`;

        tarjeta.innerHTML = `
            <span class="text-xs font-bold opacity-70">
                ${mito.categoria}
            </span>

            <h4 class="font-bold text-base mt-2">
                ${mito.mito}
            </h4>

            <p class="text-xs opacity-80 mt-2">
                Ver realidad y explicación
            </p>
        `;

        tarjeta.addEventListener("click", () => {
            mostrarModalMito(mito);
        });

        grilla.appendChild(tarjeta);
    });

    contenidoAcademia.appendChild(grilla);
}

function renderizarTriviaSeguridad() {
    triviaEvaluada = false;

    contenidoAcademia.innerHTML = "";

    const contenedorTrivia = document.createElement("div");

    contenedorTrivia.className = "space-y-5";

    preguntasTriviaSeguridad.forEach((pregunta, indicePregunta) => {
        const bloquePregunta = document.createElement("div");

        bloquePregunta.className =
            "bg-white dark:bg-[#0b2340] border border-blue-100 dark:border-blue-700/40 rounded-xl p-5 shadow-sm text-slate-900 dark:text-white";

        const opcionesHTML = pregunta.opciones
            .map((opcion, indiceOpcion) => {
                return `
                    <label class="flex items-start gap-3 p-3 mt-3 rounded-lg border border-gray-100 dark:border-blue-700/40 cursor-pointer bg-blue-50 dark:bg-[#0f2b4a] hover:border-primary hover:bg-blue-50 dark:hover:bg-[#0f2b4a] transition-colors">
                        <input
                            type="radio"
                            name="${pregunta.id}"
                            value="${indiceOpcion}"
                            class="mt-1 text-primary focus:ring-primary"
                        />

                        <span class="text-sm text-slate-900 dark:text-white">
                            ${opcion}
                        </span>
                    </label>
                `;
            })
            .join("");

        bloquePregunta.innerHTML = `
            <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    ${indicePregunta + 1}
                </div>

                <div class="flex-1">
                    <h4 class="font-bold text-primary dark:text-blue-300">
                        ${pregunta.pregunta}
                    </h4>

                    <div>
                        ${opcionesHTML}
                    </div>
                </div>
            </div>
        `;

        contenedorTrivia.appendChild(bloquePregunta);
    });

    const accionesTrivia = document.createElement("div");

    accionesTrivia.className =
        "bg-white/70 dark:bg-[#0f1b36] border border-blue-100 dark:border-blue-900/40 rounded-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-slate-900 dark:text-white";

    accionesTrivia.innerHTML = `
        <div>
            <p class="font-bold text-on-surface">
                Finalizá el test para conocer tu nivel.
            </p>
            <p class="text-sm text-outline">
                Respondé todas las preguntas antes de enviar.
            </p>
        </div>

        <button
            id="btnFinalizarTrivia"
            type="button"
            class="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors"
        >
            Finalizar test
        </button>
    `;

    contenedorTrivia.appendChild(accionesTrivia);

    const resultadoTrivia = document.createElement("div");

    resultadoTrivia.id = "resultadoTriviaSeguridad";
    resultadoTrivia.className =
        "hidden bg-white dark:bg-[#0f1b36] border border-blue-100 dark:border-blue-900/40 rounded-xl p-5 shadow-sm text-slate-900 dark:text-white";

    contenedorTrivia.appendChild(resultadoTrivia);

    contenidoAcademia.appendChild(contenedorTrivia);

    const btnFinalizarTrivia = document.getElementById("btnFinalizarTrivia");

    if (btnFinalizarTrivia) {
        btnFinalizarTrivia.addEventListener("click", evaluarTriviaSeguridad);
    }
}

function evaluarTriviaSeguridad() {
    
    if (triviaEvaluada) {
        mostrarMensaje(
            "Este test ya fue evaluado. Podés volver a abrir el Test de Nivel para realizarlo nuevamente."
        );
        return;
    }

    let respuestasCorrectas = 0;
    let preguntasSinResponder = 0;
    const detalle = [];

    preguntasTriviaSeguridad.forEach((pregunta) => {
        const respuestaSeleccionada = document.querySelector(
            `input[name="${pregunta.id}"]:checked`
        );

        if (!respuestaSeleccionada) {
            preguntasSinResponder += 1;
            return;
        }

        const indiceSeleccionado = Number(respuestaSeleccionada.value);
        const esCorrecta = indiceSeleccionado === pregunta.respuestaCorrecta;

        if (esCorrecta) {
            respuestasCorrectas += 1;
        }

        detalle.push({
            pregunta: pregunta.pregunta,
            respuestaUsuario: pregunta.opciones[indiceSeleccionado],
            respuestaCorrecta: pregunta.opciones[pregunta.respuestaCorrecta],
            esCorrecta,
            explicacion: pregunta.explicacion
        });
    });

    if (preguntasSinResponder > 0) {
        mostrarMensaje(
            `Respondé todas las preguntas antes de finalizar. Faltan ${preguntasSinResponder}.`
        );
        return;
    }

    ocultarMensaje();

    const totalPreguntas = preguntasTriviaSeguridad.length;
    const porcentaje = Math.round(
        (respuestasCorrectas / totalPreguntas) * 100
    );

    mostrarResultadoTrivia(
        respuestasCorrectas,
        totalPreguntas,
        porcentaje,
        detalle
    );
    triviaEvaluada = true;
}

function obtenerNivelTrivia(porcentaje) {
    if (porcentaje >= 80) {
        return {
            nivel: "Nivel avanzado",
            recomendacion:
                "Tenés una muy buena base. Podés reforzar con simulaciones y casos más complejos."
        };
    }

    if (porcentaje >= 50) {
        return {
            nivel: "Nivel intermedio",
            recomendacion:
                "Tenés conocimientos importantes, pero conviene repasar algunos conceptos básicos."
        };
    }

    return {
        nivel: "Nivel inicial",
        recomendacion:
            "Conviene comenzar por Fundamentos de Ciber-Higiene y luego practicar con el simulador."
    };
}

function mostrarResultadoTrivia(
    respuestasCorrectas,
    totalPreguntas,
    porcentaje,
    detalle
) {
    const resultadoTrivia = document.getElementById(
        "resultadoTriviaSeguridad"
    );

    if (!resultadoTrivia) {
        return;
    }

    const nivel = obtenerNivelTrivia(porcentaje);

    console.log("Intentando guardar resultado de trivia...");

    guardarResultadoTriviaSeguridad(
    respuestasCorrectas,
    totalPreguntas,
    porcentaje,
    nivel.nivel
    );

    const detalleHTML = detalle
        .map((item) => {
            return `
                <div class="rounded-lg border ${
                    item.esCorrecta
                        ? "border-green-100 bg-green-50"
                        : "border-red-100 bg-red-50"
                } p-4">
                    <p class="font-bold ${
                        item.esCorrecta
                            ? "text-green-900"
                            : "text-red-900"
                    }">
                        ${item.esCorrecta ? "✓ Correcta" : "✗ Incorrecta"}
                    </p>

                    <p class="text-sm text-on-surface mt-2">
                        ${item.pregunta}
                    </p>

                    <p class="text-xs text-outline mt-2">
                        Tu respuesta: ${item.respuestaUsuario}
                    </p>

                    ${
                        item.esCorrecta
                            ? ""
                            : `<p class="text-xs text-outline mt-1">
                                Respuesta correcta: ${item.respuestaCorrecta}
                               </p>`
                    }

                    <p class="text-xs text-outline mt-2">
                        ${item.explicacion}
                    </p>
                </div>
            `;
        })
        .join("");

    resultadoTrivia.innerHTML = `
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
            <div>
                <span class="inline-flex text-xs font-bold bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full mb-3">
                    Resultado del test
                </span>

                <h4 class="text-2xl font-bold text-primary">
                    ${nivel.nivel}
                </h4>

                <p class="text-sm text-outline mt-1">
                    Obtuviste ${respuestasCorrectas} de ${totalPreguntas} respuestas correctas.
                </p>
            </div>

            <div class="w-24 h-24 rounded-full bg-blue-50 border-4 border-primary flex items-center justify-center">
                <span class="text-2xl font-bold text-primary">
                    ${porcentaje}%
                </span>
            </div>
        </div>

        <div class="bg-surface-container-low rounded-xl p-4 mb-5">
            <p class="font-bold text-on-surface mb-1">
                Recomendación de HADES
            </p>

            <p class="text-sm text-outline">
                ${nivel.recomendacion}
            </p>
        </div>

        <div class="space-y-3">
            ${detalleHTML}
        </div>
    `;

    resultadoTrivia.classList.remove("hidden");

    resultadoTrivia.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

async function guardarResultadoTriviaSeguridad(
    respuestasCorrectas,
    totalPreguntas,
    porcentaje,
    nivel
) {
    console.log("Entró a guardarResultadoTriviaSeguridad");

    if (!usuarioActual || !window.hadesAPI?.guardarResultadoTrivia) {
        console.warn(
            "No se pudo guardar el resultado de la trivia porque no hay usuario o no está disponible la API."
        );
        return;
    }

    try {
        await window.hadesAPI.guardarResultadoTrivia({
            id_usuario: usuarioActual.id_usuario,
            respuestas_correctas: respuestasCorrectas,
            total_preguntas: totalPreguntas,
            porcentaje,
            nivel
        });

        console.log("Resultado de trivia guardado correctamente.");
    } catch (error) {
        console.error(
            "No se pudo guardar el resultado de la trivia:",
            error
        );
    }
}


function mostrarModalMito(mito) {
    if (
        !modalConceptoAcademia ||
        !imagenConceptoAcademia ||
        !categoriaConceptoAcademia ||
        !tituloConceptoAcademia ||
        !descripcionConceptoAcademia ||
        !recomendacionConceptoAcademia
    ) {
        return;
    }

    imagenConceptoAcademia.src = mito.imagen;
    categoriaConceptoAcademia.textContent = mito.categoria;
    tituloConceptoAcademia.textContent = "Mito vs. Realidad";

    descripcionConceptoAcademia.innerHTML = `
        <span class="block font-bold text-error mb-2">
            Mito:
        </span>
        <span class="block mb-4">
            ${mito.mito}
        </span>

        <span class="block font-bold text-secondary mb-2">
            Realidad:
        </span>
        <span class="block mb-4">
            ${mito.realidad}
        </span>

        <span class="block font-bold text-primary mb-2">
            Explicación:
        </span>
        <span class="block">
            ${mito.explicacion}
        </span>
    `;

    recomendacionConceptoAcademia.textContent = mito.recomendacion;

    modalConceptoAcademia.classList.remove("hidden");
}

function mostrarModalConcepto(concepto) {
    if (
        !modalConceptoAcademia ||
        !imagenConceptoAcademia ||
        !categoriaConceptoAcademia ||
        !tituloConceptoAcademia ||
        !descripcionConceptoAcademia ||
        !recomendacionConceptoAcademia
    ) {
        return;
    }

    imagenConceptoAcademia.src = concepto.imagen;
    categoriaConceptoAcademia.textContent = concepto.categoria;
    tituloConceptoAcademia.textContent = concepto.titulo;
    descripcionConceptoAcademia.textContent = concepto.descripcion;
    recomendacionConceptoAcademia.textContent = concepto.recomendacion;

    modalConceptoAcademia.classList.remove("hidden");
}

function cerrarModalConcepto() {
    if (!modalConceptoAcademia) {
        return;
    }

    modalConceptoAcademia.classList.add("hidden");
}

function iniciarAcademiaDigital() {
    if (btnCursoCiberHigiene) {
        btnCursoCiberHigiene.addEventListener("click", () => {
            mostrarContenidoAcademia("ciberHigiene");
        });
    }

    if (btnMitosRealidades) {
        btnMitosRealidades.addEventListener("click", () => {
            mostrarContenidoAcademia("mitos");
        });
    }

    if (btnAnatomiaAtaque) {
        btnAnatomiaAtaque.addEventListener("click", () => {
            mostrarContenidoAcademia("anatomiaAtaque");
        });
    }

    if (btnVerTodosAcademia) {
        btnVerTodosAcademia.addEventListener("click", () => {
            mostrarContenidoAcademia("verTodos");
        });
    }

    if (btnTestNivel) {
    btnTestNivel.addEventListener("click", () => {
        mostrarContenidoAcademia("testNivel");
        });
    }

    if (btnCerrarAcademia && panelAcademia) {
        btnCerrarAcademia.addEventListener("click", () => {
            panelAcademia.classList.add("hidden");
        });
    }
}
        if (btnCerrarModalConcepto) {
            btnCerrarModalConcepto.addEventListener("click", cerrarModalConcepto);
        }

        if (modalConceptoAcademia) {
            modalConceptoAcademia.addEventListener("click", (event) => {
                if (event.target === modalConceptoAcademia) {
                    cerrarModalConcepto();
                }
            });
        }
//#########FIN Elementos de la Academia de Defensa Digital############

//============ PRESENTACIONES DE INFOGRAFIA =========================
function cargarPresentaciones() {

    const contenedor =
        document.getElementById("listaPresentaciones");

    contenedor.innerHTML = "";

    presentaciones.forEach((presentacion) => {

        const tarjeta = document.createElement("button");

        tarjeta.className =
            "border rounded-xl p-4 hover:bg-blue-50 text-left";

        tarjeta.innerHTML = `
            <div class="text-4xl mb-2">📁</div>
            <div class="font-bold">
                ${presentacion.titulo}
            </div>
            <div class="text-sm text-gray-500">
                ${presentacion.total} diapositivas
            </div>
        `;

        tarjeta.addEventListener("click", () => {
            abrirPresentacion(presentacion);
        });

        contenedor.appendChild(tarjeta);
    });
}

function abrirPresentacion(presentacion) {

    presentacionActual = presentacion;

    diapositivaActual = 1;

    actualizarDiapositiva();

    document
        .getElementById("modalVisorPresentacion")
        .classList.remove("hidden");
}

function actualizarDiapositiva() {

    const imagen =
        document.getElementById("imagenPresentacion");

    imagen.src =
        `../assets/img/presentaciones/${
            presentacionActual.carpeta
        }/${diapositivaActual}.png`;
}

document
    .getElementById("btnSiguienteDiapositiva")
    .addEventListener("click", () => {

        if (
            diapositivaActual <
            presentacionActual.total
        ) {
            diapositivaActual++;
            actualizarDiapositiva();
        }
    });

document
    .getElementById("btnAnteriorDiapositiva")
    .addEventListener("click", () => {

        if (diapositivaActual > 1) {
            diapositivaActual--;
            actualizarDiapositiva();
        }
    });

 // ===============================
// PRESENTACIONES EDUCATIVAS
// ===============================

const btnPresentaciones =
    document.getElementById("btnPresentaciones");

const modalPresentaciones =
    document.getElementById("modalPresentaciones");

const btnCerrarPresentaciones =
    document.getElementById("btnCerrarPresentaciones");

if (btnPresentaciones) {
    btnPresentaciones.addEventListener("click", () => {

        cargarPresentaciones();

        modalPresentaciones.classList.remove("hidden");
    });
}

if (btnCerrarPresentaciones) {
    btnCerrarPresentaciones.addEventListener("click", () => {
        modalPresentaciones.classList.add("hidden");
    });
}

document
    .getElementById("btnCerrarVisor")
    .addEventListener("click", () => {

        document
            .getElementById("modalVisorPresentacion")
            .classList.add("hidden");
    });

//================== FIN PRESENTACIONES DE INFOGRAFIA =========================

    iniciarAcademiaDigital();
    iniciarSimuladorPhishing();
    
});