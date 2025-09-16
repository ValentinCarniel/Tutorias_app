// 🎓 Render del panel del alumno con pestañas
function renderVistaAlumno() {
  const content = document.querySelector(".content");
  if (!content) return;

  content.innerHTML = `
    <h2 class="text-center mb-4">🎓 Mis clases</h2>

    <!-- Pestañas -->
    <ul class="nav nav-tabs justify-content-center" id="tabsAlumno">
      <li class="nav-item">
        <a class="nav-link active" data-bs-toggle="tab" href="#pendientesAlumno">Pendientes</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" data-bs-toggle="tab" href="#agendadasAlumno">Agendadas</a>
      </li>
    </ul>

    <!-- Contenido de pestañas -->
    <div class="tab-content mt-4">
      <div class="tab-pane fade show active" id="pendientesAlumno">
        <div id="lista-pendientes-alumno" class="row">
          <!-- Cards se insertan con JS -->
        </div>
      </div>
      <div class="tab-pane fade" id="agendadasAlumno">
        <div id="lista-agendadas-alumno" class="row">
          <!-- Cards se insertan con JS -->
        </div>
      </div>
    </div>
  `;

  const tabTrigger = new bootstrap.Tab(document.querySelector('[href="#pendientesAlumno"]'));
  tabTrigger.show();
}

// 📦 Cargar clases del alumno
function mostrarPanelAlumno() {
  console.log("🎓 Panel del alumno activado");
  cargarClasesPendientesAlumno();
  cargarClasesAgendadasAlumno();
}

// 🔄 Clases pendientes (sin fecha agendada)
async function cargarClasesPendientesAlumno() {
  const token = localStorage.getItem("token");
  const contenedor = document.getElementById("lista-pendientes-alumno");
  contenedor.innerHTML = "";

  if (!token || !contenedor) return;

  try {
    const res = await fetch("http://localhost/Tutoria/get_conexiones_alumno.php", {
      headers: { "Authorization": `Bearer ${token}` }
    });

    const data = await res.json();

    if (!data.success) throw new Error(data.error || "Error al obtener clases pendientes.");

    if (data.conexiones.length === 0) {
      contenedor.innerHTML = `
        <div class="col-12 text-center text-muted">
          <p>No tenés clases pendientes por agendar.</p>
        </div>
      `;
      return;
    }

    data.conexiones.forEach(con => {
      const card = document.createElement("div");
      card.className = "col-md-6 mb-4";

      card.innerHTML = `
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title">👨‍🏫 ${con.tutor_nombre}</h5>
            <p class="card-text"><strong>Tutoría:</strong> ${con.tutoria_titulo}</p>
            <p class="card-text"><strong>Conectado el:</strong> ${new Date(con.fecha_conexion).toLocaleString()}</p>
            <div class="alert alert-warning mt-3 mb-0">
              Esperando que el tutor agende la clase.
            </div>
          </div>
        </div>
      `;
      contenedor.appendChild(card);
    });

  } catch (err) {
    console.error("❌ Error en cargarClasesPendientesAlumno:", err);
    contenedor.innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`;
  }
}

// ✅ Clases agendadas
async function cargarClasesAgendadasAlumno() {
  const token = localStorage.getItem("token");
  const contenedor = document.getElementById("lista-agendadas-alumno");
  contenedor.innerHTML = "";

  if (!token || !contenedor) return;

  try {
    const res = await fetch("http://localhost/Tutoria/get_clases_alumno.php", {
      headers: { "Authorization": `Bearer ${token}` }
    });

    const data = await res.json();

    if (!data.success) throw new Error(data.error || "Error al obtener clases agendadas.");

    if (data.clases.length === 0) {
      contenedor.innerHTML = `
        <div class="col-12 text-center text-muted">
          <pTodavía no tenés clases agendadas.</p>
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
            <h5 class="card-title">👨‍🏫 ${clase.tutor_nombre}</h5>
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
    console.error("❌ Error en cargarClasesAgendadasAlumno:", err);
    contenedor.innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`;
  }
}