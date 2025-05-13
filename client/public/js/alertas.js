// client/js/alertas.js

;(async function() {
    // Define aquí los activos y sus endpoints
    const activos = [
      { clave: 'bitcoin', nombre: 'Bitcoin',   url: '/api/crypto/price?activo=bitcoin' },
      { clave: 'oro',     nombre: 'Oro',       url: '/api/metals/gold'           }
    ];
  
    // Función que muestra una alerta temporal
    function showAlert(msg) {
      const d = document.createElement('div');
      Object.assign(d.style, {
        position: 'fixed',
        top: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#e74c3c',
        color: '#fff',
        padding: '0.75rem 1.25rem',
        'border-radius': '4px',
        'box-shadow': '0 2px 6px rgba(0,0,0,0.3)',
        'z-index': 9999,
        'font-family': 'Inter, sans-serif',
      });
      d.textContent = msg;
      document.body.appendChild(d);
      setTimeout(() => d.remove(), 5000);
    }
  
    for (let { clave, nombre, url } of activos) {
      try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(resp.status);
        const { precio } = await resp.json();
        const actual = parseFloat(precio);
        const key     = `lastPrice_${clave}`;
        const previo = parseFloat(localStorage.getItem(key));
  
        if (!isNaN(previo)) {
          const pct = (actual - previo) / previo * 100;
          if (pct < -0.01) {
            showAlert(`¡Alerta! ${nombre} ha caído ${Math.abs(pct).toFixed(2)} % desde tu última visita.`);
          }
        }
        // Guarda siempre el precio actual como "última visita"
        localStorage.setItem(key, actual);
      } catch (err) {
        console.error(`Error comprobando alerta de ${clave}:`, err);
      }
    }
  })();
  