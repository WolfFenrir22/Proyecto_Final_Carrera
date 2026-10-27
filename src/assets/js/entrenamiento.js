document.addEventListener("DOMContentLoaded", () => {
    const levelPicker = document.getElementById("modalSeleccionDificultad");
    const levelPickerMessage = document.getElementById("mensajeSeleccionDificultad");
    const difficultyByOption = {
        facil: "Básico",
        intermedio: "Intermedio",
        dificil: "Avanzado"
    };
    let activeDifficulty = "";
    let activityWaitingForDifficulty = "";

    window.mostrarSelectorDificultad = (activity) => {
        activityWaitingForDifficulty = activity;
        levelPickerMessage.classList.add("hidden");
        levelPicker.classList.remove("hidden");
        levelPicker.querySelector("[data-dificultad]")?.focus();
    };

    function hideLevelPicker() {
        levelPicker.classList.add("hidden");
    }

    function selectDifficulty(option) {
        const difficulty = difficultyByOption[option];
        if (!difficulty) return;

        const scenarios = activityWaitingForDifficulty === "simPhishing"
            ? escenariosPhishing
            : activityWaitingForDifficulty === "simSmishing"
                ? escenariosSV
                : [];
        if (!scenarios.length) {
            levelPickerMessage.textContent = "No se pudieron cargar los contenidos de esta actividad. Volvé a intentarlo en unos instantes.";
            levelPickerMessage.classList.remove("hidden");
            return;
        }
        if (!scenarios.some((scenario) => scenario.dificultad === difficulty)) {
            levelPickerMessage.textContent = `Todavía no hay escenarios de ${activityWaitingForDifficulty === "simPhishing" ? "phishing" : "smishing/vishing"} para el nivel ${difficulty}. Pedile al administrador que agregue contenido de esta dificultad.`;
            levelPickerMessage.classList.remove("hidden");
            return;
        }

        activeDifficulty = difficulty;
        ultimoEscenarioId = null;
        ultimoEscenarioSVId = null;
        ["simPhishing", "simSmishing"].forEach((id) => {
            document.getElementById(id).classList.toggle(
                "hidden",
                id !== activityWaitingForDifficulty
            );
        });
        hideLevelPicker();
        const selectedSimulator = document.getElementById(activityWaitingForDifficulty);
        selectedSimulator.scrollIntoView({ behavior: "smooth", block: "start" });
        const initialScenario = activityWaitingForDifficulty === "simPhishing"
            ? obtenerEscenarioAleatorio()
            : obtenerEscenarioAleatorioSV();
        if (activityWaitingForDifficulty === "simPhishing") {
            cargarEscenario(initialScenario);
            actualizarResumenSesion();
        } else {
            cargarEscenarioSV(initialScenario);
        }
    }

    document.getElementById("cerrarSeleccionDificultad").addEventListener(
        "click",
        hideLevelPicker
    );
    levelPicker.addEventListener("click", (event) => {
        if (event.target === levelPicker) hideLevelPicker();
        const choice = event.target instanceof Element
            ? event.target.closest("[data-dificultad]")
            : null;
        if (choice) selectDifficulty(choice.dataset.dificultad);
    });

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

    //#########Elementos del Simulador de Smishing/Vishing############
    const svRemitente = document.getElementById("svRemitente");
    const svTipoPantalla = document.getElementById("svTipoPantalla");
    const svMensaje = document.getElementById("svMensaje");
    const svEnlace = document.getElementById("svEnlace");
    const listaSenalesSV = document.getElementById("listaSenalesSV");
    const btnEvaluarSV = document.getElementById("btnEvaluarSV");
    const btnNuevoCasoSV = document.getElementById("btnNuevoCasoSV");
    const mensajeErrorSV = document.getElementById("mensajeErrorSV");
    const resultadoSV = document.getElementById("resultadoSV");
    const tituloResultadoSV = document.getElementById("tituloResultadoSV");
    const detalleResultadoSV = document.getElementById("detalleResultadoSV");

    const senalesDisponiblesSV = [
        { id: "sv_urgencia", texto: "El mensaje genera urgencia extrema o pánico." },
        { id: "sv_pide_otp", texto: "Solicita un código de verificación (SMS/OTP)." },
        { id: "sv_link_sospechoso", texto: "Incluye un enlace acortado o sospechoso." },
        { id: "sv_amenaza", texto: "Amenaza con multas, bloqueos o acciones legales." },
        { id: "sv_premio_falso", texto: "Ofrece un premio, subsidio o trabajo muy fácil." },
        { id: "sv_remitente_desconocido", texto: "Proviene de un número desconocido haciéndose pasar por entidad." }
    ];

    let escenariosSV = [];
    //#########FIN Elementos del Simulador SV############

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

    let escenariosPhishing = [];
    //#########FIN Elementos del Simulador de Phishing############

    //#########Elementos de la Academia de Defensa Digital############
    const btnVerTodosAcademia = document.getElementById("btnVerTodosAcademia");
    const btnCursoCiberHigiene = document.getElementById("btnCursoCiberHigiene");
    const btnMitosRealidades = document.getElementById("btnMitosRealidades");
    const btnAnatomiaAtaque = document.getElementById("btnAnatomiaAtaque");
    const opcionesDificultadTrivia = document.getElementById(
        "opcionesDificultadTrivia"
    );
    const mensajeTestNivel = document.getElementById("mensajeTestNivel");
    const panelTestContenido = document.getElementById("panelTestContenido");
    const contenidoTestNivel = document.getElementById("contenidoTestNivel");

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
    const btnMarcarConceptoLeidoModal = document.getElementById(
        "btnMarcarConceptoLeidoModal"
    );
    const btnCerrarModalConcepto = document.getElementById(
        "btnCerrarModalConcepto"
    );
    const filtroCategoriasConceptos = document.getElementById(
        "filtroCategoriasConceptos"
    );
    const selectCategoriaConceptos = document.getElementById(
        "selectCategoriaConceptos"
    );
    const progresoLecturaConceptos = document.getElementById(
        "progresoLecturaConceptos"
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
let presentaciones = [];
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
            (escenario) =>
                escenario.dificultad === activeDifficulty &&
                escenario.id !== ultimoEscenarioId
        );
        if (!escenariosDisponibles.length) {
            return escenariosPhishing.find(
                (escenario) => escenario.dificultad === activeDifficulty
            );
        }

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
        if (!usuarioActual || !window.hadesAPI?.guardarResultadoPhishingRemoto) {
            console.warn(
                "No se pudo guardar el resultado porque no hay usuario o no está disponible la API."
            );
            return;
        }

        try {
            await window.hadesAPI.guardarResultadoPhishingRemoto({
                token: usuarioActual.token,
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
    let contenidosAcademia = {};

let conceptosCiberHigiene = [];
let conceptosLeidos = new Set();
let conceptoActualModal = null;

let mitosRealidades = [];
let mitosLeidos = new Set();
let mitoActualModal = null;
let tipoTarjetasAcademiaActual = null;

    let preguntasTriviaSeguridad = [];
    let preguntasTriviaActivas = [];
    let respuestasTrivia = new Map();
    let paginaTrivia = 0;

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
    const esTarjetasConceptos = contenido.tipo === "tarjetasConceptos";
    const esTarjetasMitos = contenido.tipo === "tarjetasMitos";
    const esColeccionFiltrable = esTarjetasConceptos || esTarjetasMitos;
    tipoTarjetasAcademiaActual = esTarjetasConceptos
        ? "conceptos"
        : esTarjetasMitos
            ? "mitos"
            : null;
    tituloAcademia.classList.toggle("hidden", esColeccionFiltrable);
    filtroCategoriasConceptos.classList.toggle("hidden", !esColeccionFiltrable);
    filtroCategoriasConceptos.classList.toggle("flex", esColeccionFiltrable);

    contenidoAcademia.innerHTML = "";

    if (esTarjetasConceptos) {
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

function actualizarProgresoLecturaConceptos() {
    if (!progresoLecturaConceptos) {
        return;
    }

    const cantidadLeidos = conceptosCiberHigiene.filter((concepto) =>
        conceptosLeidos.has(String(concepto.id))
    ).length;
    progresoLecturaConceptos.textContent =
        `${cantidadLeidos} de ${conceptosCiberHigiene.length} conceptos leídos`;
}

function actualizarProgresoLecturaMitos() {
    if (!progresoLecturaConceptos) {
        return;
    }

    const cantidadLeidos = mitosRealidades.filter((mito) =>
        mitosLeidos.has(String(mito.id))
    ).length;
    progresoLecturaConceptos.textContent =
        `${cantidadLeidos} de ${mitosRealidades.length} mitos leídos`;
}

function actualizarFiltroCategorias(elementos) {
    const categorias = [...new Set(
        elementos.map((elemento) => elemento.categoria).filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, "es"));
    const categoriaSeleccionada = selectCategoriaConceptos.value || "todas";
    selectCategoriaConceptos.replaceChildren();

    const opcionTodas = document.createElement("option");
    opcionTodas.value = "todas";
    opcionTodas.textContent = "Todas las categorías";
    selectCategoriaConceptos.appendChild(opcionTodas);

    categorias.forEach((categoria) => {
        const opcion = document.createElement("option");
        opcion.value = categoria;
        opcion.textContent = categoria;
        selectCategoriaConceptos.appendChild(opcion);
    });

    selectCategoriaConceptos.value = categorias.includes(categoriaSeleccionada)
        ? categoriaSeleccionada
        : "todas";

    return selectCategoriaConceptos.value;
}

function actualizarBotonLecturaConcepto(boton, leido, etiquetaLeida = "Leído") {
    boton.setAttribute("aria-pressed", String(leido));
    boton.classList.toggle("bg-emerald-500", leido);
    boton.classList.toggle("hover:bg-emerald-600", leido);
    boton.classList.toggle("bg-blue-500", !leido);
    boton.classList.toggle("hover:bg-blue-600", !leido);
    boton.innerHTML = `
        <span class="material-symbols-outlined text-base" aria-hidden="true">${leido ? "check_circle" : "checklist"}</span>
        ${leido ? etiquetaLeida : "Marcar como leído"}
    `;
}

function persistirEstadoConceptosLeidos() {
    const idUsuario = usuarioActual?.id_usuario ?? usuarioActual?.id;
    if (!idUsuario) {
        throw new Error("No se encontró el identificador de usuario para guardar el progreso.");
    }

    localStorage.setItem(
        `hades_conceptos_leidos_${idUsuario}`,
        JSON.stringify([...conceptosLeidos])
    );
}

function persistirEstadoMitosLeidos() {
    const idUsuario = usuarioActual?.id_usuario ?? usuarioActual?.id;
    if (!idUsuario) {
        throw new Error("No se encontró el identificador de usuario para guardar el progreso.");
    }

    localStorage.setItem(
        `hades_mitos_leidos_${idUsuario}`,
        JSON.stringify([...mitosLeidos])
    );
}

function cargarConceptosLeidos() {
    const idUsuario = usuarioActual?.id_usuario ?? usuarioActual?.id;
    if (!idUsuario) {
        throw new Error("No se encontró el identificador de usuario para cargar el progreso.");
    }

    try {
        const datos = localStorage.getItem(
            `hades_conceptos_leidos_${idUsuario}`
        );
        if (!datos) {
            return new Set();
        }

        const idsLeidos = JSON.parse(datos);
        if (!Array.isArray(idsLeidos)) {
            throw new Error("El progreso de lectura guardado no es válido.");
        }

        return new Set(idsLeidos.filter((id) => typeof id === "string"));
    } catch (error) {
        console.error("No se pudo leer el progreso de lectura guardado:", error);
        if (progresoLecturaConceptos) {
            progresoLecturaConceptos.textContent =
                "No se pudo cargar el progreso de lectura guardado.";
        }
        return new Set();
    }
}

function cargarMitosLeidos() {
    const idUsuario = usuarioActual?.id_usuario ?? usuarioActual?.id;
    if (!idUsuario) {
        throw new Error("No se encontró el identificador de usuario para cargar el progreso.");
    }

    try {
        const datos = localStorage.getItem(`hades_mitos_leidos_${idUsuario}`);
        if (!datos) {
            return new Set();
        }

        const idsLeidos = JSON.parse(datos);
        if (!Array.isArray(idsLeidos)) {
            throw new Error("El progreso de mitos guardado no es válido.");
        }

        return new Set(idsLeidos.filter((id) => typeof id === "string"));
    } catch (error) {
        console.error("No se pudo leer el progreso de mitos guardado:", error);
        if (progresoLecturaConceptos) {
            progresoLecturaConceptos.textContent =
                "No se pudo cargar el progreso de lectura guardado.";
        }
        return new Set();
    }
}

function cambiarEstadoConceptoLeido(idConcepto) {
    const id = String(idConcepto);
    const estabaLeido = conceptosLeidos.has(id);
    if (estabaLeido) {
        conceptosLeidos.delete(id);
    } else {
        conceptosLeidos.add(id);
    }

    try {
        persistirEstadoConceptosLeidos();
    } catch (error) {
        if (estabaLeido) {
            conceptosLeidos.add(id);
        } else {
            conceptosLeidos.delete(id);
        }
        console.error("No se pudo guardar el progreso de lectura:", error);
        progresoLecturaConceptos.textContent =
            "No se pudo guardar el progreso de lectura.";
        return;
    }

    actualizarProgresoLecturaConceptos();
    renderizarTarjetasConceptos();
    if (conceptoActualModal?.id === idConcepto) {
        actualizarBotonLecturaConcepto(
            btnMarcarConceptoLeidoModal,
            conceptosLeidos.has(id),
            "Marcar como no leído"
        );
    }
}

function cambiarEstadoMitoLeido(idMito) {
    const id = String(idMito);
    const estabaLeido = mitosLeidos.has(id);
    if (estabaLeido) {
        mitosLeidos.delete(id);
    } else {
        mitosLeidos.add(id);
    }

    try {
        persistirEstadoMitosLeidos();
    } catch (error) {
        if (estabaLeido) {
            mitosLeidos.add(id);
        } else {
            mitosLeidos.delete(id);
        }
        console.error("No se pudo guardar el progreso de mitos:", error);
        progresoLecturaConceptos.textContent =
            "No se pudo guardar el progreso de lectura.";
        return;
    }

    actualizarProgresoLecturaMitos();
    renderizarTarjetasMitos();
    if (mitoActualModal?.id === idMito) {
        actualizarBotonLecturaConcepto(
            btnMarcarConceptoLeidoModal,
            mitosLeidos.has(id),
            "Marcar como no leído"
        );
    }
}

function renderizarTarjetasConceptos() {
    contenidoAcademia.innerHTML = "";

    const categoriaSeleccionada =
        actualizarFiltroCategorias(conceptosCiberHigiene);

    const grilla = document.createElement("div");

    grilla.className =
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";

    const conceptosFiltrados = conceptosCiberHigiene.filter(
        (concepto) =>
            categoriaSeleccionada === "todas" ||
            concepto.categoria === categoriaSeleccionada
    );

    conceptosFiltrados.forEach((concepto) => {
        const tarjeta = document.createElement("article");
        tarjeta.className =
            `${concepto.color} border rounded-xl p-4 flex flex-col gap-3 hover:shadow-md transition-all`;

        const categoria = document.createElement("span");
        categoria.className = "text-xs font-bold opacity-70";
        categoria.textContent = concepto.categoria;

        const titulo = document.createElement("h4");
        titulo.className = "font-bold text-base";
        titulo.textContent = concepto.titulo;

        const acciones = document.createElement("div");
        acciones.className = "mt-auto grid grid-cols-2 gap-3 pt-2";

        const botonLeer = document.createElement("button");
        botonLeer.type = "button";
        botonLeer.className =
            "flex min-w-0 w-full items-center justify-center rounded-lg border border-current/20 px-2 py-2 text-center text-xs font-bold leading-tight transition-colors hover:bg-white/50";
        botonLeer.textContent = "Ver concepto";
        botonLeer.addEventListener("click", () => {
            mostrarModalConcepto(concepto);
        });

        const botonLeido = document.createElement("button");
        botonLeido.type = "button";
        botonLeido.className =
            "inline-flex min-w-0 w-full items-center justify-center gap-1 whitespace-normal rounded-lg px-2 py-2 text-center text-xs font-bold leading-tight text-white transition-colors";
        const idConcepto = String(concepto.id);
        actualizarBotonLecturaConcepto(
            botonLeido,
            conceptosLeidos.has(idConcepto)
        );
        botonLeido.addEventListener("click", () => {
            cambiarEstadoConceptoLeido(concepto.id);
        });

        acciones.append(botonLeer, botonLeido);
        tarjeta.append(categoria, titulo, acciones);

        grilla.appendChild(tarjeta);
    });

    actualizarProgresoLecturaConceptos();
    contenidoAcademia.appendChild(grilla);
}

function renderizarTarjetasMitos() {
    contenidoAcademia.innerHTML = "";
    const categoriaSeleccionada = actualizarFiltroCategorias(mitosRealidades);

    const grilla = document.createElement("div");

    grilla.className =
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";

    const mitosFiltrados = mitosRealidades.filter(
        (mito) =>
            categoriaSeleccionada === "todas" ||
            mito.categoria === categoriaSeleccionada
    );

    mitosFiltrados.forEach((mito) => {
        const tarjeta = document.createElement("article");
        tarjeta.className =
            `${mito.color} border rounded-xl p-4 flex flex-col gap-3 hover:shadow-md transition-all`;

        const categoria = document.createElement("span");
        categoria.className = "text-xs font-bold opacity-70";
        categoria.textContent = mito.categoria;

        const titulo = document.createElement("h4");
        titulo.className = "font-bold text-base";
        titulo.textContent = mito.mito;

        const acciones = document.createElement("div");
        acciones.className = "mt-auto grid grid-cols-2 gap-3 pt-2";

        const botonVerMito = document.createElement("button");
        botonVerMito.type = "button";
        botonVerMito.className =
            "flex min-w-0 w-full items-center justify-center rounded-lg border border-current/20 px-2 py-2 text-center text-xs font-bold leading-tight transition-colors hover:bg-white/50";
        botonVerMito.textContent = "Ver realidad";
        botonVerMito.addEventListener("click", () => {
            mostrarModalMito(mito);
        });

        const botonLeido = document.createElement("button");
        botonLeido.type = "button";
        botonLeido.className =
            "inline-flex min-w-0 w-full items-center justify-center gap-1 whitespace-normal rounded-lg px-2 py-2 text-center text-xs font-bold leading-tight text-white transition-colors";
        actualizarBotonLecturaConcepto(
            botonLeido,
            mitosLeidos.has(String(mito.id))
        );
        botonLeido.addEventListener("click", () => {
            cambiarEstadoMitoLeido(mito.id);
        });

        acciones.append(botonVerMito, botonLeido);
        tarjeta.append(categoria, titulo, acciones);
        grilla.appendChild(tarjeta);
    });

    actualizarProgresoLecturaMitos();
    contenidoAcademia.appendChild(grilla);
}

function iniciarTestNivel(dificultad) {
    const preguntas = preguntasTriviaSeguridad.filter(
        (pregunta) => pregunta.dificultad === dificultad
    );
    if (preguntas.length !== 10) {
        panelTestContenido.classList.add("hidden");
        contenidoTestNivel.replaceChildren();
        mensajeTestNivel.textContent =
            `El nivel ${dificultad} necesita 10 preguntas y actualmente tiene ${preguntas.length}. Para cargar las preguntas iniciales, ejecutá desde la raíz del proyecto: C:\\xampp\\php\\php.exe backend\\database\\seeds\\import_academy.php. Después, volvé a abrir Entrenamiento.`;
        mensajeTestNivel.classList.remove("hidden");
        opcionesDificultadTrivia
            .querySelectorAll("[data-dificultad-test]")
            .forEach((boton) => boton.setAttribute("aria-pressed", "false"));
        return;
    }

    mensajeTestNivel.classList.add("hidden");
    panelTestContenido.classList.remove("hidden");

    opcionesDificultadTrivia
        .querySelectorAll("[data-dificultad-test]")
        .forEach((boton) => {
            boton.setAttribute(
                "aria-pressed",
                String(boton.dataset.dificultadTest === dificultad)
            );
            boton.classList.toggle(
                "ring-4",
                boton.dataset.dificultadTest === dificultad
            );
        });

    renderizarTriviaSeguridad(contenidoTestNivel, preguntas);
    panelTestContenido.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderizarTriviaSeguridad(
    contenedorDestino = contenidoAcademia,
    preguntas = preguntasTriviaSeguridad
) {
    if (!contenedorDestino) {
        return;
    }

    respuestasTrivia = new Map();
    paginaTrivia = 0;
    triviaEvaluada = false;
    preguntasTriviaActivas = preguntas;
    renderizarPaginaTrivia(contenedorDestino);
}

function renderizarPaginaTrivia(contenedorDestino) {
    contenedorDestino.replaceChildren();

    const contenedorTrivia = document.createElement("div");
    contenedorTrivia.className = "space-y-5";

    const inicio = paginaTrivia * 5;
    const preguntasPagina = preguntasTriviaActivas.slice(inicio, inicio + 5);
    const listaPreguntas = document.createElement("div");
    listaPreguntas.id = "preguntasTriviaActuales";
    listaPreguntas.className = "space-y-5";

    const progreso = document.createElement("p");
    progreso.className = "text-sm font-bold text-slate-700 dark:text-slate-300";
    progreso.textContent =
        `Preguntas ${inicio + 1} a ${inicio + preguntasPagina.length} de ${preguntasTriviaActivas.length}`;
    listaPreguntas.appendChild(progreso);

    preguntasPagina.forEach((pregunta, indicePagina) => {
        const indicePregunta = inicio + indicePagina;
        const bloquePregunta = document.createElement("div");
        bloquePregunta.className =
            "rounded-xl border border-blue-100 bg-white p-5 text-slate-900 shadow-sm dark:border-blue-700/40 dark:bg-[#0b2340] dark:text-white";

        const opcionesHTML = pregunta.opciones
            .map((opcion, indiceOpcion) => `
                <label class="mt-3 flex cursor-pointer items-start gap-3 rounded-lg border border-gray-100 bg-blue-50 p-3 transition-colors hover:border-primary dark:border-blue-700/40 dark:bg-[#0f2b4a]">
                    <input
                        type="radio"
                        name="respuesta-${pregunta.id}"
                        value="${indiceOpcion}"
                        ${respuestasTrivia.get(String(pregunta.id)) === indiceOpcion ? "checked" : ""}
                        class="mt-1 text-primary focus:ring-primary"
                    />
                    <span class="text-sm text-slate-900 dark:text-white">${opcion}</span>
                </label>
            `)
            .join("");

        bloquePregunta.innerHTML = `
            <div class="flex items-start gap-3">
                <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    ${indicePregunta + 1}
                </div>
                <div class="flex-1">
                    <h4 class="font-bold text-primary dark:text-blue-300">${pregunta.pregunta}</h4>
                    <div>${opcionesHTML}</div>
                </div>
            </div>
        `;

        bloquePregunta
            .querySelectorAll(`input[name="respuesta-${pregunta.id}"]`)
            .forEach((opcion) => {
                opcion.addEventListener("change", () => {
                    respuestasTrivia.set(
                        String(pregunta.id),
                        Number(opcion.value)
                    );
                    actualizarAccionTrivia();
                });
            });

        listaPreguntas.appendChild(bloquePregunta);
    });

    contenedorTrivia.appendChild(listaPreguntas);

    const accionesTrivia = document.createElement("div");
    accionesTrivia.id = "accionesTrivia";
    accionesTrivia.className =
        "flex flex-col gap-4 rounded-xl border border-blue-100 bg-white/70 p-5 text-slate-900 dark:border-blue-900/40 dark:bg-[#0f1b36] dark:text-white md:flex-row md:items-center md:justify-between";
    accionesTrivia.innerHTML = `
        <div>
            <p class="font-bold">Respondé todas las preguntas de esta tanda para continuar.</p>
            <p class="text-sm text-slate-600 dark:text-slate-300">Tus respuestas se conservan al avanzar.</p>
        </div>
        <button
            id="btnAvanzarTrivia"
            type="button"
            class="hidden rounded-lg bg-primary px-6 py-3 font-bold text-white transition-colors hover:bg-primary/90"
        ></button>
    `;
    contenedorTrivia.appendChild(accionesTrivia);

    const resultadoTrivia = document.createElement("div");
    resultadoTrivia.id = "resultadoTriviaSeguridad";
    resultadoTrivia.className =
        "hidden rounded-xl border border-blue-100 bg-white p-5 text-slate-900 shadow-sm dark:border-blue-900/40 dark:bg-[#0f1b36] dark:text-white";
    contenedorTrivia.appendChild(resultadoTrivia);

    contenedorDestino.appendChild(contenedorTrivia);
    actualizarAccionTrivia();
}

function actualizarAccionTrivia() {
    const boton = document.getElementById("btnAvanzarTrivia");
    if (!boton) {
        return;
    }

    const inicio = paginaTrivia * 5;
    const preguntasPagina = preguntasTriviaActivas.slice(inicio, inicio + 5);
    const tandaCompleta = preguntasPagina.every((pregunta) =>
        respuestasTrivia.has(String(pregunta.id))
    );
    boton.classList.toggle("hidden", !tandaCompleta);
    const esUltimaPagina = inicio + preguntasPagina.length >=
        preguntasTriviaActivas.length;
    boton.textContent = esUltimaPagina ? "Finalizar test" : "Siguiente";
    boton.onclick = () => {
        if (!tandaCompleta) {
            return;
        }
        if (!esUltimaPagina) {
            paginaTrivia += 1;
            renderizarPaginaTrivia(contenidoTestNivel);
        } else {
            evaluarTriviaSeguridad();
        }
    };
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

    preguntasTriviaActivas.forEach((pregunta) => {
        const indiceSeleccionado = respuestasTrivia.get(String(pregunta.id));
        if (indiceSeleccionado === undefined) {
            preguntasSinResponder += 1;
            return;
        }

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
    document.getElementById("preguntasTriviaActuales")?.classList.add("hidden");
    document.getElementById("accionesTrivia")?.classList.add("hidden");

    const totalPreguntas = preguntasTriviaActivas.length;
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

                    <p class="text-xs text-outline mt-1">
                        Respuesta correcta: ${item.respuestaCorrecta}
                    </p>

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

    if (!usuarioActual || !window.hadesAPI?.guardarResultadoTriviaRemoto) {
        console.warn(
            "No se pudo guardar el resultado de la trivia porque no hay usuario o no está disponible la API."
        );
        return;
    }

    try {
        await window.hadesAPI.guardarResultadoTriviaRemoto({
            token: usuarioActual.token,
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
    conceptoActualModal = null;
    mitoActualModal = mito;
    btnMarcarConceptoLeidoModal.classList.remove("hidden");
    actualizarBotonLecturaConcepto(
        btnMarcarConceptoLeidoModal,
        mitosLeidos.has(String(mito.id)),
        "Marcar como no leído"
    );

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
    imagenConceptoAcademia.alt = `Imagen educativa de ${concepto.titulo}`;
    categoriaConceptoAcademia.textContent = concepto.categoria;
    tituloConceptoAcademia.textContent = concepto.titulo;
    descripcionConceptoAcademia.textContent = concepto.descripcion;
    recomendacionConceptoAcademia.textContent = concepto.recomendacion;
    conceptoActualModal = concepto;
    mitoActualModal = null;
    btnMarcarConceptoLeidoModal.classList.remove("hidden");
    actualizarBotonLecturaConcepto(
        btnMarcarConceptoLeidoModal,
        conceptosLeidos.has(String(concepto.id)),
        "Marcar como no leído"
    );

    modalConceptoAcademia.classList.remove("hidden");
}

function cerrarModalConcepto() {
    if (!modalConceptoAcademia) {
        return;
    }

    modalConceptoAcademia.classList.add("hidden");
    conceptoActualModal = null;
    mitoActualModal = null;
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

    if (opcionesDificultadTrivia) {
        opcionesDificultadTrivia.addEventListener("click", (event) => {
            const boton = event.target instanceof Element
                ? event.target.closest("[data-dificultad-test]")
                : null;
            if (boton) {
                iniciarTestNivel(boton.dataset.dificultadTest);
            }
        });
    }

    if (btnCerrarAcademia && panelAcademia) {
        btnCerrarAcademia.addEventListener("click", () => {
            panelAcademia.classList.add("hidden");
        });
    }

    if (selectCategoriaConceptos) {
        selectCategoriaConceptos.addEventListener("change", () => {
            if (tipoTarjetasAcademiaActual === "mitos") {
                renderizarTarjetasMitos();
            } else if (tipoTarjetasAcademiaActual === "conceptos") {
                renderizarTarjetasConceptos();
            }
        });
    }
}
        if (btnCerrarModalConcepto) {
            btnCerrarModalConcepto.addEventListener("click", cerrarModalConcepto);
        }

        if (btnMarcarConceptoLeidoModal) {
            btnMarcarConceptoLeidoModal.addEventListener("click", () => {
                if (conceptoActualModal) {
                    cambiarEstadoConceptoLeido(conceptoActualModal.id);
                } else if (mitoActualModal) {
                    cambiarEstadoMitoLeido(mitoActualModal.id);
                }
            });
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
    const container = document.getElementById("listaPresentaciones");
    container.replaceChildren();

    if (presentaciones.length === 0) {
        const emptyState = document.createElement("p");
        emptyState.className = "rounded-xl bg-blue-50 p-4 text-sm text-slate-700 dark:bg-[#142244] dark:text-slate-300";
        emptyState.textContent = "Todavía no hay diapositivas educativas publicadas.";
        container.appendChild(emptyState);
        return;
    }

    presentaciones.forEach((presentacion) => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "w-full rounded-xl border border-[#d2e3fc] p-4 text-left transition hover:bg-blue-50 dark:border-blue-900/40 dark:hover:bg-[#142244]";

        const title = document.createElement("span");
        title.className = "block font-bold";
        title.textContent = presentacion.titulo;

        const description = document.createElement("span");
        description.className = "mt-1 block text-sm text-slate-600 dark:text-slate-300";
        description.textContent = presentacion.descripcion || "";

        const count = document.createElement("span");
        count.className = "mt-2 block text-xs text-slate-500 dark:text-slate-400";
        count.textContent = `${presentacion.imagenes.length} diapositivas`;

        card.append(title, description, count);
        card.addEventListener("click", () => abrirPresentacion(presentacion));
        container.appendChild(card);
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
    document.getElementById("imagenPresentacion").src =
        presentacionActual.imagenes[diapositivaActual - 1];
}

document
    .getElementById("btnSiguienteDiapositiva")
    .addEventListener("click", () => {

        if (
            presentacionActual &&
            diapositivaActual < presentacionActual.imagenes.length
        ) {
            diapositivaActual++;
            actualizarDiapositiva();
        }
    });

document
    .getElementById("btnAnteriorDiapositiva")
    .addEventListener("click", () => {

        if (presentacionActual && diapositivaActual > 1) {
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

    // =========================================================================
    // SIMULADOR DE SMISHING / VISHING
    // =========================================================================
    let casoSVEvaluado = false;
    let escenarioSVActual = null;
    let ultimoEscenarioSVId = null;

    function renderizarSenalesSV() {
        if (!listaSenalesSV) return;
        listaSenalesSV.innerHTML = "";
        senalesDisponiblesSV.forEach((senal) => {
            const label = document.createElement("label");
            label.className = "flex items-start gap-3 p-3 bg-white dark:bg-[#0f1b36] rounded-lg border border-gray-100 dark:border-blue-900/40 cursor-pointer hover:border-purple-500 transition-colors text-slate-900 dark:text-white";
            label.innerHTML = `
                <input class="senalSV mt-1 rounded text-purple-600 focus:ring-purple-600 h-5 w-5" type="checkbox" value="${senal.id}" />
                <span class="text-sm">${senal.texto}</span>
            `;
            listaSenalesSV.appendChild(label);
        });
    }

    function obtenerEscenarioAleatorioSV() {
        const escenariosDelNivel = escenariosSV.filter(
            (escenario) => escenario.dificultad === activeDifficulty
        );
        const disponibles = escenariosDelNivel.filter((esc) => esc.id !== ultimoEscenarioSVId);
        if (!disponibles.length) return escenariosDelNivel[0];
        return disponibles[Math.floor(Math.random() * disponibles.length)];
    }

    function cargarEscenarioSV(escenario) {
        escenarioSVActual = escenario;
        ultimoEscenarioSVId = escenario.id;
        casoSVEvaluado = false;

        svRemitente.textContent = escenario.remitente;
        svTipoPantalla.textContent = escenario.tipoPantalla;
        svMensaje.textContent = escenario.mensaje;
        
        if (escenario.enlace) {
            svEnlace.textContent = escenario.enlace;
            svEnlace.classList.remove("hidden");
        } else {
            svEnlace.textContent = "";
            svEnlace.classList.add("hidden");
        }

        renderizarSenalesSV();
        
        document.querySelectorAll(".senalSV").forEach(c => c.checked = false);
        document.querySelectorAll('input[name="decisionSV"]').forEach(r => r.checked = false);
        
        resultadoSV.classList.add("hidden");
        detalleResultadoSV.innerHTML = "";
        mensajeErrorSV.classList.add("hidden");
    }

    function evaluarCasoSV() {
        if (casoSVEvaluado) return;
        
        const decisionSeleccionada = document.querySelector('input[name="decisionSV"]:checked')?.value;
        if (!decisionSeleccionada) {
            mensajeErrorSV.textContent = "Seleccioná si es legítimo o un fraude (Phishing).";
            mensajeErrorSV.classList.remove("hidden");
            return;
        }
        mensajeErrorSV.classList.add("hidden");

        const senalesSeleccionadas = Array.from(document.querySelectorAll(".senalSV:checked")).map(c => c.value);
        const presentes = escenarioSVActual.senalesPresentes;

        const correctas = senalesSeleccionadas.filter(s => presentes.includes(s));
        const incorrectas = senalesSeleccionadas.filter(s => !presentes.includes(s));
        const faltantes = presentes.filter(s => !senalesSeleccionadas.includes(s));

        resultadoSV.classList.remove("hidden");
        detalleResultadoSV.innerHTML = "";

        const esDecisionCorrecta = decisionSeleccionada === escenarioSVActual.decisionCorrecta;
        tituloResultadoSV.textContent = esDecisionCorrecta ? "¡Excelente detección!" : "Cuidado, debes estar más atento.";
        tituloResultadoSV.className = esDecisionCorrecta ? "font-bold mb-2 text-emerald-600 dark:text-emerald-400" : "font-bold mb-2 text-error";

        const pDec = document.createElement("p");
        pDec.textContent = esDecisionCorrecta 
            ? "✓ Clasificaste correctamente la situación." 
            : `✗ La clasificación correcta era: ${escenarioSVActual.decisionCorrecta === "ataque" ? "Fraude (Phishing)" : "Legítimo"}.`;
        detalleResultadoSV.appendChild(pDec);

        const explicacion = document.createElement("div");
        explicacion.innerHTML = `<p class="font-bold text-purple-600 dark:text-purple-400 mt-4">Explicación:</p>`;
        
        if (escenarioSVActual.decisionCorrecta === "legitimo") {
            const p = document.createElement("p");
            p.textContent = escenarioSVActual.explicaciones.legitimo;
            explicacion.appendChild(p);
        } else {
            presentes.forEach(s => {
                const p = document.createElement("p");
                p.textContent = "• " + escenarioSVActual.explicaciones[s];
                explicacion.appendChild(p);
            });
        }
        detalleResultadoSV.appendChild(explicacion);

        const puntaje =
            (presentes.length > 0
                ? (correctas.length / presentes.length) * 70
                : senalesSeleccionadas.length === 0 ? 70 : 0) +
            (esDecisionCorrecta ? 30 : 0);

        casoSVEvaluado = true;
        guardarResultadoSmishingVishing({
            puntaje: Math.round(puntaje),
            aciertos: correctas.length,
            errores: incorrectas.length + faltantes.length,
            decisionSeleccionada
        });
    }

    async function guardarResultadoSmishingVishing(resultado) {
        let usuario;
        try {
            usuario = JSON.parse(
                localStorage.getItem("hades_usuario_activo") || "null"
            );
        } catch (error) {
            console.error("No se pudo leer el usuario activo:", error);
            return;
        }

        if (!usuario?.token || !window.hadesAPI?.guardarResultadoPhishingRemoto) {
            console.error(
                "No se pudo guardar el resultado de smishing/vishing: falta la sesión o la API."
            );
            return;
        }

        try {
            await window.hadesAPI.guardarResultadoPhishingRemoto({
                token: usuario.token,
                id_escenario: escenarioSVActual.id,
                tipo_escenario: "smishing_vishing",
                dificultad: escenarioSVActual.dificultad,
                decision_usuario: resultado.decisionSeleccionada,
                decision_correcta: escenarioSVActual.decisionCorrecta,
                puntaje: resultado.puntaje,
                aciertos: resultado.aciertos,
                errores: resultado.errores
            });
        } catch (error) {
            console.error(
                "No se pudo guardar el resultado de smishing/vishing:",
                error
            );
        }
    }

    function iniciarSimuladorSV() {
        if (!svRemitente || !btnEvaluarSV || !btnNuevoCasoSV) return;
        
        btnEvaluarSV.addEventListener("click", evaluarCasoSV);
        btnNuevoCasoSV.addEventListener("click", () => cargarEscenarioSV(obtenerEscenarioAleatorioSV()));
        
    }
    // =========================================================================

    async function iniciarEntrenamientoConContenidoRemoto() {
        try {
            const usuario = JSON.parse(
                localStorage.getItem("hades_usuario_activo") || "null"
            );

            if (!usuario?.token) {
                throw new Error("No se encontró una sesión activa.");
            }

            usuarioActual = usuario;

            const respuesta =
                await window.hadesAPI.obtenerContenidoAcademiaRemoto(
                    usuario.token
                );
            const contenido = respuesta?.contenido;
            const tiposDeLista = [
                "scenario_sv",
                "scenario_phishing",
                "concept",
                "myth",
                "trivia"
            ];

            if (
                !contenido ||
                tiposDeLista.some(
                    (tipo) =>
                        !Array.isArray(contenido[tipo]) ||
                        contenido[tipo].length === 0
                ) ||
                !contenido.section ||
                typeof contenido.section !== "object"
            ) {
                throw new Error(
                    "El servidor no devolvió todos los contenidos necesarios."
                );
            }
            if (!Array.isArray(contenido.presentation)) {
                throw new Error(
                    "El servidor no devolvió una lista válida de diapositivas educativas."
                );
            }
            if (
                contenido.presentation.some(
                    (presentation) =>
                        !presentation ||
                        typeof presentation.titulo !== "string" ||
                        !Array.isArray(presentation.imagenes) ||
                        presentation.imagenes.length === 0 ||
                        presentation.imagenes.some(
                            (image) => typeof image !== "string" || image.trim() === ""
                        )
                )
            ) {
                throw new Error(
                    "El servidor devolvió una presentación sin título o con rutas de imágenes inválidas."
                );
            }

            for (const clave of [
                "ciberHigiene",
                "mitos",
                "anatomiaAtaque",
                "testNivel",
                "verTodos"
            ]) {
                if (!Object.prototype.hasOwnProperty.call(contenido.section, clave)) {
                    throw new Error(
                        `Falta la sección "${clave}" en el contenido de la academia.`
                    );
                }
            }

            escenariosSV = contenido.scenario_sv;
            escenariosPhishing = contenido.scenario_phishing;
            conceptosCiberHigiene = contenido.concept;
            conceptosLeidos = cargarConceptosLeidos();
            mitosRealidades = contenido.myth;
            mitosLeidos = cargarMitosLeidos();
            preguntasTriviaSeguridad = contenido.trivia;
            contenidosAcademia = contenido.section;
            presentaciones = contenido.presentation;

            iniciarAcademiaDigital();
            iniciarSimuladorPhishing();
            iniciarSimuladorSV();
        } catch (error) {
            console.error(
                "No se pudo cargar el contenido de la academia:",
                error
            );
            window.alert(
                `No se pudo cargar la academia desde el servidor. Verificá tu conexión e intentá nuevamente.\n\n${error.message}`
            );
        }
    }

    iniciarEntrenamientoConContenidoRemoto();
    
});