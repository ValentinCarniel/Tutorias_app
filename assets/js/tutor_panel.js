// ============================
// 🌟 Inicialización
// ============================
document.addEventListener("DOMContentLoaded", () => {
  const nombre = localStorage.getItem("nombre");
  const saludo = document.getElementById("saludoTutor");
  const nombreExtra = document.getElementById("nombreTutorNavbar");

  if (nombre) {
    if (saludo) saludo.textContent = `Bienvenido, ${nombre}`;
    if (nombreExtra) nombreExtra.textContent = nombre;
  }

  listarTutorias();
});

// ============================
// 📦 Funciones principales
// ============================

// Listar tutorías del tutor
async function listarTutorias() {
  const muro = document.getElementById("muroTutorias");
  const token = localStorage.getItem("token");
  if (!token)
    return (muro.innerHTML = `<div class="alert alert-warning">No estás autenticado.</div>`);

  try {
    const res = await fetch(
      "http://localhost/Tutoria/api/get_tutor_tutoria.php",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await res.json();
    if (!data.success)
      throw new Error(data.error || "Error al obtener publicaciones.");

    muro.innerHTML = "";
    data.tutorias.forEach((post, index) => {
      const refBadges = (post.referencias || [])
        .map((ref) => `<span class="badge bg-morado">#${ref}</span>`)
        .join(" ");

      muro.innerHTML += `
        <div class="post-tutoria">
          <div class="d-flex justify-content-between align-items-start">
            <h5>${post.titulo}</h5>
            <div class="dropdown">
              <i class="bi bi-three-dots-vertical text-muted" style="cursor:pointer;" data-bs-toggle="dropdown"></i>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><a class="dropdown-item" href="#" onclick='abrirEdicion(${JSON.stringify(
                  post
                )})'>Editar</a></li>
                <li><a class="dropdown-item text-danger" href="#" onclick="eliminarTutoria(${
                  post.id_tutoria
                })">Eliminar</a></li>
              </ul>
            </div>
          </div>
          <p>${post.descripcion}</p>
          <p class="text-muted">AR$ ${parseFloat(post.precio).toFixed(2)}</p>
          <div class="d-flex gap-2 flex-wrap">
            <button class="btn btn-outline-morado btn-like" onclick="like(this)">
              <span class="heart">♥</span> Me gusta
            </button>
            <button class="btn btn-outline-morado" data-bs-toggle="collapse" data-bs-target="#comentarios${index}">
              Ver comentarios
            </button>
          </div>
          <div class="collapse mt-3" id="comentarios${index}">
            <div class="comentarios">
              <textarea class="form-control mb-2" placeholder="Escribí un comentario..."></textarea>
              <button class="btn btn-morado w-100">Enviar</button>
            </div>
          </div>
          <div class="mt-3">${refBadges}</div>
        </div>
      `;
    });
  } catch (err) {
    muro.innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`;
  }
}

// Limpiar y abrir modal para nueva tutoría
function abrirModalTutoria() {
  const form = document.getElementById("formTutoria");
  form.reset();
  document.getElementById("idTutoria").value = "";
  new bootstrap.Modal(document.getElementById("modalTutoria")).show();
}

// Abrir modal con datos para editar
function abrirEdicion(post) {
  const modal = new bootstrap.Modal(document.getElementById("modalTutoria"));
  modal.show();

  document.getElementById("idTutoria").value = post.id_tutoria;
  document.getElementById("titulo").value = post.titulo;
  document.getElementById("descripcion").value = post.descripcion;
  document.getElementById("precio").value = post.precio;

  const refs = post.referencias || [];
  document.getElementById("ref1").value = refs[0] || "";
  document.getElementById("ref2").value = refs[1] || "";
  document.getElementById("ref3").value = refs[2] || "";
}

// Like visual
function like(btn) {
  btn.classList.toggle("liked");
  btn.innerText = btn.classList.contains("liked") ? "♥ Te gusta" : "♥ Me gusta";
}

// ============================
// 📤 Publicar o actualizar tutoría
// ============================
document.getElementById("formTutoria").addEventListener("submit", async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");
  if (!token)
    return Swal.fire({
      title: "No estás autenticado",
      text: "Iniciá sesión para publicar tutorías.",
      icon: "warning",
      confirmButtonColor: "#ffc107",
    });

  const titulo = document.getElementById("titulo").value.trim();
  const descripcion = document.getElementById("descripcion").value.trim();
  const precio = parseFloat(document.getElementById("precio").value);
  const referencias = [
    document.getElementById("ref1").value,
    document.getElementById("ref2").value,
    document.getElementById("ref3").value,
  ]
    .map((r) => r.trim())
    .filter((r) => r !== "");

  const idTutoria = document.getElementById("idTutoria").value.trim();
  const endpoint = idTutoria ? "editar_tutoria.php" : "post_tutoria.php";

  const payload = { titulo, descripcion, precio, referencias };
  if (endpoint === "editar_tutoria.php")
    payload.id_tutoria = parseInt(idTutoria);

  try {
    const res = await fetch(`http://localhost/Tutoria/api/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (!result.success)
      throw new Error(result.error || "No se pudo procesar la solicitud.");

    bootstrap.Modal.getInstance(document.getElementById("modalTutoria")).hide();
    document.getElementById("formTutoria").reset();

    Swal.fire({
      title:
        endpoint === "editar_tutoria.php"
          ? "¡Tutoría actualizada!"
          : "¡Tutoría publicada!",
      text: result.message,
      icon: "success",
      confirmButtonColor: "#6f42c1",
    });

    listarTutorias();
  } catch (err) {
    Swal.fire({
      title: "Error",
      text: err.message,
      icon: "error",
      confirmButtonColor: "#dc3545",
    });
  }
});

// ============================
// 🗑️ Eliminar tutoría
// ============================
async function eliminarTutoria(id) {
  const token = localStorage.getItem("token");
  const confirm = await Swal.fire({
    title: "¿Eliminar tutoría?",
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#dc3545",
  });
  if (!confirm.isConfirmed) return;

  try {
    const res = await fetch("http://localhost/Tutoria/api/delete_tutoria.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id_tutoria: id }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "No se pudo eliminar.");

    Swal.fire("Eliminado", data.message, "success");
    listarTutorias();
  } catch (err) {
    Swal.fire("Error", err.message, "error");
  }
}

// ============================
// 🔒 Cerrar sesión
// ============================
function cerrarSesion() {
  localStorage.clear();
  window.location.href = "/pages/Index.html";
}
