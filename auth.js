// LOGIN
document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  try {
    const response = await fetch("http://localhost/TUTORIA/login.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // ✅ Guardar datos del usuario
      localStorage.setItem("token", data.token);
      localStorage.setItem("rol", data.rol);
      localStorage.setItem("nombre", data.nombre);

      // ✅ Definir redirección según rol
      const destino = data.rol === "tutor" ? "tutor_panel.html" : "Tutorias.html";

      // ✅ Mostrar bienvenida y redirigir
      Swal.fire({
        title: '¡Bienvenido!',
        text: `Accediste como ${data.rol.toUpperCase()}`,
        icon: 'success',
        confirmButtonText: 'Continuar',
        confirmButtonColor: '#6f42c1'
      }).then(() => {
         window.location.href = destino;
      });
    } else {
      Swal.fire({
        title: 'Ups...',
        text: data.message || "Credenciales inválidas.",
        icon: 'error',
        confirmButtonColor: '#dc3545'
      });
    }
  } catch (error) {
    Swal.fire({
      title: 'Error de conexión',
      text: error.message,
      icon: 'warning',
      confirmButtonColor: '#ffc107'
    });
  }
});


// REGISTRO
document.getElementById("registerForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const payload = {
    nombre: document.getElementById("regNombre").value,
    apellido: document.getElementById("regApellido").value,
    email: document.getElementById("regEmail").value,
    password: document.getElementById("regPassword").value,
    fecha_nacimiento: document.getElementById("regNacimiento").value,
    rol: document.getElementById("regRol").value,
    provincia: document.getElementById("regProvincia").value,
    departamento: document.getElementById("regDepartamento").value,
    ciudad: document.getElementById("regCiudad").value
  };

  try {
    const response = await fetch("http://localhost/TUTORIA/register.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok && data.success) {
      document.getElementById("registerForm").reset();

      Swal.fire({
        title: 'Registro exitoso 🎉',
        text: 'Tu cuenta fue creada correctamente. Ya podés iniciar sesión.',
        icon: 'success',
        confirmButtonText: 'Ir al login',
        confirmButtonColor: '#6f42c1'
      }).then(() => {
        // ✅ Cambiar a pestaña login
        const loginTab = new bootstrap.Tab(document.querySelector('#login-tab'));
        loginTab.show();

        // ✅ Mostrar modal principal
        const authModalInstancia = bootstrap.Modal.getInstance(document.getElementById("authModal"));
        if (authModalInstancia) {
          authModalInstancia.show();
        } else {
          const nuevoAuthModal = new bootstrap.Modal(document.getElementById("authModal"));
          nuevoAuthModal.show();
        }
      });
    } else {
      Swal.fire({
        title: 'Error al registrar',
        text: data.message || "No se pudo completar el registro.",
        icon: 'error',
        confirmButtonColor: '#dc3545'
      });
    }
  } catch (error) {
    Swal.fire({
      title: 'Error de red',
      text: error.message,
      icon: 'warning',
      confirmButtonColor: '#ffc107'
    });
  }
});
