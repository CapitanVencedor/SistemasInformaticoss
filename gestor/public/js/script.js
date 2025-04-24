// gestor/public/js/script.js
document.addEventListener('DOMContentLoaded', () => {
  console.log('Script GESTOR cargado');

  // Cargo clientes desde localStorage (o vacío si no hay)
  let clientes = JSON.parse(localStorage.getItem('aurum_clientes') || '[]');

  // Referencias en el DOM
  const btnAgregar = document.getElementById('btnAgregar');
  const modal      = document.getElementById('modalCliente');
  const form       = document.getElementById('clienteForm');
  const tablaBody  = document.getElementById('clienteTable');

  // FUNCIONES MODAL
  function openModal()  { modal.style.display = 'flex'; }
  function closeModal() { modal.style.display = 'none'; }

  // Cerrar modal al clicar la X o fondo
  document.querySelector('.modal .close').addEventListener('click', closeModal);
  window.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

  // Mostrar modal al clicar el botón
  btnAgregar.addEventListener('click', openModal);

  // Refrescar tabla de clientes
  function refreshTable() {
    tablaBody.innerHTML = '';
    clientes.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${c.id}</td>
        <td>${c.nombre}</td>
        <td>${c.email}</td>
        <td>
          <button onclick="editCliente(${c.id})">Editar</button>
          <button onclick="deleteCliente(${c.id})">Eliminar</button>
        </td>
      `;
      tablaBody.appendChild(tr);
    });
  }

  // Guardar cambios de formulario
  form.addEventListener('submit', e => {
    e.preventDefault();
    const idField = document.getElementById('clienteId').value;
    const nombre  = document.getElementById('nombre').value.trim();
    const email   = document.getElementById('email').value.trim();

    if (idField) {
      // Editar existente
      const idx = clientes.findIndex(x => x.id == idField);
      clientes[idx] = { id: +idField, nombre, email };
    } else {
      // Crear nuevo
      const newId = clientes.length ? clientes[clientes.length - 1].id + 1 : 1;
      clientes.push({ id: newId, nombre, email });
    }

    localStorage.setItem('aurum_clientes', JSON.stringify(clientes));
    form.reset();
    closeModal();
    refreshTable();
  });

  // Funciones globales para editar/borrar
  window.editCliente = id => {
    const c = clientes.find(x => x.id == id);
    document.getElementById('clienteId').value = c.id;
    document.getElementById('nombre').value    = c.nombre;
    document.getElementById('email').value     = c.email;
    openModal();
  };

  window.deleteCliente = id => {
    if (!confirm(`¿Eliminar cliente #${id}?`)) return;
    clientes = clientes.filter(x => x.id != id);
    localStorage.setItem('aurum_clientes', JSON.stringify(clientes));
    refreshTable();
  };

  // Inicializo tabla
  refreshTable();
});
