const API_VERIFICAR = "http://localhost/TUTORIA/verificar_token.php";
const LINK_MERCADOPAGO = "https://www.mercadopago.com.ar/checkout/v1/redirect?preference-id=TEST1234";

let logueado = false;
let rolUsuario = "";

// 🔐 Mostrar modal de login
function redirigirALogin() {
  const modalElement = document.getElementById("authModal");
  const loginTabButton = document.getElementById("login-tab");

  if (modalElement && loginTabButton) {
    const modal = new bootstrap.Modal(modalElement);
    modal.show();

    const loginTab = new bootstrap.Tab(loginTabButton);
    loginTab.show();
  }
}

// 🔐 Verificar sesión del usuario
async function verificarSesion() {
  const token = localStorage.getItem("token");
  if (!token) {
    configurarVistaPublica();
    return;
  }

  try {
    const res = await fetch(API_VERIFICAR, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();

    if (res.ok && Boolean(data.logged_in) && data.nombre) {
      logueado = true;
      rolUsuario = (data.rol || "").toLowerCase();
      localStorage.setItem("nombre", data.nombre);
      localStorage.setItem("rol", rolUsuario);
      configurarVistaLogueado(data.nombre);
    } else {
      configurarVistaPublica();
    }
  } catch {
    configurarVistaPublica();
  }
}

// 🔓 Vista para visitantes
function configurarVistaPublica() {
  logueado = false;
  rolUsuario = "";
  localStorage.removeItem("nombre");
  localStorage.removeItem("rol");

  const navRight = document.getElementById("navUsuario");
  if (navRight) {
    navRight.innerHTML = `<button class="btn btn-light" onclick="redirigirALogin()">Iniciar sesión</button>`;
  }

  const sidebar = document.querySelector(".sidebar");
  if (sidebar) {
    sidebar.innerHTML = `
      <div class="text-center p-3">
        <p class="mb-2 fw-bold">¿Querés comentar, contactar o guardar favoritos?</p>
        <button class="btn btn-sm btn-primary" onclick="redirigirALogin()">Ingresá para interactuar</button>
      </div>
    `;
  }
}

// ✅ Vista para usuarios logueados
function configurarVistaLogueado(nombre) {
  const navRight = document.getElementById("navUsuario");
  if (navRight) {
    navRight.innerHTML = `
      <div class="d-flex gap-3 align-items-center">
        <span class="text-white">Hola, ${nombre} 👋</span>
        <button class="btn btn-sm btn-outline-light" onclick="cerrarSesion()">Cerrar sesión</button>
      </div>
    `;
  }

  // 🔗 Activar panel de clases si el usuario es alumno
  const rol = localStorage.getItem("rol");
  const linkClases = document.getElementById("linkClases");

  if (linkClases) {
    if (rol === "alumno") {
      linkClases.style.display = "block";
      linkClases.addEventListener("click", (e) => {
        e.preventDefault();
        renderVistaAlumno();      // función definida en panel_alumno.js
        mostrarPanelAlumno();     // función definida en panel_alumno.js
      });
    } else {
      linkClases.style.display = "none";
    }
  }
}

// 🔓 Cerrar sesión
function cerrarSesion() {
  localStorage.removeItem("token");
  localStorage.removeItem("rol");
  localStorage.removeItem("nombre");
  configurarVistaPublica();
  mostrarEstadoSesion();
  window.location.href = "index.html";
}

// 🔍 Mostrar estado de sesión
function mostrarEstadoSesion() {
  const estado = document.getElementById("estadoSesion");
  const nombre = localStorage.getItem("nombre");
  const rol = localStorage.getItem("rol");

  if (estado) {
    if (logueado && nombre && rol) {
      estado.innerHTML = `🟢 Sesión activa como <strong>${nombre}</strong> (rol: <em>${rol}</em>)`;
    } else {
      estado.innerHTML = `🔴 Sesión no iniciada`;
    }
  }
}

// 🧱 Crear tutoría
function crearPost(tutoria, index) {
  const post = document.createElement("div");
  post.className = "post-tutoria mb-4 p-4 border rounded bg-white shadow-sm";

  const collapseID = `comentarios${index}`;
  const etiquetasHTML = tutoria.referencias.map((ref, i) => {
    const clase = i % 2 === 0 ? "bg-morado" : "bg-morado-suave";
    return `<span class="badge ${clase}">#${ref}</span>`;
  }).join(" ");

  const botonConectar = (logueado && rolUsuario === "alumno") ? `
    <button class="btn btn-outline-success mb-3" onclick="conectarTutoria(${tutoria.id_tutoria})">
      <i class="bi bi-camera-video"></i> Conectar
    </button>
  ` : "";

  post.innerHTML = `
    <h5 class="text-morado fw-bold">${tutoria.titulo}</h5>
    <p class="mb-1 text-muted">
      <i class="bi bi-person-circle me-1"></i>
      Impartido por <strong>${tutoria.nombre_tutor}</strong>
    </p>
    <p>${tutoria.descripcion}</p>
    <p class="fw-bold text-success">💰 ${tutoria.precio} ARS</p>

    <button class="btn btn-morado mb-3" onclick="${logueado ? `window.location.href='${LINK_MERCADOPAGO}'` : `redirigirALogin()`}">
      Contactar
    </button>

    ${botonConectar}

    <div class="d-flex gap-2 flex-wrap">
      <button class="btn btn-outline-morado btn-like" onclick="likePost(this)">
        <span class="heart">♥</span> Me gusta
      </button>
      <button class="btn btn-outline-morado" data-bs-toggle="collapse" data-bs-target="#${collapseID}" onclick="${!logueado ? `redirigirALogin()` : ''}">Ver comentarios</button>
    </div>

    <div class="collapse mt-3" id="${collapseID}">
      <div class="card card-body bg-morado-claro">
        <textarea class="form-control mb-2" placeholder="Escribí un comentario..." rows="2" ${!logueado ? 'disabled' : ''}></textarea>
        <button class="btn btn-morado w-100" ${!logueado ? 'onclick="redirigirALogin()"' : ''}>Comentar</button>
        <div class="mt-2">
          <p class="text-muted"><strong>${tutoria.nombre_tutor}</strong>: ¡Gracias por tu interés!</p>
        </div>
      </div>
    </div>

    <div class="mt-3">
      ${etiquetasHTML}
    </div>
  `;

  return post;
}

// 🚀 Cargar tutorías según rol
async function cargarTutorias() {
  const endpoint = rolUsuario === "tutor"
    ? "http://localhost/tutoria/get_tutor_tutorias.php"
    : "http://localhost/tutoria/get_alumno_tutoria.php";

  try {
    const response = await fetch(endpoint);
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Error desconocido");
    }

    const contenedor = document.getElementById("publicaciones");
    const posts = data.tutorias.map((tutoria, index) => crearPost(tutoria, index));
    posts.forEach(post => contenedor.appendChild(post));
    animarPosts();
  } catch (error) {
    console.error("Error al cargar tutorías:", error.message);
    document.getElementById("publicaciones").innerHTML += `<p class="text-danger">No se pudieron cargar las tutorías.</p>`;
  }
}

