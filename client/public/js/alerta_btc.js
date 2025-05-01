let lastPrice = null;
const UMBRAL = 0.1; // Umbral de variación en porcentaje

// Crear contenedor de notificaciones si no existe
function crearContenedorNotificaciones() {
  if (!document.getElementById('notificaciones')) {
    const contenedor = document.createElement('div');
    contenedor.id = 'notificaciones';
    contenedor.style.position = 'fixed';
    contenedor.style.top = '80px';
    contenedor.style.right = '20px';
    contenedor.style.width = '300px';
    contenedor.style.maxHeight = 'calc(100vh - 100px)';
    contenedor.style.overflowY = 'auto';
    contenedor.style.zIndex = 9999;
    document.body.appendChild(contenedor);
  }
}

// Mostrar nueva notificación
function showNotification(msg) {
  const contenedor = document.getElementById('notificaciones');
  const notif = document.createElement('div');
  notif.textContent = msg;
  notif.style.backgroundColor = '#ffbb33';
  notif.style.color = 'black';
  notif.style.padding = '1rem';
  notif.style.marginBottom = '10px';
  notif.style.borderRadius = '8px';
  notif.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
  notif.style.fontSize = '14px';
  notif.style.fontWeight = 'bold';
  contenedor.prepend(notif); // Muestra la notificación arriba del todo
}

async function checkBTCChange() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur');
    const data = await res.json();
    const currentPrice = data.bitcoin.eur;

    if (lastPrice !== null) {
      const change = ((currentPrice - lastPrice) / lastPrice) * 100;

      if (Math.abs(change) >= UMBRAL) {
        showNotification(`🔔 BTC ha cambiado un ${change.toFixed(2)}% (€${currentPrice})`);
      }
    }

    lastPrice = currentPrice;
  } catch (err) {
    console.error('❌ Error al obtener precio BTC:', err);
  }
}

// Inicializar
crearContenedorNotificaciones();
checkBTCChange();
setInterval(checkBTCChange, 2000);
