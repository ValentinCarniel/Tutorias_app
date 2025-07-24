const API_TUTORIAS = "http://localhost/tutoria/get_alumno_tutoria.php";
const API_VERIFICAR = "http://localhost/TUTORIA/verificar_token.php";
const LINK_MERCADOPAGO = "https://www.mercadopago.com.ar/checkout/v1/redirect?preference-id=TEST1234";

let logueado = false;

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
      localStorage.setItem("nombre", data.nombre);
      localStorage.setItem("rol", data.rol);
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
}

// 🔓 Cerrar sesión
function cerrarSesion() {
  localStorage.removeItem("token");
  localStorage.removeItem("rol");
  localStorage.removeItem("nombre");
  configurarVistaPublica();
  mostrarEstadoSesion();
  window.location.href = "index.html"; // 🔁 Redirige al inicio
}


// 🔍 Mostrar estado de sesión en pantalla (footer)
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

// ❤️ Me gusta
function likePost(button) {
  if (!logueado) return redirigirALogin();

  const isLiked = button.classList.toggle("liked");
  const heartSpan = button.querySelector(".heart");
  heartSpan.style.color = isLiked ? "red" : "black";

  button.textContent = isLiked ? "¡Te gusta!" : "Me gusta";
  button.prepend(heartSpan);
  button.style.backgroundColor = isLiked ? "var(--morado)" : "";
  button.style.color = isLiked ? "#fff" : "";
}

// 🧪 Buscador
document.getElementById("searchTutores").addEventListener("input", function () {
  const query = this.value.toLowerCase();
  const posts = document.querySelectorAll(".post");

  posts.forEach(post => {
    const contenido = post.textContent.toLowerCase();
    post.style.display = contenido.includes(query) ? "block" : "none";
  });
});

// ✨ Animación
function animarPosts() {
  const posts = document.querySelectorAll(".post");
  posts.forEach((post, i) => {
    post.style.opacity = "0";
    post.style.transform = "translateY(20px)";
    setTimeout(() => {
      post.style.transition = "all 0.4s ease";
      post.style.opacity = "1";
      post.style.transform = "translateY(0)";
    }, i * 150);
  });
}

// 🧱 Crear tutoría
function crearPost(tutoria, index) {
  const post = document.createElement("div");
  post.className = "post mb-4 p-4 border rounded bg-white shadow-sm";

  const collapseID = `comentarios${index}`;
  const etiquetasHTML = tutoria.referencias.map((ref, i) => {
    const clase = i % 2 === 0 ? "bg-morado" : "bg-morado-suave";
    return `<span class="badge ${clase}">#${ref}</span>`;
  }).join(" ");

  post.innerHTML = `
    <h5 class="text-morado fw-bold">${tutoria.titulo}</h5>
    <p class="mb-1 text-muted">
      <i class="bi bi-person-circle me-1"></i>
      Impartido por <strong>${tutoria.nombre_tutor}</strong>
    </p>
    <p>${tutoria.descripcion}</p>
    <p class="fw-bold text-success">💰 ${tutoria.precio} ARS</p>
    <button class="btn btn-morado mb-3" onclick="${logueado ? `window.location.href='${LINK_MERCADOPAGO}'` : `redirigirALogin()`}">Contactar</button>

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

// 🚀 Cargar tutorías
async function cargarTutorias() {
  try {
    const response = await fetch(API_TUTORIAS);
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
  await cargarTutorias();
});

