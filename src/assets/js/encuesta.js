document.addEventListener("DOMContentLoaded", () => {
    const preguntas = [
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
    const questionsElement = document.getElementById("encuestaPreguntas");
    const form = document.getElementById("formularioEncuesta");
    const messageElement = document.getElementById("mensajeEncuesta");
    const saveButton = document.getElementById("guardarEncuesta");
    const saveButtonLabel = document.getElementById("textoGuardarEncuesta");
    let hasSavedSurvey = false;

    function obtenerUsuarioActivoDesdeSesion() {
        const savedUser = localStorage.getItem("hades_usuario_activo");
        if (!savedUser) {
            return null;
        }

        try {
            return JSON.parse(savedUser);
        } catch (error) {
            console.error("No se pudo leer el usuario activo:", error);
            localStorage.removeItem("hades_usuario_activo");
            return null;
        }
    }

    function showMessage(message, isError = false) {
        messageElement.textContent = message;
        messageElement.className = `mt-5 rounded-xl border p-4 text-sm ${
            isError
                ? "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-200"
                : "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
        }`;
    }

    function buildQuestions(answers = []) {
        questionsElement.replaceChildren();

        preguntas.forEach((question, index) => {
            const number = index + 1;
            const fieldset = document.createElement("fieldset");
            fieldset.className = "rounded-xl border border-indigo-200 bg-indigo-50 p-4 shadow-sm dark:border-indigo-800 dark:bg-[#0e1e3e] sm:p-5";

            const legend = document.createElement("legend");
            legend.className = "max-w-full px-2 font-bold leading-6 text-indigo-950 dark:text-indigo-100";
            legend.textContent = `${number}. ${question}`;

            const choices = document.createElement("div");
            choices.className = "mt-4 grid grid-cols-5 gap-2";

            for (let value = 1; value <= 5; value += 1) {
                const label = document.createElement("label");
                label.className = "flex min-h-14 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-blue-300 bg-white text-sm font-semibold text-blue-950 shadow-sm transition hover:border-blue-600 hover:bg-blue-100 focus-within:ring-2 focus-within:ring-blue-500 has-[:checked]:border-blue-700 has-[:checked]:bg-blue-700 has-[:checked]:text-white has-[:checked]:ring-2 has-[:checked]:ring-blue-300 dark:border-blue-700 dark:bg-[#1a3162] dark:text-blue-100 dark:hover:border-blue-300 dark:hover:bg-[#23467d] dark:focus-within:ring-blue-300 dark:has-[:checked]:border-blue-300 dark:has-[:checked]:bg-blue-300 dark:has-[:checked]:text-[#07152e] dark:has-[:checked]:ring-blue-800";

                const input = document.createElement("input");
                input.type = "radio";
                input.name = `respuesta-${number}`;
                input.value = String(value);
                input.required = true;
                input.checked = answers[index] === value;
                input.className = "sr-only";
                input.setAttribute(
                    "aria-label",
                    `${value}: ${value === 1
                        ? "Totalmente en desacuerdo"
                        : value === 5
                            ? "Totalmente de acuerdo"
                            : "Valoración intermedia"}`
                );

                const valueLabel = document.createElement("span");
                valueLabel.textContent = String(value);
                label.append(input, valueLabel);
                choices.appendChild(label);
            }

            fieldset.append(legend, choices);
            questionsElement.appendChild(fieldset);
        });
    }

    async function loadSurvey() {
        const user = obtenerUsuarioActivoDesdeSesion();
        if (!user?.token) {
            return;
        }

        try {
            const result = await window.hadesAPI.obtenerEncuestaUsabilidadRemota(user.token);
            if (result.encuesta) {
                hasSavedSurvey = true;
                buildQuestions(result.encuesta.respuestas);
                saveButtonLabel.textContent = "Actualizar mi valoración";
                showMessage("Ya respondiste esta encuesta. Podés actualizar tus respuestas cuando quieras.");
            }
        } catch (error) {
            console.error("No se pudo cargar la encuesta de usabilidad:", error);
            showMessage(error.message || "No se pudo consultar tu respuesta guardada.", true);
        }
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const user = obtenerUsuarioActivoDesdeSesion();
        if (!user?.token) {
            showMessage("Iniciá sesión nuevamente para guardar tu valoración.", true);
            return;
        }

        const answers = preguntas.map((_, index) => {
            const selected = form.querySelector(`input[name="respuesta-${index + 1}"]:checked`);
            return selected ? Number(selected.value) : null;
        });
        if (answers.some((answer) => answer === null)) {
            showMessage("Completá las diez preguntas antes de guardar.", true);
            return;
        }

        saveButton.disabled = true;
        try {
            await window.hadesAPI.guardarEncuestaUsabilidadRemota({
                token: user.token,
                respuestas: answers
            });
            const wasUpdate = hasSavedSurvey;
            hasSavedSurvey = true;
            saveButtonLabel.textContent = "Actualizar mi valoración";
            showMessage(wasUpdate
                ? "Tu valoración se actualizó correctamente."
                : "Tu valoración se guardó correctamente. Gracias por ayudarnos a mejorar HADES.");
        } catch (error) {
            console.error("No se pudo guardar la encuesta de usabilidad:", error);
            showMessage(error.message || "No se pudo guardar tu valoración. Intentá nuevamente.", true);
        } finally {
            saveButton.disabled = false;
        }
    });

    buildQuestions();
    loadSurvey();
});
