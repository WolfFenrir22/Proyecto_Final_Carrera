(() => {
    const metricsElement = document.getElementById("metricasAdmin");
    const messageElement = document.getElementById("mensajeAnaliticas");
    const activityElement = document.getElementById("graficoActividad");
    const contentTypesElement = document.getElementById("tiposContenido");
    const usersElement = document.getElementById("usuariosRecientes");
    const surveyScoresElement = document.getElementById("puntajesEncuestaUsabilidad");
    const refreshButton = document.getElementById("actualizarAnaliticas");

    document.getElementById("cerrarSesionAdminMobile")?.addEventListener("click", () => {
        document.getElementById("cerrarSesionAdmin")?.click();
    });

    function showMessage(message, isError = true) {
        messageElement.textContent = message;
        messageElement.className = `mb-5 rounded-xl p-4 text-sm ${
            isError
                ? "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200"
                : "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
        }`;
    }

    function renderMetric(label, value, icon, color) {
        const card = document.createElement("article");
        card.className = "rounded-2xl border border-[#b8d2f4] bg-white p-5 shadow-sm dark:border-[#2b4e80] dark:bg-[#14254b]";
        const top = document.createElement("div");
        top.className = "flex items-center justify-between";
        const title = document.createElement("p");
        title.className = "text-sm font-bold text-slate-600 dark:text-slate-300";
        title.textContent = label;
        const iconElement = document.createElement("span");
        iconElement.className = `material-symbols-outlined rounded-xl p-2 ${color}`;
        iconElement.textContent = icon;
        const number = document.createElement("p");
        number.className = "mt-4 text-3xl font-extrabold";
        number.textContent = String(value);
        top.append(title, iconElement);
        card.append(top, number);
        return card;
    }

    function renderActivity(rows) {
        activityElement.replaceChildren();
        const days = Array.from({ length: 7 }, (_, index) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - index));
            const key = date.toISOString().slice(0, 10);
            return rows.find((row) => row.fecha === key) || {
                fecha: key,
                phishing: 0,
                trivia: 0
            };
        });
        const maxValue = Math.max(
            1,
            ...days.flatMap((day) => [day.phishing, day.trivia])
        );

        days.forEach((day) => {
            const column = document.createElement("div");
            column.className = "flex min-w-0 flex-col items-center justify-end gap-2";
            const chart = document.createElement("div");
            chart.className = "bar-track flex w-full items-end justify-center gap-1 border-b border-[#b8d2f4] dark:border-[#2b4e80]";
            [day.phishing, day.trivia].forEach((value, index) => {
                const bar = document.createElement("div");
                bar.className = `w-3 rounded-t ${index === 0 ? "bg-blue-600" : "bg-emerald-500"}`;
                bar.style.height = `${Math.max(value ? 8 : 0, (value / maxValue) * 100)}%`;
                bar.title = `${index === 0 ? "Phishing" : "Trivia"}: ${value}`;
                chart.appendChild(bar);
            });
            const dateLabel = document.createElement("span");
            dateLabel.className = "text-[10px] text-slate-600 dark:text-slate-300";
            dateLabel.textContent = new Date(`${day.fecha}T12:00:00`).toLocaleDateString(
                "es-AR",
                { weekday: "short" }
            );
            column.append(chart, dateLabel);
            activityElement.appendChild(column);
        });
    }

    function renderContentTypes(rows) {
        contentTypesElement.replaceChildren();
        if (!rows.length) {
            contentTypesElement.textContent = "Todavía no hay contenidos cargados.";
            return;
        }

        rows.forEach((row) => {
            const wrapper = document.createElement("div");
            const labelRow = document.createElement("div");
            labelRow.className = "mb-2 flex justify-between gap-3 text-sm";
            const label = document.createElement("span");
            label.className = "font-bold";
            label.textContent = `${row.tipo} · ${row.publicados}/${row.total} publicados`;
            const count = document.createElement("span");
            count.className = "text-slate-600 dark:text-slate-300";
            count.textContent = String(row.total);
            const track = document.createElement("div");
            track.className = "h-2 overflow-hidden rounded-full bg-[#e9f1fa] dark:bg-[#0e1e3e]";
            const bar = document.createElement("div");
            bar.className = "h-full rounded-full bg-blue-600";
            bar.style.width = `${row.total ? (row.publicados / row.total) * 100 : 0}%`;
            track.appendChild(bar);
            labelRow.append(label, count);
            wrapper.append(labelRow, track);
            contentTypesElement.appendChild(wrapper);
        });
    }

    function renderUsers(rows) {
        usersElement.replaceChildren();
        if (!rows.length) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.colSpan = 4;
            cell.className = "px-6 py-8 text-center text-slate-600 dark:text-slate-300";
            cell.textContent = "Todavía no hay usuarios registrados.";
            row.appendChild(cell);
            usersElement.appendChild(row);
            return;
        }

        rows.forEach((user) => {
            const row = document.createElement("tr");
            row.className = "border-t border-[#d1e5fa] dark:border-[#2b4e80]";
            [user.nombre, user.correo, user.rol, new Date(user.fecha_creacion).toLocaleDateString("es-AR")].forEach((value) => {
                const cell = document.createElement("td");
                cell.className = "px-6 py-4";
                cell.textContent = value;
                row.appendChild(cell);
            });
            usersElement.appendChild(row);
        });
    }

    function renderSurveyScores(rows) {
        surveyScoresElement.replaceChildren();
        if (!rows.length) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.colSpan = 4;
            cell.className = "px-6 py-8 text-center text-slate-600 dark:text-slate-300";
            cell.textContent = "Todavía no hay valoraciones de usabilidad.";
            row.appendChild(cell);
            surveyScoresElement.appendChild(row);
            return;
        }

        rows.forEach((survey) => {
            const score = Number(survey.puntaje);
            const row = document.createElement("tr");
            row.className = "border-t border-[#d1e5fa] dark:border-[#2b4e80]";

            const nameCell = document.createElement("td");
            nameCell.className = "px-6 py-4 font-semibold";
            nameCell.textContent = survey.nombre;

            const scoreCell = document.createElement("td");
            scoreCell.className = "px-6 py-4 font-extrabold";
            if (score < 68) {
                scoreCell.classList.add("text-orange-700", "dark:text-orange-300");
            } else if (score < 80) {
                scoreCell.classList.add("text-yellow-700", "dark:text-yellow-300");
            } else {
                scoreCell.classList.add("text-emerald-700", "dark:text-emerald-300");
            }
            scoreCell.textContent = `${score.toLocaleString("es-AR", {
                maximumFractionDigits: 1
            })}/100`;

            const ratingCell = document.createElement("td");
            ratingCell.className = "px-6 py-4";
            const badge = document.createElement("span");
            badge.className = "rounded-full px-3 py-1 text-xs font-bold";
            if (score < 68) {
                badge.classList.add("bg-orange-100", "text-orange-800", "dark:bg-orange-950/60", "dark:text-orange-200");
                badge.textContent = "Necesita mejorar";
            } else if (score < 80) {
                badge.classList.add("bg-yellow-100", "text-yellow-800", "dark:bg-yellow-950/60", "dark:text-yellow-200");
                badge.textContent = "Aceptable";
            } else {
                badge.classList.add("bg-emerald-100", "text-emerald-800", "dark:bg-emerald-950/60", "dark:text-emerald-200");
                badge.textContent = "Buena experiencia";
            }
            ratingCell.appendChild(badge);

            const dateCell = document.createElement("td");
            dateCell.className = "px-6 py-4 text-slate-600 dark:text-slate-300";
            dateCell.textContent = new Date(survey.fecha_respuesta).toLocaleDateString("es-AR");
            row.append(nameCell, scoreCell, ratingCell, dateCell);
            surveyScoresElement.appendChild(row);
        });
    }

    async function loadAnalytics(token) {
        refreshButton.disabled = true;
        try {
            const data = await window.hadesAPI.obtenerAnaliticasAdminRemoto(token);
            const summary = data.resumen;
            const metrics = [
                ["Usuarios registrados", summary.usuarios_total, "group", "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-200"],
                ["Usuarios domésticos", summary.usuarios_domesticos, "person", "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-200"],
                ["Contenidos publicados", summary.contenidos_publicados, "library_books", "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200"],
                ["Simulaciones phishing", summary.simulaciones_phishing, "shield", "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-200"],
                ["Promedio phishing", `${summary.promedio_phishing}%`, "monitoring", "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-200"],
                ["Promedio trivia", `${summary.promedio_trivia}%`, "quiz", "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-200"]
            ];
            metricsElement.replaceChildren(
                ...metrics.map(([label, value, icon, color]) =>
                    renderMetric(label, value, icon, color)
                )
            );
            renderActivity(data.actividad_semanal);
            renderContentTypes(data.contenidos_por_tipo);
            renderUsers(data.usuarios_recientes);
            renderSurveyScores(data.puntajes_encuesta_usabilidad);
            messageElement.classList.add("hidden");
        } catch (error) {
            console.error("No se pudieron cargar las analíticas:", error);
            showMessage(error.message || "No se pudieron cargar los datos analíticos.");
        } finally {
            refreshButton.disabled = false;
        }
    }

    refreshButton.addEventListener("click", () => {
        const user = JSON.parse(localStorage.getItem("hades_usuario_activo") || "null");
        if (user?.token) loadAnalytics(user.token);
    });

    window.addEventListener("hades-admin-session-ready", (event) => {
        loadAnalytics(event.detail.token);
    }, { once: true });
})();
