// Manejo del formulario de login
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
  
    if (email === 'admin@tuto.com' && password === '123456') {
      alert('¡Bienvenido/a!');
      bootstrap.Modal.getInstance(document.getElementById('authModal')).hide();
    } else {
      alert('Credenciales incorrectas.');
    }
  });
  
  // Manejo del formulario de registro
  document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
  
    // Simulación de registro exitoso
    alert(`¡Gracias por registrarte, ${name}!`);
    bootstrap.Modal.getInstance(document.getElementById('authModal')).hide();
  });
  