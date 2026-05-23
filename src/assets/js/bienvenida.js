document.addEventListener("DOMContentLoaded", async () => {
    const tituloBienvenida = document.getElementById("tituloBienvenida");
    const textoBienvenida = document.getElementById("textoBienvenida");
    const formulario = document.getElementById("formularioUsuario");
    const inputNombre = document.getElementById("nombreUsuario");
    const mensajeError = document.getElementById("mensajeError");
    const botonIniciar = document.getElementById("botonIniciar");
    const botonCambiarUsuario = document.getElementById("botonCambiarUsuario");

    function mostrarFormularioUsuario() {
        tituloBienvenida.textContent = "Bienvenido a HADES";
        textoBienvenida.textContent =
            "Antes de comenzar, ingresá tu nombre para personalizar la experiencia dentro de la herramienta.";

        inputNombre.value = "";
        mensajeError.textContent = "";
        mensajeError.classList.add("hidden");

        formulario.classList.remove("hidden");
        botonIniciar.classList.add("hidden");
        botonCambiarUsuario.classList.add("hidden");
    }

    function mostrarUsuarioGuardado(nombre) {
        tituloBienvenida.textContent = `Bienvenido, ${nombre}`;
        textoBienvenida.textContent =
            "Continuá fortaleciendo tus hábitos de seguridad digital mediante guías, diagnósticos y simulaciones educativas.";

        mensajeError.textContent = "";
        mensajeError.classList.add("hidden");

        formulario.classList.add("hidden");
        botonIniciar.classList.remove("hidden");
        botonCambiarUsuario.classList.remove("hidden");
    }

    try {
        const usuario = await window.hadesAPI.obtenerUsuario();

        if (usuario) {
            mostrarUsuarioGuardado(usuario.nombre);
        } else {
            mostrarFormularioUsuario();
        }
    } catch (error) {
        mensajeError.textContent = "No se pudo cargar la información del usuario.";
        mensajeError.classList.remove("hidden");
    }

    formulario.addEventListener("submit", async (event) => {
        event.preventDefault();

        const nombre = inputNombre.value.trim();

        mensajeError.classList.add("hidden");
        mensajeError.textContent = "";

        if (nombre.length < 2) {
            mensajeError.textContent = "Ingresá un nombre válido.";
            mensajeError.classList.remove("hidden");
            return;
        }

        if (nombre.length > 40) {
            mensajeError.textContent = "El nombre no puede superar los 40 caracteres.";
            mensajeError.classList.remove("hidden");
            return;
        }

        try {
            const usuarioGuardado = await window.hadesAPI.guardarUsuario(nombre);

            tituloBienvenida.textContent = `Bienvenido, ${usuarioGuardado.nombre}`;
            textoBienvenida.textContent =
                "Tu perfil fue creado correctamente. Ya podés acceder al panel principal de la herramienta.";

            formulario.classList.add("hidden");
            botonIniciar.classList.remove("hidden");
            botonCambiarUsuario.classList.remove("hidden");
        } catch (error) {
            mensajeError.textContent = error.message || "No se pudo guardar el usuario.";
            mensajeError.classList.remove("hidden");
        }
    });

    botonCambiarUsuario.addEventListener("click", async () => {
        const confirmar = confirm("¿Quieres borrar el nombre guardado y usar otro?");

        if (!confirmar) {
            return;
        }

        try {
            await window.hadesAPI.eliminarUsuario();
            mostrarFormularioUsuario();
        } catch (error) {
            mensajeError.textContent = "No se pudo cambiar el usuario.";
            mensajeError.classList.remove("hidden");
        }
    });
});