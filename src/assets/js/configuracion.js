document.addEventListener("DOMContentLoaded", () => {
    const nombreUsuarioActual = document.getElementById(
        "nombreUsuarioActual"
    );
    const idUsuarioActual = document.getElementById("idUsuarioActual");

    const btnCerrarSesion = document.getElementById("btnCerrarSesion");

    const formCambiarNombre = document.getElementById("formCambiarNombre");
    const nuevoNombreUsuario = document.getElementById("nuevoNombreUsuario");
    const mensajeNombre = document.getElementById("mensajeNombre");

    const formCambiarPassword = document.getElementById(
        "formCambiarPassword"
    );
    const passwordActual = document.getElementById("passwordActual");
    const passwordNueva = document.getElementById("passwordNueva");
    const passwordNuevaConfirmacion = document.getElementById(
        "passwordNuevaConfirmacion"
    );
    const mensajePassword = document.getElementById("mensajePassword");

    let usuarioActual = null;

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

    function guardarUsuarioActivo(usuario) {
        localStorage.setItem(
            "hades_usuario_activo",
            JSON.stringify({
                ...usuarioActual,
                ...usuario
            })
        );

        usuarioActual = obtenerUsuarioActivoDesdeSesion();
    }

    function limpiarMensajeError(mensaje) {
    if (!mensaje) {
        return "Ocurrió un error inesperado.";
    }

    return mensaje
        .replace(/^Error invoking remote method '[^']+':\s*/, "")
        .replace(/^Error:\s*/, "")
        .trim();
    }

    function mostrarMensaje(elemento, mensaje, tipo = "error") {
        if (!elemento) {
            return;
        }

        elemento.textContent = mensaje;
        elemento.classList.remove(
            "hidden",
            "text-error",
            "text-secondary",
            "text-primary"
        );

        if (tipo === "exito") {
            elemento.classList.add("text-secondary");
        } else if (tipo === "info") {
            elemento.classList.add("text-primary");
        } else {
            elemento.classList.add("text-error");
        }
    }

    function ocultarMensaje(elemento) {
        if (!elemento) {
            return;
        }

        elemento.textContent = "";
        elemento.classList.add("hidden");
    }

    function validarNombre(nombre) {
        if (!nombre || nombre.trim().length < 2) {
            return "El nombre debe tener al menos 2 caracteres.";
        }

        if (nombre.trim().length > 40) {
            return "El nombre no puede superar los 40 caracteres.";
        }

        return null;
    }

    function validarPassword(password) {
        if (!password || password.length < 4) {
            return "La contraseña debe tener al menos 4 caracteres.";
        }

        if (password.length > 100) {
            return "La contraseña no puede superar los 100 caracteres.";
        }

        return null;
    }

    function renderizarUsuario() {
        if (!usuarioActual) {
            return;
        }

        nombreUsuarioActual.textContent = usuarioActual.nombre;
        idUsuarioActual.textContent =
            `ID de usuario: ${usuarioActual.id_usuario}`;

        nuevoNombreUsuario.value = usuarioActual.nombre;

        // Actualizar nombre en el sidebar si existe
        const sidebarNombre = document.getElementById('nombreUsuarioSesion');
        if (sidebarNombre) {
            sidebarNombre.textContent = usuarioActual.nombre;
        }

        // También actualizar elementos con clase sidebar-nombreUsuario
        const sidebarNombres = document.querySelectorAll('.sidebar-nombreUsuario');
        if (sidebarNombres && sidebarNombres.length) {
            sidebarNombres.forEach(el => el.textContent = usuarioActual.nombre);
        }
    }

    function verificarSesion() {
        usuarioActual = obtenerUsuarioActivoDesdeSesion();

        if (!usuarioActual) {
            window.location.href = "bienvenida.html";
            return false;
        }

        renderizarUsuario();
        return true;
    }

    formCambiarNombre.addEventListener("submit", async (event) => {
        event.preventDefault();

        ocultarMensaje(mensajeNombre);

        if (!usuarioActual) {
            mostrarMensaje(
                mensajeNombre,
                "No se encontró una sesión activa."
            );
            return;
        }

        const nuevoNombre = nuevoNombreUsuario.value.trim();

        const errorNombre = validarNombre(nuevoNombre);

        if (errorNombre) {
            mostrarMensaje(mensajeNombre, errorNombre);
            return;
        }

        if (nuevoNombre === usuarioActual.nombre) {
            mostrarMensaje(
                mensajeNombre,
                "El nuevo nombre es igual al actual.",
                "info"
            );
            return;
        }

        try {
            const usuarioActualizado =
                await window.hadesAPI.actualizarNombreUsuario({
                    idUsuario: usuarioActual.id_usuario,
                    nuevoNombre
                });

            guardarUsuarioActivo(usuarioActualizado);
            renderizarUsuario();

            mostrarMensaje(
                mensajeNombre,
                "Nombre actualizado correctamente.",
                "exito"
            );
        } catch (error) {
            mostrarMensaje(
                limpiarMensajeError(
                error.message ||
                    "No se pudo actualizar el nombre de usuario."
            ),
        );
        }
    });

    formCambiarPassword.addEventListener("submit", async (event) => {
        event.preventDefault();

        ocultarMensaje(mensajePassword);

        if (!usuarioActual) {
            mostrarMensaje(
                mensajePassword,
                "No se encontró una sesión activa."
            );
            return;
        }

        const actual = passwordActual.value;
        const nueva = passwordNueva.value;
        const confirmacion = passwordNuevaConfirmacion.value;

        const errorActual = validarPassword(actual);

        if (errorActual) {
            mostrarMensaje(
                mensajePassword,
                "Ingresá la contraseña actual."
            );
            return;
        }

        const errorNueva = validarPassword(nueva);

        if (errorNueva) {
            mostrarMensaje(mensajePassword, errorNueva);
            return;
        }

        if (nueva !== confirmacion) {
            mostrarMensaje(
                mensajePassword,
                "Las nuevas contraseñas no coinciden."
            );
            return;
        }

        if (actual === nueva) {
            mostrarMensaje(
                mensajePassword,
                "La nueva contraseña debe ser distinta a la actual."
            );
            return;
        }

        try {
            await window.hadesAPI.actualizarPasswordUsuario({
                idUsuario: usuarioActual.id_usuario,
                passwordActual: actual,
                passwordNueva: nueva
            });

            formCambiarPassword.reset();

            mostrarMensaje(
                mensajePassword,
                "Contraseña actualizada correctamente.",
                "exito"
            );
         } catch (error) {
            mostrarMensaje(
                limpiarMensajeError(
                error.message ||
                    "No se pudo actualizar la contraseña."
            ),
        );
        }
    });

    btnCerrarSesion.addEventListener("click", () => {
        const confirmar = confirm(
            "¿Querés cerrar sesión? Tus datos no se eliminarán."
        );

        if (!confirmar) {
            return;
        }

        localStorage.removeItem("hades_usuario_activo");
        window.location.href = "bienvenida.html";
    });

    verificarSesion();
});