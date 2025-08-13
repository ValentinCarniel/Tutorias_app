// ==============================
// 🟣 Hero typing animation
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  iniciarEscrituraHero();

  // Abrir modal si se accede con #login
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
  if (!typingElement) return;

  let fraseIndex = 0,
    charIndex = 0,
    borrando = false;

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
// 🔵 Modal Login / Registro
// ==============================

// Función para abrir modal login
function abrirModalLogin() {
  const modalElement = document.getElementById("authModal");
  const loginTabButton = document.getElementById("login-tab");

  if (modalElement && loginTabButton) {
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    const loginTab = new bootstrap.Tab(loginTabButton);
    loginTab.show();
  }
}

// Función para abrir modal registro tutor
function abrirModalRegistroTutor() {
  const modalElement = document.getElementById("authModal");
  const registerTabButton = document.getElementById("register-tab");

  if (modalElement && registerTabButton) {
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    const registerTab = new bootstrap.Tab(registerTabButton);
    registerTab.show();

    // Preseleccionamos rol tutor
    const rolSelect = document.getElementById("regRol");
    if (rolSelect) rolSelect.value = "tutor";
  }
}

// ==============================
// 🔵 Login demo con feedback visual
// ==============================
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const feedback = document.getElementById("loginFeedback");

    feedback.classList.add("d-none");
    feedback.classList.remove("alert", "alert-danger", "alert-success");
    feedback.textContent = "";

    const loginCorrecto = email === "admin@tuto.com" && password === "123456";

    if (loginCorrecto) {
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("authModal")
      );
      if (modal) modal.hide();
    } else {
      feedback.textContent = "Credenciales incorrectas.";
      feedback.classList.remove("d-none");
      feedback.classList.add("alert", "alert-danger");
    }
  });
}

// ==============================
// 🔵 Registro demo + provincias/departamentos/ciudades
// ==============================

const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();
    bootstrap.Modal.getInstance(document.getElementById("authModal")).hide();

    // Mostrar modal de registro exitoso
    const exitoModal = new bootstrap.Modal(
      document.getElementById("registroExitosoModal")
    );
    exitoModal.show();
  });
}

// Botón de "Ir al login" dentro del modal de éxito
const irLoginBtn = document.getElementById("irLoginBtn");
if (irLoginBtn) {
  irLoginBtn.addEventListener("click", () => {
    abrirModalLogin();
  });
}

// ==============================
// 🔵 Provincias / Departamentos / Ciudades dinámicos
// ==============================

let provinciasMap = {};

// Cargar provincias
function cargarProvincias() {
  const select = document.getElementById("regProvincia");
  if (!select) return;
  select.innerHTML = '<option value="">Seleccioná tu provincia</option>';

  fetch("https://apis.datos.gob.ar/georef/api/provincias?campos=id,nombre")
    .then((res) => res.json())
    .then((data) => {
      data.provincias.sort((a, b) => a.nombre.localeCompare(b.nombre));
      data.provincias.forEach((p) => {
        const option = document.createElement("option");
        option.value = p.id; // valor = ID
        option.textContent = p.nombre;
        select.appendChild(option);
        provinciasMap[p.id] = p.nombre;
      });
    })
    .catch((err) => console.error("Error al cargar provincias:", err));
}

// Cargar departamentos al cambiar provincia
const provinciaSelect = document.getElementById("regProvincia");
if (provinciaSelect) {
  provinciaSelect.addEventListener("change", function () {
    const provinciaId = this.value;
    const depSelect = document.getElementById("regDepartamento");
    const ciudadSelect = document.getElementById("regCiudad");

    depSelect.innerHTML =
      '<option value="">Seleccioná tu departamento</option>';
    ciudadSelect.innerHTML = '<option value="">Seleccioná tu ciudad</option>';
    depSelect.disabled = true;
    ciudadSelect.disabled = true;

    if (!provinciaId) return;

    fetch(
      `https://apis.datos.gob.ar/georef/api/departamentos?provincia=${provinciaId}&campos=id,nombre&max=1000`
    )
      .then((res) => res.json())
      .then((data) => {
        depSelect.innerHTML += data.departamentos
          .map((dep) => `<option value="${dep.id}">${dep.nombre}</option>`)
          .join("");
        depSelect.disabled = false;
      })
      .catch(() => {
        depSelect.innerHTML = "<option>Error al cargar departamentos</option>";
      });
  });
}

// Cargar ciudades al cambiar departamento
const departamentoSelect = document.getElementById("regDepartamento");
if (departamentoSelect) {
  departamentoSelect.addEventListener("change", function () {
    const departamentoId = this.value;
    const ciudadSelect = document.getElementById("regCiudad");
    const provinciaId = document.getElementById("regProvincia").value;

    ciudadSelect.innerHTML = "<option>Cargando ciudades...</option>";
    ciudadSelect.disabled = true;

    if (!departamentoId || !provinciaId) {
      ciudadSelect.innerHTML = '<option value="">Seleccioná tu ciudad</option>';
      return;
    }

    fetch(
      `https://apis.datos.gob.ar/georef/api/localidades?provincia=${provinciaId}&departamento=${departamentoId}&campos=id,nombre&max=1000`
    )
      .then((res) => res.json())
      .then((data) => {
        ciudadSelect.innerHTML = data.localidades
          .map((loc) => `<option value="${loc.id}">${loc.nombre}</option>`)
          .join("");
        ciudadSelect.disabled = false;
      })
      .catch(() => {
        ciudadSelect.innerHTML = "<option>Error al cargar ciudades</option>";
      });
  });
}

// ==============================
// 🔵 Cargar provincias cuando se abre el modal
// ==============================
const authModal = document.getElementById("authModal");
if (authModal) {
  authModal.addEventListener("shown.bs.modal", () => {
    cargarProvincias();
  });
}
