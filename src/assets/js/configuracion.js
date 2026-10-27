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

    const formRespuestaRecuperacion = document.getElementById(
        "formRespuestaRecuperacion"
    );
    const mensajeRespuestaRecuperacion = document.getElementById(
        "mensajeRespuestaRecuperacion"
    );

    const formApiKeys = document.getElementById("formApiKeys");
    const apiKeyVirusTotal = document.getElementById("apiKeyVirusTotal");
    const apiKeyHIBP = document.getElementById("apiKeyHIBP");
    const mensajeApiKeys = document.getElementById("mensajeApiKeys");

    apiKeyVirusTotal.value = localStorage.getItem("hades_vt_apikey") || "";
    apiKeyHIBP.value = localStorage.getItem("hades_hibp_apikey") || "";

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

    function mostrarMensajeApiKeys(mensaje, tipo) {
        mensajeApiKeys.textContent = mensaje;
        mensajeApiKeys.classList.remove("hidden", "text-error", "text-secondary");
        mensajeApiKeys.classList.add(tipo === "exito" ? "text-secondary" : "text-error");
    }

    formApiKeys.addEventListener("submit", (event) => {
        event.preventDefault();

        const virusTotalKey = apiKeyVirusTotal.value.trim();
        const hibpKey = apiKeyHIBP.value.trim();

        if (virusTotalKey) {
            localStorage.setItem("hades_vt_apikey", virusTotalKey);
        } else {
            localStorage.removeItem("hades_vt_apikey");
        }

        if (hibpKey) {
            localStorage.setItem("hades_hibp_apikey", hibpKey);
        } else {
            localStorage.removeItem("hades_hibp_apikey");
        }

        mostrarMensajeApiKeys("Claves guardadas correctamente.", "exito");
    });

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
        if (!password || password.length < 12) {
            return "La contraseña debe tener al menos 12 caracteres.";
        }

        if (new TextEncoder().encode(password).length > 72) {
            return "La contraseña no puede superar los 72 bytes.";
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
            const respuesta = await window.hadesAPI.actualizarNombreRemoto({
                token: usuarioActual.token,
                nombre: nuevoNombre
            });

            guardarUsuarioActivo(respuesta.usuario);
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

        if (!actual) {
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
            await window.hadesAPI.actualizarPasswordRemoto({
                token: usuarioActual.token,
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

    formRespuestaRecuperacion.addEventListener("submit", async (event) => {
        event.preventDefault();
        ocultarMensaje(mensajeRespuestaRecuperacion);

        if (!usuarioActual) {
            mostrarMensaje(
                mensajeRespuestaRecuperacion,
                "No se encontró una sesión activa."
            );
            return;
        }

        const passwordActualRecuperacion = document.getElementById(
            "passwordActualRecuperacion"
        ).value;
        const respuesta = document.getElementById(
            "respuestaRecuperacionCuenta"
        ).value.trim();

        if (!passwordActualRecuperacion) {
            mostrarMensaje(
                mensajeRespuestaRecuperacion,
                "Ingresá tu contraseña actual."
            );
            return;
        }

        if (!respuesta || new TextEncoder().encode(respuesta).length > 72) {
            mostrarMensaje(
                mensajeRespuestaRecuperacion,
                "Ingresá una respuesta de hasta 72 bytes."
            );
            return;
        }

        try {
            const result =
                await window.hadesAPI.actualizarRespuestaRecuperacionRemota({
                    token: usuarioActual.token,
                    passwordActual: passwordActualRecuperacion,
                    respuestaRecuperacion: respuesta
                });
            formRespuestaRecuperacion.reset();
            mostrarMensaje(
                mensajeRespuestaRecuperacion,
                result.message,
                "exito"
            );
        } catch (error) {
            mostrarMensaje(
                mensajeRespuestaRecuperacion,
                limpiarMensajeError(
                    error.message ||
                        "No se pudo guardar la respuesta de recuperación."
                )
            );
        }
    });

    btnCerrarSesion.addEventListener("click", async () => {
        const confirmar = confirm(
            "¿Querés cerrar sesión? Tus datos no se eliminarán."
        );

        if (!confirmar) {
            return;
        }

        btnCerrarSesion.disabled = true;

        try {
            await window.hadesAPI.cerrarSesionRemota(usuarioActual?.token);
            localStorage.removeItem("hades_usuario_activo");
            window.location.href = "bienvenida.html";
        } catch (error) {
            btnCerrarSesion.disabled = false;
            alert(
                limpiarMensajeError(
                    error.message ||
                        "No se pudo cerrar la sesión en el servidor. Intentá nuevamente."
                )
            );
        }
    });

    verificarSesion();
});