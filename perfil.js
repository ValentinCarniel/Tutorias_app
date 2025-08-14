// =========================
// Configuración de Tailwind
// =========================
if (typeof tailwind !== "undefined") {
    tailwind.config = {
        theme: {
            extend: {
                colors: {
                    primary: "#6a1b9a",
                },
            },
        },
    };
}

// ==========================
// Función para cambiar pestañas
// ==========================
function showTab(event, tabName) {
    // Ocultar todas las pestañas
    document.querySelectorAll(".tab-content").forEach(content => {
        content.classList.remove("active");
    });

    // Quitar clase activa de todos los botones
    document.querySelectorAll(".tab-button").forEach(button => {
        button.classList.remove("active", "text-white");
        button.classList.add("text-gray-600", "hover:text-primary");
    });

    // Mostrar la pestaña seleccionada
    document.getElementById(tabName).classList.add("active");

    // Activar el botón clickeado
    event.target.classList.add("active", "text-white");
    event.target.classList.remove("text-gray-600", "hover:text-primary");
}

// ==========================
// Mostrar/Ocultar contraseña
// ==========================
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const type = input.type === "password" ? "text" : "password";
    input.type = type;
}

// ==========================
// Subir foto de perfil
// ==========================
function uploadPhoto() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = e => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = ev => {
                console.log("Foto cargada:", ev.target.result);
                // Aquí podrías cambiar la foto de perfil en el DOM
            };
            reader.readAsDataURL(file);
        }
    };

    input.click();
}

// ==========================
// Eliminar foto de perfil
// ==========================
function deletePhoto() {
    if (confirm("¿Estás seguro de que quieres eliminar tu foto de perfil?")) {
        console.log("Foto eliminada");
        // Aquí podrías quitar la imagen de perfil en el DOM
    }
}

// ==========================
// Validar texto para eliminar cuenta
// ==========================
function validateDeleteAccount() {
    const input = document.querySelector('#perfil input[type="text"]');
    const button = document.querySelector("#perfil button[onclick='confirmDeleteAccount()']");

    if (input.value === "ELIMINAR") {
        button.classList.remove("bg-gray-300", "text-gray-600");
        button.classList.add("bg-red-600", "text-white");
        button.disabled = false;
    } else {
        button.classList.add("bg-gray-300", "text-gray-600");
        button.classList.remove("bg-red-600", "text-white");
        button.disabled = true;
    }
}

// ==========================
// Confirmar eliminación de cuenta
// ==========================
function confirmDeleteAccount() {
    if (confirm("Esta acción eliminará permanentemente tu cuenta. ¿Estás seguro?")) {
        console.log("Cuenta eliminada");
    }
}

// ==========================
// Agregar método de pago
// ==========================
function addPaymentMethod() {
    console.log("Agregando nueva tarjeta de pago");
}

// ==========================
// Guardar cambios de contraseña
// ==========================
function savePasswordChanges(event) {
    event.preventDefault();

    const currentPassword = document.getElementById("current-password").value;
    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        alert("Por favor completa todos los campos");
        return;
    }

    if (newPassword !== confirmPassword) {
        alert("Las contraseñas no coinciden");
        return;
    }

    console.log("Contraseña cambiada exitosamente");
    alert("Contraseña cambiada exitosamente");
}

// ==========================
// Inicialización al cargar DOM
// ==========================
document.addEventListener("DOMContentLoaded", () => {
    // Validación de eliminar cuenta
    const deleteInput = document.querySelector('#perfil input[type="text"]');
    if (deleteInput) {
        deleteInput.addEventListener("input", validateDeleteAccount);
    }

    // Formulario de contraseña
    const passwordForm = document.querySelector("#seguridad form");
    if (passwordForm) {
        passwordForm.addEventListener("submit", savePasswordChanges);
    }

    // Botones subir y eliminar foto
    const uploadBtn = Array.from(document.querySelectorAll("button")).find(btn => btn.textContent.includes("Subir foto"));
    if (uploadBtn) uploadBtn.addEventListener("click", uploadPhoto);

    const deleteBtn = Array.from(document.querySelectorAll("button")).find(btn => btn.textContent.includes("Eliminar foto"));
    if (deleteBtn) deleteBtn.addEventListener("click", deletePhoto);

    // Botón agregar tarjeta
    const addCardBtn = Array.from(document.querySelectorAll("button")).find(btn => btn.textContent.includes("AGREGAR NUEVA TARJETA"));
    if (addCardBtn) addCardBtn.addEventListener("click", addPaymentMethod);
});

