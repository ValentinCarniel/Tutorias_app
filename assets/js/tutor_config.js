// Mostrar imagen seleccionada
document.getElementById('fotoPerfil').addEventListener('change', function (e) {
  const reader = new FileReader();
  reader.onload = function () {
    document.getElementById('previewImg').src = reader.result;
  };
  if (e.target.files[0]) {
    reader.readAsDataURL(e.target.files[0]);
  }
});

// Guardar perfil (simulado)
document.getElementById('guardarBtn').addEventListener('click', function () {
  const descripcion = document.getElementById('descripcion').value;
  const materiasSeleccionadas = [];
  document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked').forEach(chk => {
    materiasSeleccionadas.push(chk.value);
  });

  // Simular guardado
  alert("Perfil guardado:\n\nMaterias: " + materiasSeleccionadas.join(', ') + "\n\nDescripción:\n" + descripcion);

  // Luego podrías enviar esto con fetch() a un backend PHP o API
  /*
  fetch('api/guardar_perfil.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      descripcion: descripcion,
      materias: materiasSeleccionadas
    })
  }).then(res => res.json()).then(data => {
    if
