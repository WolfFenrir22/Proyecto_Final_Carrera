document.addEventListener("DOMContentLoaded", () => {
    const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
    const requestForm = document.getElementById("solicitudForm");
    const changeForm = document.getElementById("cambioForm");
    const title = document.getElementById("titulo");
    const description = document.getElementById("descripcion");
    const statusMessage = document.getElementById("estado");

    if (token) {
        window.history.replaceState(null, "", window.location.pathname);
        requestForm.hidden = true;
        changeForm.hidden = false;
        changeForm.classList.remove("hidden");
        title.textContent = "Crear nueva contraseña";
        description.textContent =
            "El enlace es de un solo uso y tiene una duración limitada.";
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
            description.textContent =
                "Ya podés volver a HADES e iniciar sesión con tu nueva contraseña.";
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
