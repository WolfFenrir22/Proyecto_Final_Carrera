(() => {
    const contentTypes = {
        scenario_sv: "Smishing / vishing",
        scenario_phishing: "Phishing",
        concept: "Concepto",
        myth: "Mito y realidad",
        trivia: "Pregunta de trivia",
        section: "Sección"
    };
    const fieldDefinitions = {
        scenario_sv: [
            { name: "id", label: "ID del escenario", type: "number", required: true },
            { name: "tipo", label: "Tipo de caso", type: "select", options: ["smishing", "vishing", "legitimo"] },
            { name: "dificultad", label: "Dificultad", type: "select", options: ["Básico", "Intermedio", "Avanzado"] },
            { name: "remitente", label: "Remitente o número", type: "text", required: true },
            { name: "tipoPantalla", label: "Formato del caso", type: "text", required: true, help: "Ejemplo: Mensaje de texto (SMS)." },
            { name: "mensaje", label: "Mensaje recibido", type: "textarea", required: true, fullWidth: true },
            { name: "enlace", label: "Enlace", type: "nullableText", help: "Dejalo vacío si el caso no tiene enlace." },
            { name: "senalesPresentes", label: "Señales presentes", type: "list", help: "Una señal por línea. Usá identificadores simples, por ejemplo: sv_urgencia." },
            { name: "decisionCorrecta", label: "Clasificación correcta", type: "select", options: ["ataque", "legitimo"] },
            { name: "explicaciones", label: "Explicación de cada señal", type: "pairs", fullWidth: true, help: "Una por línea, con el formato identificador: explicación. Para un caso legítimo, usá la clave legitimo." }
        ],
        scenario_phishing: [
            { name: "id", label: "ID del escenario", type: "number", required: true },
            { name: "tipo", label: "Tipo de caso", type: "select", options: ["phishing", "legitimo"] },
            { name: "dificultad", label: "Dificultad", type: "select", options: ["Básico", "Intermedio", "Avanzado"] },
            { name: "remitente", label: "Remitente", type: "text", required: true, fullWidth: true },
            { name: "asunto", label: "Asunto", type: "text", fullWidth: true },
            { name: "saludo", label: "Saludo", type: "text" },
            { name: "textoBoton", label: "Texto del botón", type: "text" },
            { name: "mensajePrincipal", label: "Mensaje principal", type: "textarea", required: true, fullWidth: true },
            { name: "enlace", label: "Enlace", type: "nullableText", help: "Dejalo vacío si el mensaje no contiene un enlace." },
            { name: "mensajeFinal", label: "Mensaje de cierre", type: "textarea", fullWidth: true },
            { name: "adjunto", label: "Nombre del archivo adjunto", type: "nullableText", help: "Dejalo vacío si el caso no tiene un archivo adjunto." },
            { name: "senalesPresentes", label: "Señales presentes", type: "list", help: "Una señal por línea, por ejemplo: dominio_falso." },
            { name: "decisionCorrecta", label: "Clasificación correcta", type: "select", options: ["phishing", "legitimo"] },
            { name: "explicaciones", label: "Explicación de cada señal", type: "pairs", fullWidth: true, help: "Una por línea, con el formato identificador: explicación. Para un caso legítimo, usá la clave legitimo." }
        ],
        concept: [
            { name: "id", label: "Identificador", type: "text", required: true, help: "Sin espacios; se usa para identificar el concepto." },
            { name: "titulo", label: "Título", type: "text", required: true },
            { name: "categoria", label: "Categoría", type: "text", required: true },
            { name: "color", label: "Estilo visual", type: "text", help: "Clase CSS opcional utilizada por la tarjeta." },
            { name: "imagen", label: "URL de imagen", type: "nullableText", fullWidth: true },
            { name: "descripcion", label: "Descripción", type: "textarea", required: true, fullWidth: true },
            { name: "recomendacion", label: "Recomendación práctica", type: "textarea", required: true, fullWidth: true }
        ],
        myth: [
            { name: "id", label: "Identificador", type: "text", required: true, help: "Sin espacios; se usa para identificar el mito." },
            { name: "mito", label: "Mito", type: "textarea", required: true, fullWidth: true },
            { name: "realidad", label: "Realidad", type: "textarea", required: true, fullWidth: true },
            { name: "categoria", label: "Categoría", type: "text", required: true },
            { name: "color", label: "Estilo visual", type: "text", help: "Clase CSS opcional utilizada por la tarjeta." },
            { name: "imagen", label: "URL de imagen", type: "nullableText", fullWidth: true },
            { name: "explicacion", label: "Explicación", type: "textarea", required: true, fullWidth: true },
            { name: "recomendacion", label: "Recomendación práctica", type: "textarea", required: true, fullWidth: true }
        ],
        trivia: [
            { name: "id", label: "Identificador", type: "text", required: true, help: "Sin espacios; se usa para identificar la pregunta." },
            { name: "pregunta", label: "Pregunta", type: "textarea", required: true, fullWidth: true },
            { name: "opciones", label: "Opciones de respuesta", type: "list", required: true, help: "Escribí una opción por línea. Se necesitan al menos dos." , fullWidth: true },
            { name: "respuestaCorrecta", label: "Número de la respuesta correcta", type: "number", required: true, help: "La primera opción es 0, la segunda es 1 y así sucesivamente." },
            { name: "explicacion", label: "Explicación de la respuesta", type: "textarea", required: true, fullWidth: true }
        ],
        section: [
            { name: "categoria", label: "Categoría", type: "text", required: true },
            { name: "titulo", label: "Título", type: "text", required: true, fullWidth: true },
            { name: "descripcion", label: "Descripción", type: "textarea", required: true, fullWidth: true },
            { name: "tipo", label: "Presentación", type: "select", options: ["tarjetasConceptos", "tarjetasMitos", "tarjetasInfografias", "triviaSeguridad"] },
            { name: "contenido", label: "Bloques de contenido", type: "content", fullWidth: true, help: "Una entrada por línea con el formato subtítulo | texto. Dejalo vacío si no hay bloques." },
            { name: "recomendaciones", label: "Recomendaciones", type: "list", help: "Una recomendación por línea.", fullWidth: true }
        ]
    };

    const message = document.getElementById("mensajeContenidoAdmin");
    const list = document.getElementById("listaContenidosAdmin");
    const modal = document.getElementById("modalContenido");
    const form = document.getElementById("formularioContenido");
    const formError = document.getElementById("errorFormularioContenido");
    const saveButton = document.getElementById("guardarContenido");
    const filter = document.getElementById("filtroTipoContenido");
    const typeSelect = document.getElementById("contenidoTipo");
    const payloadFields = document.getElementById("camposContenido");
    const contentKey = document.getElementById("contenidoClave");
    const helpFields = document.getElementById("ayudaCamposContenido");
    let token = null;
    let records = [];
    let keyWasEdited = false;

    document.getElementById("cerrarSesionAdminMobile")?.addEventListener("click", () => {
        document.getElementById("cerrarSesionAdmin")?.click();
    });

    function showMessage(text, isError = false) {
        message.textContent = text;
        message.className = `mb-5 rounded-xl p-4 text-sm ${
            isError
                ? "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200"
                : "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
        }`;
    }

    function hideModal() {
        modal.classList.add("hidden");
        formError.classList.add("hidden");
        formError.textContent = "";
        form.reset();
        typeSelect.disabled = false;
        keyWasEdited = false;
    }

    function slugify(value) {
        return String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9_-]+/g, "_")
            .replace(/^[_-]+|[_-]+$/g, "")
            .slice(0, 100);
    }

    function currentKeySource() {
        const firstField = {
            scenario_sv: "id",
            scenario_phishing: "id",
            concept: "id",
            myth: "id",
            trivia: "id",
            section: "titulo"
        }[typeSelect.value];
        const field = payloadFields.querySelector(`[data-payload-field="${firstField}"]`);
        return field?.value || contentTypes[typeSelect.value];
    }

    function updateGeneratedKey() {
        if (keyWasEdited) return;
        const key = slugify(`${typeSelect.value}_${currentKeySource()}`);
        contentKey.value = key;
    }

    function fieldValue(definition, payload) {
        const value = payload[definition.name];
        if (value !== undefined && value !== null) return value;
        if (definition.type === "list" || definition.type === "pairs" || definition.type === "content") return [];
        if (definition.type === "number") return definition.name === "respuestaCorrecta" ? 0 : "";
        return definition.options?.[0] || "";
    }

    function serializeFieldValue(definition, value) {
        if (definition.type === "number") return value === "" ? null : Number(value);
        if (definition.type === "nullableText") return value.trim() || null;
        if (definition.type === "list") {
            return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
        }
        if (definition.type === "pairs" || definition.type === "content") {
            return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
                const separator = line.indexOf(definition.type === "content" ? "|" : ":");
                if (separator < 1 || !line.slice(separator + 1).trim()) {
                    throw new Error(
                        definition.type === "content"
                            ? "Cada bloque debe tener el formato subtítulo | texto."
                            : "Cada explicación debe tener el formato identificador: explicación."
                    );
                }
                const key = line.slice(0, separator).trim();
                const text = line.slice(separator + 1).trim();
                if (definition.type === "content") return { subtitulo: key, texto: text };
                return [key, text];
            }).reduce((result, item) => {
                if (definition.type === "content") {
                    result.push(item);
                    return result;
                }
                if (Object.prototype.hasOwnProperty.call(result, item[0])) {
                    throw new Error(`La explicación "${item[0]}" está repetida.`);
                }
                result[item[0]] = item[1];
                return result;
            }, definition.type === "content" ? [] : {});
        }
        return value.trim();
    }

    function displayFieldValue(definition, value) {
        if (definition.type === "list") return Array.isArray(value) ? value.join("\n") : "";
        if (definition.type === "pairs") {
            return value && typeof value === "object" && !Array.isArray(value)
                ? Object.entries(value).map(([key, text]) => `${key}: ${text}`).join("\n")
                : "";
        }
        if (definition.type === "content") {
            return Array.isArray(value)
                ? value.map((item) => `${item.subtitulo || ""} | ${item.texto || ""}`).join("\n")
                : "";
        }
        return value ?? "";
    }

    function renderPayloadFields(type, payload = {}) {
        payloadFields.replaceChildren();
        helpFields.textContent = {
            scenario_sv: "Completá el mensaje y las señales que deberá reconocer la persona.",
            scenario_phishing: "Armá el correo simulado y asociá cada señal con su explicación.",
            concept: "Describí el concepto y una acción práctica para aplicar.",
            myth: "Presentá la creencia, su realidad y cómo actuar correctamente.",
            trivia: "Agregá las opciones en orden e indicá el índice de la correcta (empezando desde 0).",
            section: "Configurá la sección de la academia y sus bloques o recomendaciones."
        }[type];

        fieldDefinitions[type].forEach((definition) => {
            const wrapper = document.createElement("label");
            wrapper.className = `block text-sm font-bold ${definition.fullWidth ? "sm:col-span-2" : ""}`;
            wrapper.textContent = definition.label;
            const fieldId = `payload-${definition.name}`;
            const initialValue = displayFieldValue(definition, fieldValue(definition, payload));
            let control;

            if (definition.type === "select") {
                control = document.createElement("select");
                definition.options.forEach((option) => {
                    const optionElement = document.createElement("option");
                    optionElement.value = option;
                    optionElement.textContent = option;
                    control.appendChild(optionElement);
                });
                control.value = String(initialValue);
            } else if (["textarea", "list", "pairs", "content"].includes(definition.type)) {
                control = document.createElement("textarea");
                control.rows = definition.type === "textarea" ? 3 : 4;
                control.value = String(initialValue);
            } else {
                control = document.createElement("input");
                control.type = definition.type === "number" ? "number" : "text";
                if (definition.type === "number") control.min = "0";
                control.value = String(initialValue);
            }

            control.id = fieldId;
            control.dataset.payloadField = definition.name;
            control.required = Boolean(definition.required);
            control.className = "mt-2 w-full rounded-xl border border-[#a4c9f7] bg-[#f0f7ff] font-normal text-slate-900 focus:border-blue-500 focus:ring-blue-500 dark:border-[#2d549a] dark:bg-[#1a3162] dark:text-white";
            wrapper.appendChild(control);
            if (definition.help) {
                const help = document.createElement("span");
                help.className = "mt-1 block font-normal text-slate-600 dark:text-slate-300";
                help.textContent = definition.help;
                wrapper.appendChild(help);
            }
            payloadFields.appendChild(wrapper);

            if (definition.name === "id" || definition.name === "titulo") {
                control.addEventListener("input", updateGeneratedKey);
            }
        });
        updateGeneratedKey();
    }

    function nextPayloadId(type) {
        const ids = records
            .filter((record) => record.tipo === type)
            .map((record) => Number(record.payload.id))
            .filter(Number.isInteger);
        return ids.length ? Math.max(...ids) + 1 : 1;
    }

    function openCreateForm() {
        form.reset();
        document.getElementById("contenidoId").value = "";
        document.getElementById("contenidoOrden").value = "0";
        document.getElementById("contenidoActivo").value = "true";
        typeSelect.disabled = false;
        keyWasEdited = false;
        typeSelect.value = "scenario_phishing";
        renderPayloadFields(typeSelect.value, { id: nextPayloadId(typeSelect.value) });
        document.getElementById("tituloFormularioContenido").textContent = "Nuevo contenido";
        formError.classList.add("hidden");
        modal.classList.remove("hidden");
        contentKey.focus();
    }

    function openEditForm(record) {
        form.reset();
        document.getElementById("contenidoId").value = String(record.id);
        typeSelect.value = record.tipo;
        typeSelect.disabled = true;
        document.getElementById("contenidoClave").value = record.clave;
        keyWasEdited = true;
        document.getElementById("contenidoOrden").value = String(record.orden);
        document.getElementById("contenidoActivo").value = String(record.activo);
        renderPayloadFields(record.tipo, record.payload);
        document.getElementById("tituloFormularioContenido").textContent = "Editar contenido";
        formError.classList.add("hidden");
        modal.classList.remove("hidden");
        payloadFields.querySelector("input, select, textarea")?.focus();
    }

    function actionButton(label, icon, className, action) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold ${className}`;
        const iconElement = document.createElement("span");
        iconElement.className = "material-symbols-outlined text-base";
        iconElement.textContent = icon;
        button.append(iconElement, document.createTextNode(label));
        button.addEventListener("click", action);
        return button;
    }

    function renderRecords() {
        const selectedType = filter.value;
        const filtered = records.filter((record) => !selectedType || record.tipo === selectedType);
        document.getElementById("contadorContenido").textContent =
            `${filtered.length} de ${records.length} contenidos`;
        list.replaceChildren();

        if (!filtered.length) {
            const empty = document.createElement("p");
            empty.className = "col-span-full rounded-2xl border border-dashed border-[#94bdf2] bg-white p-10 text-center text-slate-600 dark:border-[#2b4e80] dark:bg-[#14254b] dark:text-slate-300";
            empty.textContent = "No hay contenidos para mostrar. Creá uno nuevo para comenzar.";
            list.appendChild(empty);
            return;
        }

        filtered.forEach((record) => {
            const card = document.createElement("article");
            card.className = "rounded-2xl border border-[#b8d2f4] bg-white p-5 shadow-sm dark:border-[#2b4e80] dark:bg-[#14254b]";
            const header = document.createElement("div");
            header.className = "mb-4 flex items-start justify-between gap-3";
            const titleBlock = document.createElement("div");
            const type = document.createElement("p");
            type.className = "mb-1 text-xs font-extrabold uppercase tracking-widest text-blue-700 dark:text-blue-300";
            type.textContent = contentTypes[record.tipo] || record.tipo;
            const title = document.createElement("h2");
            title.className = "font-extrabold";
            title.textContent = record.payload.titulo || record.payload.pregunta || record.payload.mito || record.clave;
            const key = document.createElement("p");
            key.className = "mt-1 break-all font-mono text-xs text-slate-600 dark:text-slate-300";
            key.textContent = record.clave;
            titleBlock.append(type, title, key);
            const status = document.createElement("span");
            status.className = `shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                record.activo
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            }`;
            status.textContent = record.activo ? "Publicado" : "Borrador";
            header.append(titleBlock, status);

            const preview = document.createElement("p");
            preview.className = "mb-4 line-clamp-3 min-h-12 whitespace-pre-line rounded-xl bg-[#f0f7ff] p-3 text-sm text-slate-700 dark:bg-[#0e1e3e] dark:text-slate-200";
            preview.textContent = record.payload.descripcion
                || record.payload.pregunta
                || record.payload.mensajePrincipal
                || record.payload.mensaje
                || record.payload.realidad
                || record.payload.explicacion
                || "Sin descripción adicional.";
            const actions = document.createElement("div");
            actions.className = "flex flex-wrap gap-2 border-t border-[#d1e5fa] pt-4 dark:border-[#2b4e80]";
            actions.append(
                actionButton("Editar", "edit", "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-200 dark:hover:bg-blue-900/70", () => openEditForm(record)),
                actionButton(
                    record.activo ? "Pasar a borrador" : "Publicar",
                    record.activo ? "visibility_off" : "publish",
                    "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-200 dark:hover:bg-emerald-900/70",
                    () => updateRecord(record, { activo: !record.activo })
                ),
                actionButton("Eliminar", "delete", "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/50 dark:text-red-200 dark:hover:bg-red-900/70", () => deleteRecord(record))
            );
            card.append(header, preview, actions);
            list.appendChild(card);
        });
    }

    async function loadRecords() {
        try {
            const data = await window.hadesAPI.administrarContenidoRemoto("GET", { token });
            records = data.contenidos;
            renderRecords();
            message.classList.add("hidden");
        } catch (error) {
            console.error("No se pudieron cargar los contenidos:", error);
            showMessage(error.message || "No se pudieron cargar los contenidos.", true);
        }
    }

    function recordInput() {
        const type = typeSelect.value;
        const payload = {};
        fieldDefinitions[type].forEach((definition) => {
            const control = payloadFields.querySelector(`[data-payload-field="${definition.name}"]`);
            payload[definition.name] = serializeFieldValue(definition, control.value);
        });

        if (type === "trivia" && payload.opciones.length < 2) {
            throw new Error("La trivia debe tener al menos dos opciones de respuesta.");
        }
        if (type === "trivia" && payload.respuestaCorrecta >= payload.opciones.length) {
            throw new Error("La respuesta correcta debe señalar una de las opciones ingresadas.");
        }

        const key = contentKey.value.trim() || slugify(`${type}_${currentKeySource()}`);
        if (!key || !/^[A-Za-z0-9_-]{1,100}$/.test(key)) {
            throw new Error("La clave debe tener hasta 100 letras, números, guiones o guiones bajos.");
        }

        return {
            tipo: type,
            clave: key,
            orden: Number(document.getElementById("contenidoOrden").value),
            activo: document.getElementById("contenidoActivo").value === "true",
            payload
        };
    }

    async function updateRecord(record, changes) {
        try {
            await window.hadesAPI.administrarContenidoRemoto("PATCH", {
                token,
                id: record.id,
                tipo: record.tipo,
                clave: record.clave,
                orden: record.orden,
                activo: changes.activo ?? record.activo,
                payload: record.payload
            });
            showMessage(changes.activo ? "El contenido se publicó." : "El contenido pasó a borrador.");
            await loadRecords();
        } catch (error) {
            console.error("No se pudo actualizar el contenido:", error);
            showMessage(error.message || "No se pudo actualizar el contenido.", true);
        }
    }

    async function deleteRecord(record) {
        const title = record.payload.titulo || record.payload.pregunta || record.payload.mito || record.clave;
        if (!window.confirm(`¿Eliminar definitivamente "${title}"?`)) return;
        try {
            await window.hadesAPI.administrarContenidoRemoto("DELETE", {
                token,
                id: record.id
            });
            showMessage("El contenido se eliminó correctamente.");
            await loadRecords();
        } catch (error) {
            console.error("No se pudo eliminar el contenido:", error);
            showMessage(error.message || "No se pudo eliminar el contenido.", true);
        }
    }

    document.getElementById("nuevoContenido").addEventListener("click", openCreateForm);
    document.getElementById("cerrarModalContenido").addEventListener("click", hideModal);
    document.getElementById("cancelarContenido").addEventListener("click", hideModal);
    filter.addEventListener("change", renderRecords);
    typeSelect.addEventListener("change", () => renderPayloadFields(typeSelect.value));
    contentKey.addEventListener("input", () => {
        keyWasEdited = contentKey.value.trim() !== "";
    });
    modal.addEventListener("click", (event) => {
        if (event.target === modal) hideModal();
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        formError.classList.add("hidden");
        saveButton.disabled = true;
        try {
            const record = recordInput();
            const id = document.getElementById("contenidoId").value;
            await window.hadesAPI.administrarContenidoRemoto(id ? "PATCH" : "POST", {
                token,
                ...(id ? { id: Number(id) } : {}),
                ...record
            });
            hideModal();
            showMessage(id ? "El contenido se actualizó correctamente." : "El contenido se creó correctamente.");
            await loadRecords();
        } catch (error) {
            console.error("No se pudo guardar el contenido:", error);
            formError.textContent = error.message || "No se pudo guardar el contenido.";
            formError.classList.remove("hidden");
        } finally {
            saveButton.disabled = false;
        }
    });

    window.addEventListener("hades-admin-session-ready", (event) => {
        token = event.detail.token;
        loadRecords();
    }, { once: true });
})();
