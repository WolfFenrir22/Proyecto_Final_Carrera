(() => {
    const claveSesion = "hades_usuario_activo";
    let usuarioActual;

    try {
        usuarioActual = JSON.parse(localStorage.getItem(claveSesion) || "null");
    } catch (error) {
        console.error("No se pudo leer la sesión guardada:", error);
        localStorage.removeItem(claveSesion);
        window.location.replace("bienvenida.html");
        return;
    }

    if (!usuarioActual?.token) {
        localStorage.removeItem(claveSesion);
        window.location.replace("bienvenida.html");
        return;
    }

    document.body.style.visibility = "hidden";

    window.hadesAPI.validarSesionRemota(usuarioActual.token)
        .then((sesion) => {
            if (!sesion) {
                localStorage.removeItem(claveSesion);
                window.location.replace("bienvenida.html");
                return;
            }

            const usuario = {
                ...usuarioActual,
                ...sesion.usuario,
                id_usuario: sesion.usuario.id,
                fecha_expiracion: sesion.fecha_expiracion
            };
            delete usuario.id;
            localStorage.setItem(claveSesion, JSON.stringify(usuario));

            if (usuario.rol === "Administrador") {
                window.location.replace("admin/analiticas.html");
                return;
            }

            if (usuario.rol !== "Doméstico") {
                localStorage.removeItem(claveSesion);
                window.location.replace("bienvenida.html");
                return;
            }

            document.querySelectorAll(
                "#nombreUsuarioSesion, .sidebar-nombreUsuario"
            ).forEach((elemento) => {
                elemento.textContent = usuario.nombre;
            });

            document.body.style.visibility = "";
        })
        .catch((error) => {
            console.error("No se pudo validar la sesión con el servidor:", error);
            window.alert(
                error.message ||
                    "No se pudo verificar la sesión con el servidor central."
            );
            window.location.replace("bienvenida.html");
        });
})();
