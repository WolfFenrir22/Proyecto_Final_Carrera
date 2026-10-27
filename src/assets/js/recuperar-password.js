document.addEventListener("DOMContentLoaded", () => {
    const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
    const requestForm = document.getElementById("solicitudForm");
    const verificationForm = document.getElementById("verificacionForm");
    const changeForm = document.getElementById("cambioForm");
    const title = document.getElementById("titulo");
    const description = document.getElementById("descripcion");
    const statusMessage = document.getElementById("estado");
    const returnToLogin = document.getElementById("volverLogin");
    let responseVerified = false;

    returnToLogin.addEventListener("click", () => {
        window.location.href = "bienvenida.html";
    });

    if (token) {
        window.history.replaceState(null, "", window.location.pathname);
        requestForm.hidden = true;
        verificationForm.hidden = false;
        verificationForm.classList.remove("hidden");
        title.textContent = "Verificar identidad";
        description.textContent =
            "Antes de cambiar tu contraseña, respondé la pregunta de seguridad de tu cuenta.";
    }

    function setSubmitting(form, submitting, idleLabel, busyLabel) {
        const button = form.querySelector('button[type="submit"]');
        button.disabled = submitting;
        button.textContent = submitting ? busyLabel : idleLabel;
    }

    requestForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        statusMessage.textContent = "";
        setSubmitting(requestForm, true, "Enviar enlace", "Enviando...");

        try {
            const result = await window.hadesAPI.solicitarRecuperacionPassword({
                correo: document.getElementById("correo").value.trim()
            });
            statusMessage.textContent = result.message;
        } catch (error) {
            statusMessage.textContent =
                error.message || "No se pudo solicitar la recuperación.";
        } finally {
            setSubmitting(requestForm, false, "Enviar enlace", "Enviando...");
        }
    });

    verificationForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        statusMessage.textContent = "";

        const answer = document.getElementById("respuestaRecuperacion").value.trim();
        if (!answer || new TextEncoder().encode(answer).length > 72) {
            statusMessage.textContent =
                "Ingresá una respuesta válida de hasta 72 bytes.";
            return;
        }

        setSubmitting(
            verificationForm,
            true,
            "Verificar respuesta",
            "Verificando..."
        );
        try {
            await window.hadesAPI.verificarRespuestaRecuperacion({
                token,
                respuesta_recuperacion: answer
            });
            responseVerified = true;
            verificationForm.hidden = true;
            changeForm.hidden = false;
            changeForm.classList.remove("hidden");
            title.textContent = "Crear nueva contraseña";
            description.textContent =
                "Respuesta verificada. El enlace habilita el cambio durante 10 minutos.";
            statusMessage.textContent = "";
        } catch (error) {
            statusMessage.textContent =
                error.message || "No se pudo verificar la respuesta.";
        } finally {
            if (!responseVerified) {
                setSubmitting(
                    verificationForm,
                    false,
                    "Verificar respuesta",
                    "Verificando..."
                );
            }
        }
    });

    changeForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        statusMessage.textContent = "";

        const password = document.getElementById("passwordNueva").value;
        const confirmation = document.getElementById("passwordConfirmacion").value;

        if (new TextEncoder().encode(password).length > 72) {
            statusMessage.textContent =
                "La contraseña no puede superar los 72 bytes.";
            return;
        }

        if (password !== confirmation) {
            statusMessage.textContent = "Las contraseñas no coinciden.";
            return;
        }

        setSubmitting(changeForm, true, "Cambiar contraseña", "Actualizando...");
        try {
            const result = await window.hadesAPI.cambiarPasswordRecuperacion({
                token,
                password_nueva: password
            });
            statusMessage.textContent = result.message;
            changeForm.reset();
            changeForm.hidden = true;
            returnToLogin.classList.remove("hidden");
            description.textContent =
                "Ya podés iniciar sesión con tu nueva contraseña.";
            title.textContent = "Contraseña actualizada";
        } catch (error) {
            statusMessage.textContent =
                error.message || "No se pudo actualizar la contraseña.";
        } finally {
            if (!changeForm.hidden) {
                setSubmitting(
                    changeForm,
                    false,
                    "Cambiar contraseña",
                    "Actualizando..."
                );
            }
        }
    });
});
