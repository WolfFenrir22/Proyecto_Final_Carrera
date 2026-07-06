document.addEventListener("DOMContentLoaded", () => {
    const tituloBienvenida = document.getElementById("tituloBienvenida");
    const textoBienvenida = document.getElementById("textoBienvenida");

    const btnModoLogin = document.getElementById("btnModoLogin");
    const btnModoRegistro = document.getElementById("btnModoRegistro");

    const formularioLogin = document.getElementById("formularioLogin");
    const loginNombreUsuario = document.getElementById("loginNombreUsuario");
    const loginPassword = document.getElementById("loginPassword");
    const mensajeErrorLogin = document.getElementById("mensajeErrorLogin");

    const formularioRegistro = document.getElementById("formularioRegistro");
    const registroNombreUsuario = document.getElementById(
        "registroNombreUsuario"
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
        textoBienvenida.textContent =
            "Herramienta de Ayuda y Divulgación para la Educación en Seguridad Digital.";

        formularioLogin.classList.remove("hidden");
        formularioRegistro.classList.add("hidden");

        btnModoLogin.className =
            "py-2 rounded-full text-sm font-bold bg-primary-container text-white shadow transition-colors";

        btnModoRegistro.className =
            "py-2 rounded-full text-sm font-bold text-outline-variant hover:text-white transition-colors";

        loginNombreUsuario.focus();
    }

    function activarModoRegistro() {
        limpiarMensajes();

        tituloBienvenida.textContent = "Crear usuario en HADES";
        textoBienvenida.textContent =
            "Herramienta de Ayuda y Divulgación para la Educación en Seguridad Digital.";

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
        if (!password || password.length < 4) {
            return "La contraseña debe tener al menos 4 caracteres.";
        }

        if (password.length > 100) {
            return "La contraseña no puede superar los 100 caracteres.";
        }

        return null;
    }

    function guardarUsuarioActivo(usuario) {
        localStorage.setItem(
            "hades_usuario_activo",
            JSON.stringify({
                id_usuario: usuario.id_usuario,
                nombre: usuario.nombre,
                fecha_creacion: usuario.fecha_creacion,
                ultimo_acceso: usuario.ultimo_acceso
            })
        );
    }

    function irAlDashboard() {
        document.body.classList.add("page-transition-out");

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 550);
    }

    btnModoLogin.addEventListener("click", activarModoLogin);
    btnModoRegistro.addEventListener("click", activarModoRegistro);

    formularioLogin.addEventListener("submit", async (event) => {
        event.preventDefault();
        limpiarMensajes();

        const nombre = loginNombreUsuario.value.trim();
        const password = loginPassword.value;

        const errorNombre = validarNombre(nombre);

        if (errorNombre) {
            mostrarMensajeLogin(errorNombre);
            return;
        }

        const errorPassword = validarPassword(password);

        if (errorPassword) {
            mostrarMensajeLogin(errorPassword);
            return;
        }

        try {
            const usuario = await window.hadesAPI.iniciarSesion({
                nombre,
                password
            });

            guardarUsuarioActivo(usuario);
            irAlDashboard();
        } catch (error) {
            mostrarMensajeLogin(
                limpiarMensajeError(
                    error.message ||
                        "No se pudo iniciar sesión. Verificá los datos ingresados."
                )
            );
        }
    });

    formularioRegistro.addEventListener("submit", async (event) => {
        event.preventDefault();
        limpiarMensajes();

        const nombre = registroNombreUsuario.value.trim();
        const password = registroPassword.value;
        const passwordConfirmacion = registroPasswordConfirmacion.value;

        const errorNombre = validarNombre(nombre);

        if (errorNombre) {
            mostrarMensajeRegistro(errorNombre);
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

        try {
            const usuario = await window.hadesAPI.crearUsuarioConPassword({
                nombre,
                password
            });

            guardarUsuarioActivo(usuario);
            irAlDashboard();
        } catch (error) {
            mostrarMensajeRegistro(
                limpiarMensajeError(
                    error.message ||
                        "No se pudo crear el usuario. Intentá nuevamente."
                )
            );
        }
    });

    activarModoLogin();
});