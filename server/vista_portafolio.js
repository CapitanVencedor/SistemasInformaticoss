// gestor/public/js/vista_portafolio.js

document.addEventListener('DOMContentLoaded', () => {
    // Parámetro portafolio_id
    const params        = new URLSearchParams(location.search);
    const portafolioId  = params.get('portafolio_id');
  
    // Referencias DOM
    const formPort      = document.getElementById('portafolioForm');
    const nombreInput   = document.getElementById('nombre_portafolio');
    const saldoInput    = document.getElementById('saldo_total');
    const btnEliminar   = document.getElementById('btnEliminar');
    const transTable    = document.getElementById('transTable');
    const btnAgregar    = document.getElementById('btnAgregarTrans');
    const modalTrans    = document.getElementById('modalTrans');
    const transForm     = document.getElementById('transForm');
    const transIdInput  = document.getElementById('transId');
    const activoSelect  = document.getElementById('activo_trans');
    const tipoSelect    = document.getElementById('tipo_trans');
    const cantidadInput = document.getElementById('cantidad_trans');
    const valorInput    = document.getElementById('valor_trans');
  
    let transacciones = [];
  
    // --- Portafolio: cargar y renderizar ---
    async function loadPortafolio() {
      const res = await fetch(`/api/portafolios/${portafolioId}`);
      const p   = await res.json();
      nombreInput.value = p.nombre_portafolio;
      saldoInput.value  = p.saldo_total;
    }
  
    formPort.addEventListener('submit', async e => {
      e.preventDefault();
      await fetch(`/api/portafolios/${portafolioId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_portafolio: nombreInput.value,
          saldo_total:       saldoInput.value
        })
      });
      alert('Portafolio actualizado');
    });
  
    btnEliminar.addEventListener('click', async () => {
      if (!confirm('¿Eliminar este portafolio?')) return;
      await fetch(`/api/portafolios/${portafolioId}`, { method: 'DELETE' });
      location.href = '/gestor/dashboard.html';
    });
  
    // --- Transacciones: cargar y renderizar ---
    async function loadTransacciones() {
      const res = await fetch(`/api/transacciones/portafolio/${portafolioId}`);
      transacciones = await res.json();
      renderTransacciones();
    }
  
    function renderTransacciones() {
      transTable.innerHTML = '';
      if (!transacciones.length) {
        transTable.innerHTML = '<tr><td colspan="7" style="text-align:center">No hay transacciones</td></tr>';
        return;
      }
      transacciones.forEach(t => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${t.id}</td>
          <td>${t.activo_nombre}</td>
          <td>${t.tipo}</td>
          <td>${t.cantidad}</td>
          <td>${t.valor_unitario}</td>
          <td>${new Date(t.fecha).toLocaleString()}</td>
          <td>
            <button class="btn" onclick="editTrans(${t.id})">Editar</button>
            <button class="btn btn-danger" onclick="deleteTrans(${t.id})">Eliminar</button>
          </td>`;
        transTable.appendChild(tr);
      });
    }
  
    // --- Modal Transacción ---
    function openModal(trans = null) {
      if (trans) {
        transIdInput.value  = trans.id;
        activoSelect.value  = trans.activo_id;
        tipoSelect.value    = trans.tipo;
        cantidadInput.value = trans.cantidad;
        valorInput.value    = trans.valor_unitario;
        document.getElementById('modalTransTitle').innerText = 'Editar Transacción';
      } else {
        transForm.reset();
        transIdInput.value = '';
        document.getElementById('modalTransTitle').innerText = 'Nueva Transacción';
      }
      modalTrans.style.display = 'flex';
    }
    function closeModal() { modalTrans.style.display = 'none'; }
  
    document.querySelector('#modalTrans .close').addEventListener('click', closeModal);
    window.addEventListener('click', e => {
      if (e.target === modalTrans) closeModal();
    });
  
    btnAgregar.addEventListener('click', () => openModal());
  
    // --- CRUD Transacciones ---
    window.editTrans = id => {
      const t = transacciones.find(x => x.id == id);
      openModal(t);
    };
  
    transForm.addEventListener('submit', async e => {
      e.preventDefault();
      const id = transIdInput.value;
      const payload = {
        portafolio_id: portafolioId,
        activo_id:     activoSelect.value,
        tipo:          tipoSelect.value,
        cantidad:      cantidadInput.value,
        valor_unitario:valorInput.value,
        fecha:         new Date().toISOString()
      };
      const url    = id ? `/api/transacciones/${id}`          : '/api/transacciones';
      const method = id ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload)
      });
      closeModal();
      await loadTransacciones();
    });
  
    window.deleteTrans = async id => {
      if (!confirm('¿Eliminar esta transacción?')) return;
      await fetch(`/api/transacciones/${id}`, { method: 'DELETE' });
      await loadTransacciones();
    };
  
    // --- Carga de activos en el select ---
    async function loadActivos() {
      const res = await fetch('/api/activos');
      const activos = await res.json();
      activoSelect.innerHTML = activos
        .map(a => `<option value="${a.id}">${a.nombre}</option>`)
        .join('');
    }
  
    // --- Inicialización ---
    (async () => {
      await loadActivos();
      await loadPortafolio();
      await loadTransacciones();
    })();
  });
  