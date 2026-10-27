const apiBaseUrl = new URL("./api/v1/", window.location.href);
const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
const requestForm = document.getElementById("solicitudForm");
const verificationForm = document.getElementById("verificacionForm");
const changeForm = document.getElementById("cambioForm");
const title = document.getElementById("titulo");
const description = document.getElementById("descripcion");
const statusMessage = document.getElementById("estado");

if (token) {
    window.history.replaceState(null, "", window.location.pathname);
    requestForm.hidden = true;
    verificationForm.hidden = false;
    verificationForm.classList.remove("hidden");
    title.textContent = "Verificar identidad";
    description.textContent = "Antes de cambiar tu contraseña, respondé la pregunta de seguridad de tu cuenta.";
}

async function sendRequest(path, payload) {
    let response;

    try {
        response = await fetch(new URL(path, apiBaseUrl), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body: JSON.stringify(payload)
        });
    } catch {
        throw new Error("No se pudo conectar con el servidor central.");
    }

    let result;

    try {
        result = await response.json();
    } catch {
        throw new Error("El servidor devolvió una respuesta no válida.");
    }

    if (!response.ok) {
        throw new Error(
            result?.error?.message || `El servidor respondió con el código ${response.status}.`
        );
    }

    return result;
}

function setSubmitting(form, submitting, idleLabel, busyLabel) {
    const button = form.querySelector('button[type="submit"]');
    button.disabled = submitting;
    button.textContent = submitting ? busyLabel : idleLabel;
}

verificationForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    statusMessage.textContent = "";
    const answer = document.getElementById("respuestaRecuperacion").value.trim();
    if (!answer || new TextEncoder().encode(answer).length > 72) {
        statusMessage.textContent = "Ingresá una respuesta válida de hasta 72 bytes.";
        return;
    }

    setSubmitting(verificationForm, true, "Verificar respuesta", "Verificando...");
    try {
        await sendRequest("auth/verificar_respuesta_recuperacion.php", {
            token,
            respuesta_recuperacion: answer
        });
        verificationForm.hidden = true;
        changeForm.hidden = false;
        changeForm.classList.remove("hidden");
        title.textContent = "Crear nueva contraseña";
        description.textContent = "Respuesta verificada. El enlace habilita el cambio durante 10 minutos.";
    } catch (error) {
        statusMessage.textContent = error.message;
    } finally {
        setSubmitting(verificationForm, false, "Verificar respuesta", "Verificando...");
    }
});

requestForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    statusMessage.textContent = "";
    setSubmitting(requestForm, true, "Enviar enlace", "Enviando...");

    try {
        const result = await sendRequest("auth/solicitar_recuperacion.php", {
            correo: document.getElementById("correo").value.trim()
        });
        statusMessage.textContent = result.message;
    } catch (error) {
        statusMessage.textContent = error.message;
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
        statusMessage.textContent = "La contraseña no puede superar los 72 bytes.";
        return;
    }

    if (password !== confirmation) {
        statusMessage.textContent = "Las contraseñas no coinciden.";
        return;
    }

    setSubmitting(changeForm, true, "Cambiar contraseña", "Actualizando...");

    try {
        const result = await sendRequest("auth/cambiar_password.php", {
            token,
            password_nueva: password
        });
        statusMessage.textContent = result.message;
        changeForm.reset();
        changeForm.hidden = true;
        description.textContent = "Ya podés volver a HADES e iniciar sesión con tu nueva contraseña.";
    } catch (error) {
        statusMessage.textContent = error.message;
    } finally {
        if (!changeForm.hidden) {
            setSubmitting(changeForm, false, "Cambiar contraseña", "Actualizando...");
        }
    }
});
