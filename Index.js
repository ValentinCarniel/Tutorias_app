// ==============================
// 🟣 Hero typing animation + login redirection
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  iniciarEscrituraHero();
  cargarProvincias();

  // 🟣 Abrir modal si se accede con #login
  const modalElement = document.getElementById("authModal");
  const loginTabButton = document.getElementById("login-tab");

  if (window.location.hash === "#login" && modalElement && loginTabButton) {
    const modal = new bootstrap.Modal(modalElement);
    modal.show();

    const loginTab = new bootstrap.Tab(loginTabButton);
    loginTab.show();
  }
});

function iniciarEscrituraHero() {
  const frases = ["Aprendé.", "Enseñá.", "Conectá."];
  const typingElement = document.getElementById("typingText");
  let fraseIndex = 0;
  let charIndex = 0;
  let borrando = false;

  function escribir() {
    const actual = frases[fraseIndex];
    typingElement.textContent = actual.substring(0, charIndex);

    if (!borrando && charIndex < actual.length) {
      charIndex++;
      setTimeout(escribir, 80);
    } else if (borrando && charIndex > 0) {
      charIndex--;
      setTimeout(escribir, 40);
    } else {
      borrando = !borrando;
      if (!borrando) fraseIndex = (fraseIndex + 1) % frases.length;
      setTimeout(escribir, 1000);
    }
  }

  escribir();
}

// ==============================
// 🔵 Ubicación: Provincias + Departamentos + Ciudades
// ==============================
function cargarProvincias() {
  fetch("https://apis.datos.gob.ar/georef/api/provincias?campos=id,nombre")
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById("regProvincia");
      data.provincias.sort((a, b) => a.nombre.localeCompare(b.nombre));
      data.provincias.forEach(p => {
        const option = document.createElement("option");
        option.value = p.nombre;
        option.textContent = p.nombre;
        select.appendChild(option);
      });
    });
}

document.getElementById("regProvincia").addEventListener("change", function () {
  const provincia = this.value;
  const depSelect = document.getElementById("regDepartamento");
  const ciudadSelect = document.getElementById("regCiudad");

  depSelect.innerHTML = '<option value="">Seleccioná tu departamento</option>';
  ciudadSelect.innerHTML = '<option value="">Seleccioná tu ciudad</option>';
  depSelect.disabled = true;
  ciudadSelect.disabled = true;

  fetch(`https://apis.datos.gob.ar/georef/api/departamentos?provincia=${provincia}&campos=id,nombre&max=1000`)
    .then(res => res.json())
    .then(data => {
      depSelect.innerHTML += data.departamentos.map(dep =>
        `<option value="${dep.nombre}">${dep.nombre}</option>`
      ).join('');
      depSelect.disabled = false;
    });
});

document.getElementById("regDepartamento").addEventListener("change", function () {
  const provincia = document.getElementById("regProvincia").value;
  const departamento = this.value;
  const ciudadSelect = document.getElementById("regCiudad");

  ciudadSelect.innerHTML = '<option>Cargando ciudades...</option>';
  ciudadSelect.disabled = true;

  fetch(`https://apis.datos.gob.ar/georef/api/localidades?provincia=${provincia}&departamento=${departamento}&campos=id,nombre&max=1000`)
    .then(res => res.json())
    .then(data => {
      ciudadSelect.innerHTML = data.localidades.map(loc =>
        `<option value="${loc.nombre}">${loc.nombre}</option>`
      ).join('');
      ciudadSelect.disabled = false;
    })
    .catch(() => {
      ciudadSelect.innerHTML = '<option>Error al cargar ciudades</option>';
    });
});

// ==============================
// 🟠 Login demo con feedback visual en el modal
// ==============================
document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const feedback = document.getElementById("loginFeedback");

  // Limpiar mensaje previo
  feedback.classList.add("d-none");
  feedback.classList.remove("alert", "alert-danger", "alert-success");
  feedback.textContent = "";

  const loginCorrecto = email === "admin@tuto.com" && password === "123456";

  if (loginCorrecto) {
    const modal = bootstrap.Modal.getInstance(document.getElementById("authModal"));
    if (modal) modal.hide();
  } else {
    feedback.textContent = "Credenciales incorrectas.";
    feedback.classList.remove("d-none");
    feedback.classList.add("alert", "alert-danger");
  }
});

// ==============================
// 🟣 Registro demo básico
// ==============================
document.getElementById("registerForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const nombre = document.getElementById("regNombre").value.trim();
  alert(`¡Gracias por registrarte, ${nombre}!`);
  bootstrap.Modal.getInstance(document.getElementById("authModal")).hide();
});

//abrirModalRegistroTutor();
function abrirModalRegistroTutor() {
  const modalElement = document.getElementById("authModal");
  const registerTabButton = document.getElementById("register-tab");

  if (modalElement && registerTabButton) {
    const modal = new bootstrap.Modal(modalElement);
    modal.show();

    const registerTab = new bootstrap.Tab(registerTabButton);
    registerTab.show();

    document.getElementById("regRol").value = "tutor"; // ✅ Preseleccionamos el rol
  }
}
