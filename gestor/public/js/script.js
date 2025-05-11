// gestor/public/js/script.js

document.addEventListener('DOMContentLoaded', () => {
  console.log('Script GESTOR cargado');

  // referencias DOM
  const linkClientes    = document.getElementById('linkClientes');
  const linkPortafolios = document.getElementById('linkPortafolios');
  const secClientes     = document.getElementById('seccionClientes');
  const secPortafolios  = document.getElementById('seccionPortafolios');

  const btnAgregar      = document.getElementById('btnAgregar');
  const modalCliente    = document.getElementById('modalCliente');
  const formCliente     = document.getElementById('clienteForm');
  const clienteTable    = document.getElementById('clienteTable');
  const portafolioTable = document.getElementById('portafolioTable');

  let clientes    = [];
  let portafolios = [];

  // — toggles de sección —————————————————————————
  function showClientes() {
    secClientes.style.display    = 'block';
    secPortafolios.style.display = 'none';
  }
  function showPortafolios() {
    secClientes.style.display    = 'none';
    secPortafolios.style.display = 'block';
  }

  linkClientes.addEventListener('click', e => {
    e.preventDefault();
    showClientes();
  });
  linkPortafolios.addEventListener('click', e => {
    e.preventDefault();
    showPortafolios();
  });

  // — Modal cliente —————————————————————————
  function openModal()  { modalCliente.style.display = 'flex'; }
  function closeModal() { modalCliente.style.display = 'none'; }

  document.querySelector('#modalCliente .close')
          .addEventListener('click', closeModal);
  window.addEventListener('click', e => {
    if (e.target === modalCliente) closeModal();
  });
  btnAgregar.addEventListener('click', openModal);

  // — Fetch y render de CLIENTES ——————————————————
  async function loadClientes() {
    try {
      const res = await fetch('/api/usuarios');
      clientes  = await res.json();
    } catch (err) {
      console.error('Error cargando clientes:', err);
      clientes = [];
    }
    renderClientes();
  }

  function renderClientes() {
    clienteTable.innerHTML = '';
    clientes.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${c.id}</td>
        <td>${c.nombre}</td>
        <td>${c.email}</td>
        <td>
          <button class="btn" onclick="viewPortfolio(${c.id})">
            Ver Portafolios
          </button>
          <button class="btn" onclick="editCliente(${c.id})">
            Editar
          </button>
          <button class="btn btn-danger" onclick="deleteCliente(${c.id})">
            Eliminar
          </button>
        </td>`;
      clienteTable.appendChild(tr);
    });
  }

  formCliente.addEventListener('submit', async e => {
    e.preventDefault();
    const id     = document.getElementById('clienteId').value;
    const nombre = document.getElementById('nombre').value.trim();
    const email  = document.getElementById('email').value.trim();
    const url    = id ? `/api/usuarios/${id}` : '/api/usuarios';
    const method = id ? 'PUT' : 'POST';

    try {
      await fetch(url, {
        method,
        headers: {'Content-Type': 'application/json'},
        body:    JSON.stringify({ nombre, email, estado: 1 })
      });
      formCliente.reset();
      closeModal();
      await loadClientes();
      await loadPortafolios();
    } catch (err) {
      console.error('Error guardando cliente:', err);
    }
  });

  window.editCliente = id => {
    const c = clientes.find(x => x.id == id);
    document.getElementById('clienteId').value = c.id;
    document.getElementById('nombre').value    = c.nombre;
    document.getElementById('email').value     = c.email;
    openModal();
  };

  window.deleteCliente = async id => {
    if (!confirm(`¿Eliminar cliente #${id}?`)) return;
    try {
      await fetch(`/api/usuarios/${id}`, { method: 'DELETE' });
      await loadClientes();
      await loadPortafolios();
    } catch (err) {
      console.error('Error eliminando cliente:', err);
    }
  };

  // muestra todos o sólo los del cliente
  window.viewPortfolio = clienteId => {
    showPortafolios();
    renderPortafolios(clienteId);
  };

  // redirige al detalle concreto
  window.viewPortfolioDetail = portafolioId => {
    window.location.href = 
      `/gestor/vista_portafolio.html?portafolio_id=${portafolioId}`;
  };

  // — Fetch y render de PORTAFOLIOS —————————————————
  async function loadPortafolios() {
    try {
      const res = await fetch('/api/portafolios');
      portafolios = await res.json();
    } catch (err) {
      console.error('Error cargando portafolios:', err);
      portafolios = [];
    }
    renderPortafolios();
  }

  function renderPortafolios(clienteId = null) {
    portafolioTable.innerHTML = '';
    const lista = clienteId
      ? portafolios.filter(p => p.usuario_id == clienteId)
      : portafolios;

    if (lista.length === 0) {
      portafolioTable.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; padding:1rem;">
            No hay portafolios ${clienteId ? 'para este cliente' : 'registrados'}.
          </td>
        </tr>`;
      return;
    }

    lista.forEach(p => {
      const cliente = clientes.find(c => c.id == p.usuario_id);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.id}</td>
        <td>${cliente ? cliente.nombre : '—'}</td>
        <td>${p.nombre_portafolio}</td>
        <td>${parseFloat(p.saldo_total).toFixed(2)}</td>
        <td>
          <button class="btn"
            onclick="viewPortfolioDetail(${p.id})">
            Ver Detalle
          </button>
        </td>`;
      portafolioTable.appendChild(tr);
    });
  }

  // — Inicialización ——————————————————————————
  (async () => {
    await loadClientes();
    await loadPortafolios();
    showClientes();
  })();
});
