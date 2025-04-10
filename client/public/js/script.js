document.addEventListener('DOMContentLoaded', function() {
    // --- LOGIN SIMULADO (se ejecuta siempre si existe el formulario) ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
  
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
  
        if (username === 'admin' && password === '1234') {
          alert('Login correcto');
          window.location.href = 'dashboard.html';
        } else {
          alert('Usuario o contraseña incorrectos');
        }
      });
    }
  
    // --- Manejo del modal para Clientes ---
    const modalCliente = document.getElementById('modalCliente');
    const btnAgregar = document.getElementById('btnAgregar');
    const closeElements = document.querySelectorAll('.modal .close');
  
    if (btnAgregar) {
      btnAgregar.addEventListener('click', function() {
        openModal(modalCliente);
      });
    }
  
    // --- Manejo del modal para Activos ---
    const modalActivo = document.getElementById('modalActivo');
    const btnAgregarActivo = document.getElementById('btnAgregarActivo');
    if (btnAgregarActivo) {
      btnAgregarActivo.addEventListener('click', function() {
        openModal(modalActivo);
      });
    }
  
    // Cerrar modal al hacer clic en la X
    closeElements.forEach(el => {
      el.addEventListener('click', function() {
        closeModal(el.closest('.modal'));
      });
    });
  
    // Cerrar modal al hacer clic fuera del contenido
    window.addEventListener('click', function(event) {
      if (event.target.classList.contains('modal')) {
        closeModal(event.target);
      }
    });
  
    function openModal(modal) {
      modal.style.display = 'flex';
    }
  
    function closeModal(modal) {
      modal.style.display = 'none';
    }
  
    // --- CRUD Simulado para Clientes ---
    let clientes = [];
    const clienteForm = document.getElementById('clienteForm');
    const clienteTable = document.getElementById('clienteTable');
  
    if (clienteForm) {
      clienteForm.addEventListener('submit', function(event) {
        event.preventDefault();
  
        const id = document.getElementById('clienteId').value;
        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('email').value;
  
        if (id) {
          const index = clientes.findIndex(c => c.id == id);
          if (index > -1) {
            clientes[index] = { id, nombre, email };
          }
        } else {
          const newCliente = {
            id: clientes.length + 1,
            nombre,
            email
          };
          clientes.push(newCliente);
        }
        refreshClienteTable();
        clienteForm.reset();
        closeModal(modalCliente);
      });
    }
  
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
    }
  
    window.deleteCliente = function(id) {
      clientes = clientes.filter(c => c.id != id);
      refreshClienteTable();
    }
  });
  