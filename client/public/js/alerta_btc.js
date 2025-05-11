// public/js/alertas.js
let lastPrice = null;
const UMBRAL = 0.01; // 0.01%

function crearContenedorNotificaciones() {
  if (!document.getElementById('notificaciones')) {
    const contenedor = document.createElement('div');
    contenedor.id = 'notificaciones';
    contenedor.style.position = 'fixed';
    contenedor.style.bottom = '20px';
    contenedor.style.right = '20px';
    contenedor.style.width = '300px';
    contenedor.style.zIndex = 9999;
    contenedor.style.display = 'flex';
    contenedor.style.flexDirection = 'column-reverse';
    document.body.appendChild(contenedor);
  }
}

function showNotification(msg) {
  const contenedor = document.getElementById('notificaciones');
  const notif = document.createElement('div');
  notif.textContent = msg;
  notif.style.backgroundColor = '#ffd633';
  notif.style.color = 'black';
  notif.style.padding = '1rem';
  notif.style.marginTop = '10px';
  notif.style.borderRadius = '8px';
  notif.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
  notif.style.fontSize = '14px';
  notif.style.fontWeight = 'bold';
  notif.style.opacity = 0.95;
  contenedor.appendChild(notif);

  setTimeout(() => notif.remove(), 3000);
}

async function checkBTCChange() {
  const raw = localStorage.getItem('usuario');
  const user = raw ? JSON.parse(raw) : null;
  if (!user || user.rol !== 'cliente') return;

  try {
    const res = await fetch('/api/crypto/price');
    const data = await res.json();
    const currentPrice = data.precio;
    console.log('[alertas] Precio actual:', currentPrice, 'Último precio:', lastPrice);

    if (lastPrice !== null) {
      const change = ((currentPrice - lastPrice) / lastPrice) * 100;
      console.log('[alertas] Cambio %:', change.toFixed(4));

      if (Math.abs(change) >= UMBRAL) {
        const direction = change > 0 ? '📈 subido' : '📉 bajado';
        const mensaje = `BTC ha ${direction} un ${change.toFixed(2)}% (€${currentPrice})`;
        console.log('[alertas] Se cumple umbral, mensaje:', mensaje);

        showNotification(mensaje);

        if (user.email === 'cliente@aurum.com' || user.email.endsWith('@aurum.com')) {
          const resp = await fetch('/api/alertas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              usuario_id: user.id,
              mensaje,
              nivel: 'info',
              tipo: 'BTC',
              valor: currentPrice,
              cambio: change.toFixed(2),
              timestamp: Date.now()
            })
          });
          console.log('[alertas] POST /api/alertas status:', resp.status);
          if (!resp.ok) {
            console.error('[alertas] Error guardando alerta →', await resp.text());
          }
        }
      }
    }
    lastPrice = currentPrice;
  } catch (err) {
    console.error('❌ Error al obtener precio BTC:', err);
  }
}

crearContenedorNotificaciones();
checkBTCChange();
// Ejecutar cada 20 segundos
setInterval(checkBTCChange, 20_000);
