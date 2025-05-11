const API_BASE      = '/api/transacciones';
const portafolio_id = +localStorage.getItem('portafolioId');
const ip_origen     = location.hostname;
const activos = {
  1: 'bitcoin',
  2: 'oro',
  3: 'fiat'
};

/**
 * Registrar una transacción en el servidor.
 * @param {'compra'|'venta'|'swap_origen'|'swap_destino'} tipo 
 * @param {number} activo_id 
 * @param {string|number} cantidad 
 * @param {string|number} precio_total 
 */
async function registrarTransaccion(tipo, activo_id, cantidad, precio_total) {
  const rutas = {
    compra:       'comprar',
    venta:        'vender',
    swap_origen:  'swap',
    swap_destino: 'swap'
  };
  const ruta = rutas[tipo];
  if (!ruta) throw new Error(`Tipo desconocido: ${tipo}`);

  const url = `${API_BASE}/${ruta}`;
  const body = {
    portafolio_id,
    activo_id,
    cantidad:      parseFloat(cantidad),
    valor_unitario: parseFloat(precio_total) / parseFloat(cantidad),
    ip_origen
  };

  const res = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error de red (${res.status}): ${text}`);
  }
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || data.mensaje || 'Error al registrar transacción');
  }
  return data;
}

document.addEventListener('DOMContentLoaded', () => {
  const formVender = document.getElementById('formVender');
  if (!formVender) return;

  formVender.addEventListener('submit', async e => {
    e.preventDefault();

    const activoInput   = document.getElementById('activoVender');
    const cantidadInput = document.getElementById('cantidadVender');
    const valorInput    = document.getElementById('valorVender');

    const activo_id = +activoInput.value;
    const cantidad  = cantidadInput.value;
    const total     = valorInput.value;

    try {
      await registrarTransaccion('venta', activo_id, cantidad, total);

      // Convertimos lo vendido a FIAT (solo si no es fiat el activo original)
      if (activo_id !== 3) {
        await registrarTransaccion('compra', 3, total, total);
      }

      alert('✅ Venta registrada y FIAT actualizado');
      if (typeof loadPortafolio === 'function') await loadPortafolio();
    } catch (err) {
      console.error(err);
      alert('Error al vender: ' + err.message);
    }
  });
});
