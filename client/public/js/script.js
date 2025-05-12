// client/public/js/script.js

document.addEventListener('DOMContentLoaded', () => {
  console.log('Script cargado correctamente');

  // ——— LOGIN ——————————————————————————————
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async e => {
      e.preventDefault();
      const email = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;

      try {
        const res = await fetch('/api/usuarios/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || 'Usuario o contraseña incorrectos');
          return;
        }
        // ✅ Login correcto
        localStorage.setItem('sesionIniciada', 'true');
        localStorage.setItem('usuario', JSON.stringify(data.user));
        localStorage.setItem('rol', data.user.rol);
        localStorage.setItem('portafolioId', data.user.portafolioId);

        // Redirige según rol
        if (data.user.rol === 'admin' || data.user.rol === 'gestor') {
          window.location.href = '/gestor/dashboard.html';
        } else {
          window.location.href = '/main.html';
        }
      } catch (err) {
        console.error('Error en login:', err);
        alert('Error al conectar con el servidor');
      }
    });
  }

  // ——— CRUD CLIENTES (GESTOR) ——————————————————————
  const btnAgregarCliente = document.getElementById('btnAgregar');
  const modalCliente      = document.getElementById('modalCliente');
  const clienteForm       = document.getElementById('clienteForm');
  const clienteTable      = document.getElementById('clienteTable');
  let   clientes = [];

  async function loadClientes() {
    try {
      const res = await fetch('/api/usuarios');
      clientes = await res.json();
      refreshClienteTable();
    } catch (err) {
      console.error('Error cargando clientes:', err);
    }
  }
  loadClientes();

  if (btnAgregarCliente) {
    btnAgregarCliente.addEventListener('click', () => openModal(modalCliente));
  }

  if (clienteForm) {
    clienteForm.addEventListener('submit', async ev => {
      ev.preventDefault();
      const idField = document.getElementById('clienteId').value;
      const nombre  = document.getElementById('nombre').value.trim();
      const email   = document.getElementById('email').value.trim();
      const url     = idField ? `/api/usuarios/${idField}` : '/api/usuarios';
      const method  = idField ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, estado: 1 })
      });
      await loadClientes();
      clienteForm.reset();
      closeModal(modalCliente);
    });
  }

  window.editCliente = id => {
    const c = clientes.find(x => x.id == id);
    if (!c) return;
    document.getElementById('clienteId').value = c.id;
    document.getElementById('nombre').value    = c.nombre;
    document.getElementById('email').value     = c.email;
    openModal(modalCliente);
  };

  window.deleteCliente = async id => {
    if (!confirm(`¿Eliminar cliente #${id}?`)) return;
    await fetch(`/api/usuarios/${id}`, { method: 'DELETE' });
    await loadClientes();
  };

  function refreshClienteTable() {
    if (!clienteTable) return;
    clienteTable.innerHTML = '';
    clientes.forEach(c => {
      const tr = document.createElement('tr');
      tr.setAttribute('data-portafolio-id', c.portafolioId);
      tr.innerHTML = `
        <td>${c.id}</td>
        <td>${c.nombre}</td>
        <td>${c.email}</td>
        <td>
          <button onclick="editCliente(${c.id})">Editar</button>
          <button onclick="deleteCliente(${c.id})">Eliminar</button>
        </td>
      `;
      clienteTable.appendChild(tr);
    });

    clienteTable.addEventListener('click', (e) => {
      const fila = e.target.closest('tr');
      if (!fila) return;

      const portafolioId = fila.dataset.portafolioId;
      if (portafolioId) {
        cargarHistorial(portafolioId);
      }
    });
  }

  // ——— CRUD ACTIVOS (CLIENTE) ——————————————————————
  const btnAgregarActivo = document.getElementById('btnAgregarActivo');
  const modalActivo      = document.getElementById('modalActivo');
  const activoForm       = document.getElementById('activoForm');
  const activoTable      = document.getElementById('activoTable');
  let   activos          = JSON.parse(localStorage.getItem('aurum_activos') || '[]');

  if (btnAgregarActivo) {
    btnAgregarActivo.addEventListener('click', () => openModal(modalActivo));
  }
  if (activoForm) {
    activoForm.addEventListener('submit', ev => {
      ev.preventDefault();
      const idField    = document.getElementById('activoId').value;
      const tipoActivo = document.getElementById('tipoActivo').value;
      const cantidad   = document.getElementById('cantidad').value;
      const precio     = document.getElementById('precio').value;
      if (idField) {
        const idx = activos.findIndex(a => a.id == idField);
        if (idx > -1) activos[idx] = { id: +idField, tipoActivo, cantidad, precio };
      } else {
        const newId = activos.length ? activos[activos.length - 1].id + 1 : 1;
        activos.push({ id: newId, tipoActivo, cantidad, precio });
      }
      localStorage.setItem('aurum_activos', JSON.stringify(activos));
      refreshActivoTable();
      activoForm.reset();
      closeModal(modalActivo);
    });
  }
  window.editActivo = id => {
    const a = activos.find(x => x.id == id);
    if (!a) return;
    document.getElementById('activoId').value    = a.id;
    document.getElementById('tipoActivo').value  = a.tipoActivo;
    document.getElementById('cantidad').value    = a.cantidad;
    document.getElementById('precio').value      = a.precio;
    openModal(modalActivo);
  };
  window.deleteActivo = id => {
    if (!confirm(`¿Eliminar activo #${id}?`)) return;
    activos = activos.filter(a => a.id != id);
    localStorage.setItem('aurum_activos', JSON.stringify(activos));
    refreshActivoTable();
  };
  function refreshActivoTable() {
    if (!activoTable) return;
    activoTable.innerHTML = '';
    activos.forEach(a => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${a.id}</td>
        <td>${a.tipoActivo}</td>
        <td>${a.cantidad}</td>
        <td>${a.precio}</td>
        <td>
          <button onclick="editActivo(${a.id})">Editar</button>
          <button onclick="deleteActivo(${a.id})">Eliminar</button>
        </td>
      `;
      activoTable.appendChild(tr);
    });
  }
  refreshActivoTable();

  // —— AÑADIDO: LÓGICA DE COMPRA EN CLIENT —————————
  const comprarForm   = document.getElementById('formComprarMain');
  const comprarSelect = document.getElementById('comprarActivoMain');
  const comprarCant   = document.getElementById('comprarCantidadMain');
  const comprarValor  = document.getElementById('comprarValorMain');
  const portafolio_id = +localStorage.getItem('portafolioId');

  comprarCant.addEventListener('input', async () => {
    const qty = parseFloat(comprarCant.value);
    if (!qty) { comprarValor.value = ''; return; }
    const activo_id = +comprarSelect.value;
    console.log('Activo seleccionado:', activo_id);
    console.log('Llamando a:', activo_id === 2 ? '/api/crypto/gold' : '/api/crypto/price');
    try {
      const res = await fetch(activo_id === 2 ? '/api/crypto/gold' : '/api/crypto/price');
      if (!res.ok) throw new Error('No price');
      const { precio } = await res.json();
      comprarValor.value = precio.toFixed(2);
    } catch (err) {
      console.error('Error al obtener precio:', err);
      comprarValor.value = '';
    }
  });

  if (comprarForm) {
    comprarForm.addEventListener('submit', async e => {
      e.preventDefault();
      const activo_id = +comprarSelect.value;
      const cantidad  = +comprarCant.value;
      const ip_origen = location.hostname;
      try {
        const resPrice = await fetch(activo_id === 2 ? '/api/crypto/gold' : '/api/crypto/price');
        if (!resPrice.ok) throw new Error('No hay precio disponible');
        const { precio } = await resPrice.json();
        const resTx = await fetch('/api/transacciones/comprar', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ portafolio_id, activo_id, cantidad, precio, ip_origen })
        });
        const body = await resTx.json();
        if (!resTx.ok) throw new Error(body.error || 'Error al comprar');
        alert('Compra registrada correctamente');
        if (typeof loadPortafolios === 'function') await loadPortafolios();
        if (typeof loadClientes   === 'function') await loadClientes();
      } catch (err) {
        console.error('❌ Error al comprar:', err);
        alert('No se pudo completar la compra');
      }
    });
  }

  // ——— MODALES ——————————————————————————————
  function openModal(m)  { m.style.display = 'flex'; }
  function closeModal(m) { m.style.display = 'none'; }
  document.querySelectorAll('.modal .close').forEach(el =>
    el.addEventListener('click', () => closeModal(el.closest('.modal')))
  );
  window.addEventListener('click', e => {
    if (e.target.classList.contains('modal')) closeModal(e.target);
  });

  // ——— IDLE‐TIMEOUT — desconecta tras 5s sin actividad —
  let idleSeconds = 0;
  const maxIdle = 60;  // 5 segundos

  function resetIdle() {
    idleSeconds = 0;
    console.log('🕑 Idle reiniciado');
  }
  ['mousemove','mousedown','keydown','scroll','touchstart']
    .forEach(evt => document.addEventListener(evt, resetIdle, true));

  setInterval(() => {
    idleSeconds++;
    console.log(`⏱ Inactivo: ${idleSeconds}s`);
    if (idleSeconds >= maxIdle) {
      console.log('🔒 Tiempo de inactividad superado, redirigiendo a logout');
      window.location.href = '/logout.html';
    }
  }, 1000);
});