const API = '/api/transacciones';

const portafolio_id = +localStorage.getItem('portafolioId'); // cambiar por el ID real del usuario si tienes sesión
const ip_origen = location.hostname; // puedes detectar la IP si quieres o dejar fija
const activos = {
  bitcoin: 1,
  oro: 2,
  fiat: 3
};
/**
 * Registrar una transacción en el servidor.
 * @param {'compra'|'venta'|'swap_origen'|'swap_destino'} tipo 
 * @param {'bitcoin'|'oro'|'fiat'} activo 
 * @param {string|number} cantidad 
 * @param {string|number} precio 
 */
async function registrarTransaccion(tipo, activo, cantidad, precio) {
  // 4) Elegimos endpoint según tipo
  let url;
  if (tipo === 'compra') {
    url = '/api/transacciones/comprar';
  } else if (tipo === 'venta') {
    url = '/api/transacciones/vender';
  } else if (tipo === 'swap_origen' || tipo === 'swap_destino') {
    url = '/api/transacciones/swap';
  } else {
    throw new Error(`Tipo desconocido: ${tipo}`);
  }

  // 5) Construimos el body con la propiedad 'precio'
  const body = {
    portafolio_id,
    activo_id: activos[activo],
    cantidad:  parseFloat(cantidad),
    precio:    parseFloat(precio),
    ip_origen
  };

  // 6) Enviamos al servidor
  const res  = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body)
  });
  const data = await res.json();

  // 7) Comprobamos success (tal como responde tu back) :contentReference[oaicite:2]{index=2}:contentReference[oaicite:3]{index=3}
  if (data.success) {
    alert(data.mensaje);
    // 8) Refrescar la vista de portafolio si estamos en portfolio.html
    if (typeof loadPortafolio === 'function') {
      await loadPortafolio();
    }
  } else {
    alert(data.error || 'Error al registrar la transacción');
  }
}

// ——— Eventos de UI ———————————————————

// COMPRA
document.getElementById('btnComprar').addEventListener('click', () => {
  const activo   = document.getElementById('activoComprar').value;
  const cantidad = document.getElementById('cantidadComprar').value;
  const precio   = document.getElementById('valorComprar').value;
  registrarTransaccion('compra', activo, cantidad, precio);
});

// VENTA
document.getElementById('btnVender').addEventListener('click', () => {
  const activo   = document.getElementById('activoVender').value;
  const cantidad = document.getElementById('cantidadVender').value;
  const precio   = document.getElementById('valorVender').value;
  registrarTransaccion('venta', activo, cantidad, precio);
});

// SWAP
document.getElementById('btnSwapear').addEventListener('click', async () => {
  const de          = document.getElementById('swapDe').value;
  const a           = document.getElementById('swapA').value;
  const cantidad    = document.getElementById('swapCantidad').value;
  const nuevoPrecio = document.getElementById('swapValor').value;

  // Primero sale del origen…
  await registrarTransaccion('swap_origen', de, cantidad, nuevoPrecio);
  // …luego entra al destino
  await registrarTransaccion('swap_destino', a, cantidad, nuevoPrecio);
});