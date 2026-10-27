document.addEventListener("DOMContentLoaded", () => {
    const tituloBienvenida = document.getElementById("tituloBienvenida");

    const btnModoLogin = document.getElementById("btnModoLogin");
    const btnModoRegistro = document.getElementById("btnModoRegistro");

    const formularioLogin = document.getElementById("formularioLogin");
    const loginCorreo = document.getElementById("loginCorreo");
    const loginPassword = document.getElementById("loginPassword");
    const toggleLoginPassword = document.getElementById("toggleLoginPassword");
    const mensajeErrorLogin = document.getElementById("mensajeErrorLogin");
    const btnRecuperarPassword = document.getElementById("btnRecuperarPassword");

    const formularioRegistro = document.getElementById("formularioRegistro");
    const registroNombreUsuario = document.getElementById(
        "registroNombreUsuario"
    );
    const registroCorreo = document.getElementById("registroCorreo");
    const registroRespuestaRecuperacion = document.getElementById(
        "registroRespuestaRecuperacion"
    );
    const registroPassword = document.getElementById("registroPassword");
    const registroPasswordConfirmacion = document.getElementById(
        "registroPasswordConfirmacion"
    );
    const mensajeErrorRegistro = document.getElementById(
        "mensajeErrorRegistro"
    );

    function limpiarMensajes() {
        if (mensajeErrorLogin) {
            mensajeErrorLogin.textContent = "";
            mensajeErrorLogin.classList.add("hidden");
        }

        if (mensajeErrorRegistro) {
            mensajeErrorRegistro.textContent = "";
            mensajeErrorRegistro.classList.add("hidden");
        }
    }

    function mostrarMensajeLogin(mensaje) {
        mensajeErrorLogin.textContent = mensaje;
        mensajeErrorLogin.classList.remove("hidden");
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

    function mostrarMensajeRegistro(mensaje) {
        mensajeErrorRegistro.textContent = mensaje;
        mensajeErrorRegistro.classList.remove("hidden");
    }

    function activarModoLogin() {
        limpiarMensajes();

        tituloBienvenida.textContent = "Bienvenido a HADES";

        formularioLogin.classList.remove("hidden");
        formularioRegistro.classList.add("hidden");

        btnModoLogin.className =
            "py-2 rounded-full text-sm font-bold bg-primary-container text-white shadow transition-colors";

        btnModoRegistro.className =
            "py-2 rounded-full text-sm font-bold text-outline-variant hover:text-white transition-colors";

        loginCorreo.focus();
    }

    function activarModoRegistro() {
        limpiarMensajes();

        tituloBienvenida.textContent = "Crear usuario en HADES";

        formularioLogin.classList.add("hidden");
        formularioRegistro.classList.remove("hidden");

        btnModoRegistro.className =
            "py-2 rounded-full text-sm font-bold bg-secondary text-white shadow transition-colors";

        btnModoLogin.className =
            "py-2 rounded-full text-sm font-bold text-outline-variant hover:text-white transition-colors";

        registroNombreUsuario.focus();
    }

    function validarNombre(nombre) {
        if (!nombre || nombre.trim().length < 2) {
            return "Ingresá un nombre de usuario válido.";
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

    function setFormularioEnviando(formulario, enviando, textoBoton) {
        const boton = formulario.querySelector('button[type="submit"]');

        if (!boton) {
            return;
        }

        boton.disabled = enviando;
        boton.classList.toggle("opacity-60", enviando);
        boton.classList.toggle("cursor-not-allowed", enviando);

        if (!boton.dataset.textoOriginal) {
            boton.dataset.textoOriginal =
                boton.querySelector(".relative")?.firstChild?.textContent.trim() || "";
        }

        const contenido = boton.querySelector(".relative");

        if (contenido) {
            contenido.firstChild.textContent = enviando
                ? textoBoton
                : boton.dataset.textoOriginal;
        }
    }

    function guardarUsuarioActivo(respuestaLogin) {
        const usuario = respuestaLogin.usuario;

        localStorage.setItem(
            "hades_usuario_activo",
            JSON.stringify({
                id_usuario: usuario.id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                rol: usuario.rol,
                token: respuestaLogin.token,
                fecha_expiracion: respuestaLogin.fecha_expiracion
            })
        );
    }

    function irAlPanelUsuario(respuestaLogin) {
        document.body.classList.add("page-transition-out");

        setTimeout(() => {
            window.location.href =
                respuestaLogin.usuario.rol === "Administrador"
                    ? "admin/analiticas.html"
                    : "dashboard.html";
        }, 550);
    }

    btnModoLogin.addEventListener("click", activarModoLogin);
    btnModoRegistro.addEventListener("click", activarModoRegistro);

    toggleLoginPassword.addEventListener("click", () => {
        const visible = loginPassword.type === "password";
        loginPassword.type = visible ? "text" : "password";
        toggleLoginPassword.setAttribute("aria-pressed", String(visible));
        toggleLoginPassword.setAttribute(
            "aria-label",
            visible ? "Ocultar contraseña" : "Mostrar contraseña"
        );
        toggleLoginPassword.firstElementChild.textContent = visible
            ? "visibility_off"
            : "visibility";
    });

    btnRecuperarPassword.addEventListener("click", async () => {
        limpiarMensajes();

        try {
            await window.hadesAPI.abrirRecuperacionPassword();
        } catch (error) {
            mostrarMensajeLogin(
                limpiarMensajeError(
                    error.message ||
                        "No se pudo abrir la página de recuperación."
                )
            );
        }
    });

    formularioLogin.addEventListener("submit", async (event) => {
        event.preventDefault();
        limpiarMensajes();

        const correo = loginCorreo.value.trim();
        const password = loginPassword.value;

        if (!loginCorreo.validity.valid || !correo) {
            mostrarMensajeLogin("Ingresá una dirección de correo válida.");
            return;
        }

        if (!password) {
            mostrarMensajeLogin("Ingresá tu contraseña.");
            return;
        }

        setFormularioEnviando(formularioLogin, true, "Conectando...");

        try {
            const respuesta = await window.hadesAPI.iniciarSesionRemoto({
                correo,
                password
            });

            guardarUsuarioActivo(respuesta);
            irAlPanelUsuario(respuesta);
        } catch (error) {
            mostrarMensajeLogin(
                limpiarMensajeError(
                    error.message ||
                        "No se pudo iniciar sesión. Verificá los datos ingresados."
                )
            );
        } finally {
            setFormularioEnviando(formularioLogin, false);
        }
    });

    formularioRegistro.addEventListener("submit", async (event) => {
        event.preventDefault();
        limpiarMensajes();

        const nombre = registroNombreUsuario.value.trim();
        const correo = registroCorreo.value.trim();
        const respuestaRecuperacion = registroRespuestaRecuperacion.value.trim();
        const password = registroPassword.value;
        const passwordConfirmacion = registroPasswordConfirmacion.value;

        const errorNombre = validarNombre(nombre);

        if (errorNombre) {
            mostrarMensajeRegistro(errorNombre);
            return;
        }

        if (!registroCorreo.validity.valid || !correo) {
            mostrarMensajeRegistro("Ingresá una dirección de correo válida.");
            return;
        }

        if (
            !respuestaRecuperacion ||
            new TextEncoder().encode(respuestaRecuperacion).length > 72
        ) {
            mostrarMensajeRegistro(
                "Ingresá una respuesta de recuperación de hasta 72 bytes."
            );
            return;
        }

        const errorPassword = validarPassword(password);

        if (errorPassword) {
            mostrarMensajeRegistro(errorPassword);
            return;
        }

        if (password !== passwordConfirmacion) {
            mostrarMensajeRegistro("Las contraseñas no coinciden.");
            return;
        }

        setFormularioEnviando(formularioRegistro, true, "Conectando...");

        let registroCompletado = false;

        try {
            await window.hadesAPI.registrarUsuarioRemoto({
                nombre,
                correo,
                password,
                respuesta_recuperacion: respuestaRecuperacion
            });
            registroCompletado = true;

            const respuestaLogin = await window.hadesAPI.iniciarSesionRemoto({
                correo,
                password
            });

            guardarUsuarioActivo(respuestaLogin);
            irAlPanelUsuario(respuestaLogin);
        } catch (error) {
            const mensaje = limpiarMensajeError(
                error.message || "Intentá iniciar sesión nuevamente."
            );
            mostrarMensajeRegistro(
                registroCompletado
                    ? `La cuenta se creó, pero no se pudo iniciar sesión: ${mensaje}`
                    : mensaje || "No se pudo crear el usuario. Intentá nuevamente."
            );
        } finally {
            setFormularioEnviando(formularioRegistro, false);
        }
    });

    activarModoLogin();
});