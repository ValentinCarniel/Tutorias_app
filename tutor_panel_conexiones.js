// 📥 Mostrar panel de conexiones con pestañas
function mostrarConexiones() {
  console.log("✅ Panel de conexiones activado");

  // Oculta el muro y muestra el panel de conexiones
  document.getElementById('panel-muro').classList.add("d-none");
  document.getElementById('panel-conexiones').classList.remove("d-none");

  // Activa la pestaña "Pendientes" usando Bootstrap API
  const tabTrigger = new bootstrap.Tab(document.querySelector('[href="#pendientes"]'));
  tabTrigger.show();

  // Carga contenido en ambas pestañas
  cargarConexiones();       // Pendientes
  cargarClasesAgendadas();  // Agendadas
}

// 🔗 Cargar conexiones pendientes (sin clase agendada)
async function cargarConexiones() {
  const token = localStorage.getItem("token");
  const contenedor = document.getElementById("lista-conexiones");
  contenedor.innerHTML = "";

  if (!token || !contenedor) return;

  try {
    const res = await fetch("http://localhost/Tutoria/get_conexiones_tutor.php", {
      headers: { "Authorization": `Bearer ${token}` }
    });

    const data = await res.json();

    if (!data.success) throw new Error(data.error || "Error al obtener conexiones.");

    if (data.conexiones.length === 0) {
      contenedor.innerHTML = `
        <div class="col-12 text-center text-muted">
          <p>No hay conexiones pendientes por agendar.</p>
        </div>
      `;
      return;
    }

    data.conexiones.forEach(con => {
      const card = document.createElement("div");
      card.className = "col-md-6 mb-4";
      card.id = `card-${con.alumno_id}-${con.tutoria_id}`;

      let contenido = `
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title">👤 ${con.alumno_nombre}</h5>
            <p class="card-text"><strong>Tutoría:</strong> ${con.tutoria_titulo}</p>
            <p class="card-text"><strong>Conectado el:</strong> ${new Date(con.fecha_conexion).toLocaleString()}</p>
            <label>📅 Fecha y hora de clase:</label>
            <input type="datetime-local" id="reunion-${con.alumno_id}-${con.tutoria_id}" class="form-control mb-2" />
            <button class="btn btn-morado w-100" onclick="guardarReunion(${con.alumno_id}, ${con.tutoria_id})">
              Agendar clase
            </button>
          </div>
        </div>
      `;

      card.innerHTML = contenido;
      contenedor.appendChild(card);
    });

  } catch (err) {
    console.error("❌ Error en cargarConexiones:", err);
    contenedor.innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`;
  }
}

// 🗓️ Guardar clase agendada con sala Jitsi única
async function guardarReunion(alumnoId, tutoriaId) {
  const input = document.getElementById(`reunion-${alumnoId}-${tutoriaId}`);
  const fechaHora = input?.value;
  const token = localStorage.getItem("token");

  if (!fechaHora) {
    Swal.fire("Seleccioná una fecha y hora", "", "warning");
    return;
  }

  try {
    const res = await fetch("http://localhost/Tutoria/guardar_reunion.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        alumno_id: alumnoId,
        tutoria_id: tutoriaId,
        fecha_hora: fechaHora
      })
    });

    const data = await res.json();

    if (data.success) {
      Swal.fire({
        title: "Clase agendada",
        text: "La sala Jitsi fue creada automáticamente.",
        icon: "success",
        confirmButtonColor: "#6f42c1"
      });

      const card = document.getElementById(`card-${alumnoId}-${tutoriaId}`);
      if (card) {
        card.classList.add("fade-out");
        setTimeout(() => card.remove(), 500);
      }

      cargarClasesAgendadas(); // Refresca la pestaña de agendadas

    } else {
      throw new Error(data.error || "No se pudo agendar.");
    }

  } catch (err) {
    console.error("❌ Error en guardarReunion:", err);
    Swal.fire("Error", err.message, "error");
  }
}

// ✅ Cargar clases ya agendadas
async function cargarClasesAgendadas() {
  const token = localStorage.getItem("token");
  const contenedor = document.getElementById("lista-agendadas");
  contenedor.innerHTML = "";

  if (!token || !contenedor) return;

  try {
    const res = await fetch("http://localhost/Tutoria/get_clases_agendadas.php", {
      headers: { "Authorization": `Bearer ${token}` }
    });

    const data = await res.json();

    if (!data.success) throw new Error(data.error || "Error al obtener clases agendadas.");

    if (data.clases.length === 0) {
      contenedor.innerHTML = `
        <div class="col-12 text-center text-muted">
          <p>No hay clases agendadas aún.</p>
        </div>
      `;
      return;
    }

    data.clases.forEach(clase => {
      const fecha = new Date(clase.fecha_hora);
      const card = document.createElement("div");
      card.className = "col-md-6 mb-4";

      card.innerHTML = `
        <div class="card border-success shadow-sm">
          <div class="card-body">
            <h5 class="card-title">👤 ${clase.alumno_nombre}</h5>
            <p class="card-text"><strong>Tutoría:</strong> ${clase.tutoria_titulo}</p>
            <p class="card-text"><strong>Fecha:</strong> ${fecha.toLocaleDateString()}</p>
            <p class="card-text"><strong>Hora:</strong> ${fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            <a href="https://meet.jit.si/${clase.sala_jitsi}" target="_blank" class="btn btn-success w-100">
              Entrar a la sala
            </a>
          </div>
        </div>
      `;

      contenedor.appendChild(card);
    });

  } catch (err) {
    console.error("❌ Error en cargarClasesAgendadas:", err);
    contenedor.innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`;
  }
}