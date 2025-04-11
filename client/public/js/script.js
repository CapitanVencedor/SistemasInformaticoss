document.addEventListener('DOMContentLoaded', function() {
  console.log('Script unificado cargado');

  // -------------------------------
  // Funcionalidad para LOGIN (Cliente)
  // -------------------------------
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      if (username === 'admin' && password === '1234') {
        alert('Login correcto');
        window.location.href = '/dashboard'; // Redirección según la configuración del servidor
      } else {
        alert('Usuario o contraseña incorrectos');
      }
    });
  }

  // -------------------------------
  // Funcionalidad para el módulo Gestor (Clientes)
  // -------------------------------
  const btnAgregarCliente = document.getElementById('btnAgregar');
  const modalCliente = document.getElementById('modalCliente');
  const clienteForm = document.getElementById('clienteForm');
  const clienteTable = document.getElementById('clienteTable');

  if (btnAgregarCliente && modalCliente) {
    btnAgregarCliente.addEventListener('click', () => {
      openModal(modalCliente);
    });
  }

  if (clienteForm) {
    clienteForm.addEventListener('submit', function(event) {
      event.preventDefault();

      const id = document.getElementById('clienteId') ? document.getElementById('clienteId').value : "";
      const nombre = document.getElementById('nombre').value;
      const email = document.getElementById('email').value;

      if (id) {
        const index = clientes.findIndex(c => c.id == id);
        if (index > -1) {
          clientes[index] = { id, nombre, email };
        }
      } else {
        const newId = clientes.length + 1;
        clientes.push({ id: newId, nombre, email });
      }
      refreshClienteTable();
      clienteForm.reset();
      closeModal(modalCliente);
    });
  }

  // Array y funciones para el CRUD simulado de clientes
  let clientes = [];
  function refreshClienteTable() {
    if (!clienteTable) return;
    clienteTable.innerHTML = '';
    clientes.forEach(cliente => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${cliente.id}</td>
        <td>${cliente.nombre}</td>
        <td>${cliente.email}</td>
        <td>
          <button onclick="editCliente(${cliente.id})">Editar</button>
          <button onclick="deleteCliente(${cliente.id})">Eliminar</button>
        </td>
      `;
      clienteTable.appendChild(tr);
    });
  }
  window.editCliente = function(id) {
    const cliente = clientes.find(c => c.id == id);
    if (cliente) {
      document.getElementById('clienteId').value = cliente.id;
      document.getElementById('nombre').value = cliente.nombre;
      document.getElementById('email').value = cliente.email;
      openModal(modalCliente);
    }
  };
  window.deleteCliente = function(id) {
    clientes = clientes.filter(c => c.id != id);
    refreshClienteTable();
  };

  // -------------------------------
  // Funcionalidad para el módulo Cliente (Activos/Portafolio)
  // -------------------------------
  const btnAgregarActivo = document.getElementById('btnAgregarActivo');
  const modalActivo = document.getElementById('modalActivo');
  const activoForm = document.getElementById('activoForm');
  const activoTable = document.getElementById('activoTable');

  if (btnAgregarActivo && modalActivo) {
    btnAgregarActivo.addEventListener('click', function() {
      openModal(modalActivo);
    });
  }

  if (activoForm) {
    activoForm.addEventListener('submit', function(event) {
      event.preventDefault();

      const id = document.getElementById('activoId').value;
      const tipoActivo = document.getElementById('tipoActivo').value;
      const cantidad = document.getElementById('cantidad').value;
      const precio = document.getElementById('precio').value;

      if (id) {
        const index = activos.findIndex(a => a.id == id);
        if (index > -1) {
          activos[index] = { id, tipoActivo, cantidad, precio };
        }
      } else {
        const newId = activos.length + 1;
        activos.push({ id: newId, tipoActivo, cantidad, precio });
      }
      refreshActivoTable();
      activoForm.reset();
      closeModal(modalActivo);
    });
  }

  let activos = [];
  function refreshActivoTable() {
    if (!activoTable) return;
    activoTable.innerHTML = '';
    activos.forEach(activo => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${activo.id}</td>
        <td>${activo.tipoActivo}</td>
        <td>${activo.cantidad}</td>
        <td>${activo.precio}</td>
        <td>
          <button onclick="editActivo(${activo.id})">Editar</button>
          <button onclick="deleteActivo(${activo.id})">Eliminar</button>
        </td>
      `;
      activoTable.appendChild(tr);
    });
  }
  window.editActivo = function(id) {
    const activo = activos.find(a => a.id == id);
    if (activo) {
      document.getElementById('activoId').value = activo.id;
      document.getElementById('tipoActivo').value = activo.tipoActivo;
      document.getElementById('cantidad').value = activo.cantidad;
      document.getElementById('precio').value = activo.precio;
      openModal(modalActivo);
    }
  };
  window.deleteActivo = function(id) {
    activos = activos.filter(a => a.id != id);
    refreshActivoTable();
  };

  // -------------------------------
  // Funciones para abrir y cerrar modales
  function openModal(modal) {
    modal.style.display = 'flex';
  }
  function closeModal(modal) {
    modal.style.display = 'none';
  }

  // Cerrar modal al hacer clic en la "X" o fuera del modal (común para ambos módulos)
  const allCloseElements = document.querySelectorAll('.modal .close');
  allCloseElements.forEach(el => {
    el.addEventListener('click', () => {
      const modal = el.closest('.modal');
      if (modal) closeModal(modal);
    });
  });
  window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
      closeModal(event.target);
    }
  });
});
