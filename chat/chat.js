const emisor_id = localStorage.getItem("user_id") || 1; // Simulación
const receptor_id = 2; // Simulación
const chatBox = document.getElementById("chatBox");
const inputMensaje = document.getElementById("mensaje");
const btnEnviar = document.getElementById("enviarBtn");

const BASE_URL = "http://127.0.0.1:8000/chat"; // mismo origen que HTML

// Obtener mensajes
async function cargarMensajes() {
  try {
    const res = await fetch(
      `${BASE_URL}/obtener_mensajes.php?emisor=${emisor_id}&receptor=${receptor_id}`
    );
    const data = await res.json();
    chatBox.innerHTML = "";
    data.forEach((msg) => {
      const alineacion = msg.emisor_id == emisor_id ? "text-end" : "text-start";
      const color =
        msg.emisor_id == emisor_id ? "bg-primary text-white" : "bg-light";
      chatBox.innerHTML += `
        <div class="mb-2 ${alineacion}">
          <span class="d-inline-block px-3 py-2 rounded ${color}">
            ${msg.mensaje}
          </span>
          <br><small class="text-muted">${msg.fecha}</small>
        </div>
      `;
    });
    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (err) {
    console.error("Error cargando mensajes:", err);
  }
}

// Enviar mensaje
btnEnviar.addEventListener("click", async () => {
  const mensaje = inputMensaje.value.trim();
  if (!mensaje) return;

  try {
    await fetch(`${BASE_URL}/enviar_mensaje.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emisor_id, receptor_id, mensaje }),
    });
    inputMensaje.value = "";
    cargarMensajes();
  } catch (err) {
    console.error("Error enviando mensaje:", err);
  }
});

// Auto refresco cada 2 segundos
setInterval(cargarMensajes, 2000);
cargarMensajes();
