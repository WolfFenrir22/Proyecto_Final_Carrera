(() => {
    const sessionKey = "hades_usuario_activo";

    function returnToLogin() {
        localStorage.removeItem(sessionKey);
        window.location.replace("../bienvenida.html");
    }

    let currentUser;
    try {
        currentUser = JSON.parse(localStorage.getItem(sessionKey) || "null");
    } catch (error) {
        console.error("No se pudo leer la sesión administrativa:", error);
        returnToLogin();
        return;
    }

    if (!currentUser?.token) {
        returnToLogin();
        return;
    }

    document.body.style.visibility = "hidden";

    window.hadesAPI.validarSesionRemota(currentUser.token)
        .then((session) => {
            if (!session || session.usuario.rol !== "Administrador") {
                if (session) {
                    window.location.replace("../dashboard.html");
                    return;
                }
                returnToLogin();
                return;
            }

            currentUser = {
                ...currentUser,
                ...session.usuario,
                id_usuario: session.usuario.id,
                fecha_expiracion: session.fecha_expiracion
            };
            delete currentUser.id;
            localStorage.setItem(sessionKey, JSON.stringify(currentUser));

            document.querySelectorAll("[data-admin-name]").forEach((element) => {
                element.textContent = currentUser.nombre;
            });

            const logoutButton = document.getElementById("cerrarSesionAdmin");
            logoutButton?.addEventListener("click", async () => {
                logoutButton.disabled = true;
                try {
                    await window.hadesAPI.cerrarSesionRemota(currentUser.token);
                } catch (error) {
                    console.error("No se pudo cerrar la sesión:", error);
                    window.alert(error.message || "No se pudo cerrar la sesión.");
                    logoutButton.disabled = false;
                    return;
                }

                localStorage.removeItem(sessionKey);
                window.location.replace("../bienvenida.html");
            });

            document.body.style.visibility = "";
            window.dispatchEvent(new CustomEvent("hades-admin-session-ready", {
                detail: { token: currentUser.token }
            }));
        })
        .catch((error) => {
            console.error("No se pudo validar la sesión administrativa:", error);
            window.alert(error.message || "No se pudo verificar la sesión.");
            returnToLogin();
        });
})();
