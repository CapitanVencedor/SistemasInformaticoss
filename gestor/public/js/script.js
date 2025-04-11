// Ejemplo para crear un usuario con la API
function handleCreateUser(event) {
  event.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  
  fetch('http://localhost:3000/api/usuarios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre: name, email })
  })
  .then(response => response.json())
  .then(data => {
    alert(`Usuario creado: ID: ${data.id}, Nombre: ${data.nombre}`);
    // Aquí podrías redirigir o actualizar la página
  })
  .catch(err => {
    console.error(err);
    alert('Error creando el usuario');
  });
}
