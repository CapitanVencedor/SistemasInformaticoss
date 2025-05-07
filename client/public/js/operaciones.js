const API = '/api/transacciones';

const portafolio_id = 1; // cambiar por el ID real del usuario si tienes sesión
const ip_origen = '127.0.0.1'; // puedes detectar la IP si quieres o dejar fija
const activos = {
  bitcoin: 1,
  oro: 2,
  fiat: 3
};

async function registrarTransaccion(activo, tipo, cantidad, valor_unitario) {
  const body = {
    portafolio_id,
    activo_id: activos[activo],
    tipo,
    cantidad: parseFloat(cantidad),
    valor_unitario: parseFloat(valor_unitario),
    ip_origen
  };

  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  if (data.ok) {
    alert(`${tipo} registrada`);
    // recargar portafolio si estás en portfolio.html
    if (window.location.pathname.includes('portfolio')) cargarPortafolio();
  } else {
    alert('Error al registrar transacción');
  }
}

// eventos desde botones
document.getElementById('btnComprar').addEventListener('click', () => {
  const activo = document.getElementById('activoComprar').value;
  const cantidad = document.getElementById('cantidadComprar').value;
  const valor = document.getElementById('valorComprar').value;
  registrarTransaccion(activo, 'compra', cantidad, valor);
});

document.getElementById('btnVender').addEventListener('click', () => {
  const activo = document.getElementById('activoVender').value;
  const cantidad = document.getElementById('cantidadVender').value;
  const valor = document.getElementById('valorVender').value;
  registrarTransaccion(activo, 'venta', cantidad, valor);
});

document.getElementById('btnSwapear').addEventListener('click', async () => {
  const de = document.getElementById('swapDe').value;
  const a = document.getElementById('swapA').value;
  const cantidad = document.getElementById('swapCantidad').value;
  const nuevoValor = document.getElementById('swapValor').value;

  await registrarTransaccion(de, 'swap_origen', cantidad, nuevoValor);
  await registrarTransaccion(a, 'swap_destino', cantidad, nuevoValor);
});
