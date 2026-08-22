/**
 * HADES - Gestor de Tema (Modo Oscuro / Modo Claro)
 * Controla la alternancia de temas, actualización del botón e icono, y la persistencia en localStorage.
 */

function obtenerTemaActual() {
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function aplicarTema(tema) {
    if (tema === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
        localStorage.setItem("hades_theme", "dark");
    } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
        localStorage.setItem("hades_theme", "light");
    }
    actualizarBotonTema();
}

function alternarTema() {
    const temaActual = obtenerTemaActual();
    const nuevoTema = temaActual === "dark" ? "light" : "dark";
    aplicarTema(nuevoTema);
}

function actualizarBotonTema() {
    const btn = document.getElementById("btnThemeToggle");
    const icono = document.getElementById("iconoThemeToggle");
    const texto = document.getElementById("textoThemeToggle");

    if (!btn) return;

    const esOscuro = document.documentElement.classList.contains("dark");

    if (icono) {
        icono.textContent = esOscuro ? "light_mode" : "dark_mode";
        if (esOscuro) {
            icono.className = "material-symbols-outlined text-[18px] text-amber-300 transition-transform duration-300";
        } else {
            icono.className = "material-symbols-outlined text-[18px] text-indigo-600 transition-transform duration-300";
        }
    }

    if (texto) {
        texto.textContent = esOscuro ? "Modo Claro" : "Modo Oscuro";
    }

    btn.title = esOscuro ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro";
    btn.setAttribute("aria-label", esOscuro ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro");
}

document.addEventListener("DOMContentLoaded", () => {
    actualizarBotonTema();

    const btn = document.getElementById("btnThemeToggle");
    if (btn) {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            alternarTema();
        });
    }
});

