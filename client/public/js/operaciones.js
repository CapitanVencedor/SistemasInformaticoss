const API_BASE      = '/api/transacciones';
const portafolio_id = +localStorage.getItem('portafolioId');
const ip_origen     = location.hostname;
const activos = {
  bitcoin: 1,
  oro:     2,
  fiat:    3
};

/**
 * Registrar una transacción en el servidor.
 * @param {'compra'|'venta'|'swap_origen'|'swap_destino'} tipo 
 * @param {'bitcoin'|'oro'|'fiat'} activo 
 * @param {string|number} cantidad 
 * @param {string|number} precio 
 */
async function registrarTransaccion(tipo, activo, cantidad, precio) {
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
    activo_id:     activos[activo],
    cantidad:      parseFloat(cantidad),
    valor_unitario: parseFloat(precio),
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
  // --- FORMULARIO de VENTA ---
  const formVender = document.getElementById('formVender');
  if (!formVender) return console.error('⚠️ No existe ningún element con id="formVender"');
  
  formVender.addEventListener('submit', async e => {
    e.preventDefault();

    const activoInput   = document.getElementById('activoVender');
    const cantidadInput = document.getElementById('cantidadVender');
    const valorInput    = document.getElementById('valorVender');

    if (!activoInput || !cantidadInput || !valorInput) {
      console.error('⚠️ Faltan inputs en el formulario de venta');
      return alert('Error interno: falta un campo de venta');
    }

    const activo   = activoInput.value;
    const cantidad = cantidadInput.value;
    const precio   = valorInput.value;

    console.log('💸 Intentando vender:', { activo, cantidad, precio });

    try {
      // 1) Registro de la venta de cripto/oro
      await registrarTransaccion('venta', activo, cantidad, precio);

      // 2) Registro de la compra de FIAT con el total
      const totalFiat = (parseFloat(cantidad) * parseFloat(precio)).toFixed(2);
      await registrarTransaccion('compra', 'fiat', totalFiat, 1);

      alert('✅ Venta completada y saldo en FIAT actualizado');
      if (typeof loadPortafolio === 'function') await loadPortafolio();
    } catch (err) {
      console.error(err);
      alert('Error al vender: ' + err.message);
    }
  });
});
