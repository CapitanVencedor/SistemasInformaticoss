console.log('Hola desde script.js de GESTOR');

// Función para manejar la creación de usuario
function handleCreateUser(event) {
  event.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  alert(`Creando usuario: ${name} - ${email}`);
}

// Función para manejar la edición de usuario
function handleEditUser(event) {
  event.preventDefault();
  const userId = document.getElementById('userId').value;
  const newName = document.getElementById('newName').value;
  alert(`Editando usuario #${userId} con nuevo nombre: ${newName}`);
}