// 🔁 Inicializar
document.addEventListener("DOMContentLoaded", async () => {
  await verificarSesion();
  mostrarEstadoSesion();
  await cargarTutorias(); // 👈 siempre carga el muro al iniciar

  // 🔍 Activar búsqueda de tutorías
  const buscador = document.getElementById("searchTutores");
  if (buscador) {
    buscador.addEventListener("input", function () {
      const query = this.value.toLowerCase();
      const posts = document.querySelectorAll(".post-tutoria");

      posts.forEach(post => {
        const texto = post.textContent.toLowerCase();
        post.style.display = texto.includes(query) ? "block" : "none";
      });
    });
  }
});

// 🔗 Conectar alumno con tutoría
function conectarTutoria(tutoriaId) {
  const token = localStorage.getItem("token");
  if (!token) {
    Swal.fire("Sesión no iniciada", "Por favor iniciá sesión para conectar", "warning");
    return;
  }

  fetch("http://localhost/tutoria/connect_tutoria.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`    },
    body: JSON.stringify({ tutoria_id: tutoriaId })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      Swal.fire("¡Conectado!", data.message, "success");
      const btn = document.querySelector(`button[onclick="conectarTutoria(${tutoriaId})"]`);
      if (btn) {
        btn.disabled = true;
        btn.innerText = "Ya conectado";
      }
    } else {
      Swal.fire("Ups...", data.message, "error");
    }
  })
  .catch(err => {
    console.error("Error al conectar:", err);
    Swal.fire("Error", "No se pudo conectar con el servidor", "error");
  });
}
   