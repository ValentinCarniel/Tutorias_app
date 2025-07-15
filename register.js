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
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok && data.success) {
      alert("¡Usuario registrado correctamente!");
      document.getElementById("registerForm").reset();
    } else {
      alert("Error: " + data.message);
    }
  } catch (error) {
    alert("Error de red: " + error.message);
  }
});
