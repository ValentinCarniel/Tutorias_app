document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  const authModalEl = document.getElementById("authModal");
  const registroExitosoModalEl = document.getElementById(
    "registroExitosoModal"
  );
  const irLoginBtn = document.getElementById("irLoginBtn");

  if (!registerForm) return;

  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Obtenemos los valores del formulario
    const payload = {
      nombre: document.getElementById("regNombre").value,
      apellido: document.getElementById("regApellido").value,
      email: document.getElementById("regEmail").value,
      password: document.getElementById("regPassword").value,
      fecha_nacimiento: document.getElementById("regNacimiento").value,
      rol: document.getElementById("regRol").value,
      provincia: document.getElementById("regProvincia").value,
      departamento: document.getElementById("regDepartamento").value,
      ciudad: document.getElementById("regCiudad").value,
    };

    try {
      const response = await fetch(
        "http://localhost/Tutoria/api/register.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        // Cerramos el modal de registro
        const authModal = bootstrap.Modal.getInstance(authModalEl);
        if (authModal) authModal.hide();

        // Mostramos modal de registro exitoso
        const exitoModal = new bootstrap.Modal(registroExitosoModalEl);
        exitoModal.show();

        // Limpiamos el formulario
        registerForm.reset();
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      alert("Error de red: " + error.message);
    }
  });

  // Botón de "Ir al login" dentro del modal de éxito
  if (irLoginBtn) {
    irLoginBtn.addEventListener("click", () => {
      const authModal = new bootstrap.Modal(authModalEl);
      authModal.show();

      // Abrimos la pestaña de login
      const loginTabButton = document.getElementById("login-tab");
      const loginTab = new bootstrap.Tab(loginTabButton);
      loginTab.show();

      // Cerramos modal de éxito
      const exitoModal = bootstrap.Modal.getInstance(registroExitosoModalEl);
      if (exitoModal) exitoModal.hide();
    });
  }
});
