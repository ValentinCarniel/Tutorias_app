const API_LISTAR = "http://localhost/Tutoria/api/listar_tutorias.php";
const API_CREAR = "http://localhost/Tutoria/api/crear_tutoria.php";
const API_EDITAR = "http://localhost/Tutoria/api/editar_tutoria.php";
const API_ELIMINAR = "http://localhost/Tutoria/api/eliminar_tutoria.php";
const API_MATERIAS = "http://localhost/Tutoria/api/listar_materias.php";

document.addEventListener("DOMContentLoaded", () => {
  cargarTutorias();
  cargarMaterias();

  document
    .getElementById("formTutoria")
    .addEventListener("submit", guardarTutoria);
});

function cargarTutorias() {
  fetch(API_LISTAR)
    .then((res) => {
      if (!res.ok) throw new Error("Error en la respuesta");
      return res.json();
    })
    .then((data) => {
      const tbody = document.getElementById("tablaTutorias");
      tbody.innerHTML = "";
      data.forEach((t) => {
        tbody.innerHTML += `
          <tr>
            <td>${t.nombre_materia}</td>
            <td>${t.descripcion}</td>
            <td>$${parseFloat(t.precio).toFixed(2)}</td>
            <td>${new Date(t.fecha_publicacion).toLocaleDateString()}</td>
            <td>
              <button class="btn btn-sm btn-outline-morado me-1" onclick='editarTutoria(${JSON.stringify(
                t
              )})'>Editar</button>
              <button class="btn btn-sm btn-outline-danger" onclick="eliminarTutoria(${
                t.id_tutoria
              })">Eliminar</button>
            </td>
          </tr>
        `;
      });
    })
    .catch((err) => console.error("Error cargando tutorías:", err));
}

function cargarMaterias() {
  fetch(API_MATERIAS)
    .then((res) => {
      if (!res.ok) throw new Error("Error en la respuesta");
      return res.json();
    })
    .then((data) => {
      const select = document.getElementById("idMateria");
      select.innerHTML = "";
      data.forEach((m) => {
        const option = document.createElement("option");
        option.value = m.id_materia;
        option.textContent = m.nombre_materia;
        select.appendChild(option);
      });
    })
    .catch((err) => console.error("Error cargando materias:", err));
}

function abrirModalNuevaTutoria() {
  document.getElementById("formTutoria").reset();
  document.getElementById("idTutoria").value = "";
  new bootstrap.Modal(document.getElementById("modalTutoria")).show();
}

function guardarTutoria(e) {
  e.preventDefault();
  const id = document.getElementById("idTutoria").value.trim();
  const datos = new URLSearchParams({
    id_materia: document.getElementById("idMateria").value,
    descripcion: document.getElementById("descripcion").value.trim(),
    precio: document.getElementById("precio").value,
  });

  let url = API_CREAR;
  if (id) {
    url = API_EDITAR;
    datos.append("id_tutoria", id);
  }

  fetch(url, {
    method: "POST",
    body: datos,
  })
    .then((res) => res.text())
    .then((resp) => {
      if (resp === "ok") {
        const modalEl = document.getElementById("modalTutoria");
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();

        document.getElementById("formTutoria").reset();
        document.getElementById("idTutoria").value = "";

        cargarTutorias();

        // Mostrar toast
        const toastEl = document.getElementById("toastGuardado");
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
      } else {
        alert("Error guardando tutoría: " + resp);
      }
    })
    .catch((err) => alert("Error en la petición: " + err));
}

function editarTutoria(t) {
  document.getElementById("idTutoria").value = t.id_tutoria;
  document.getElementById("descripcion").value = t.descripcion;
  document.getElementById("precio").value = t.precio;
  document.getElementById("idMateria").value = t.id_materia || "";

  new bootstrap.Modal(document.getElementById("modalTutoria")).show();
}

function eliminarTutoria(id) {
  if (!confirm("¿Seguro que querés eliminar esta tutoría?")) return;

  fetch(API_ELIMINAR, {
    method: "POST",
    body: new URLSearchParams({ id_tutoria: id }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Error HTTP: " + res.status);
      return res.text();
    })
    .then((msg) => {
      if (msg === "ok") {
        cargarTutorias();
      } else {
        alert("Error al eliminar: " + msg);
      }
    })
    .catch((err) => alert("Error en la petición: " + err.message));
}
