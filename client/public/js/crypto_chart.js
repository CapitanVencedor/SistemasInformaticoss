// 1) Importamos Chart.js y sus registerables desde unpkg
import { Chart, registerables } from 'https://unpkg.com/chart.js@4.4.0/dist/chart.esm.js';
// 2) Importamos el plugin financiero ESM (registra los controladores OHL & candlestick)
import {
  FinancialController, CandlestickController,
  OhlcElement, CandlestickElement
} from 'https://unpkg.com/chartjs-chart-financial@0.4.0/dist/chartjs-chart-financial.esm.js';
// 3) Importamos el adaptador de fechas
import 'https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns@3.0.0/dist/chartjs-adapter-date-fns.esm.js';

// 4) Registramos TODO lo necesario
Chart.register(
  ...registerables,
  FinancialController, CandlestickController,
  OhlcElement, CandlestickElement
);

// 5) Función que busca los datos y pinta el gráfico
async function cargarDatos() {
  try {
    const res  = await fetch('/api/crypto/btc');
    const data = await res.json();
    const precios = data.prices;
    const ohlc    = [];

    for (let i = 0; i < precios.length; i += 4) {
      const [time, open] = precios[i];
      const slice = precios.slice(i, i + 4).map(p => p[1]);
      const high  = Math.max(...slice);
      const low   = Math.min(...slice);
      const close = precios[i + 3]?.[1] ?? open;
      ohlc.push({ x: new Date(time), o: open, h: high, l: low, c: close });
    }

    // ——— Pinta el gráfico ———
    const ctx = document.getElementById('cryptoChart').getContext('2d');
    new Chart(ctx, {
      type: 'candlestick',
      data:   { datasets: [{ label: 'BTC/EUR', data: ohlc }] },
      options:{ 
        responsive: true,
        plugins: { legend: { labels: { color: 'white' } } },
        scales: {
          x: { type: 'time', time: { unit: 'day' }, ticks: { color: 'white' } },
          y: { ticks: { color: 'white' } }
        }
      }
    });

    // ——— NUEVO: Guardar los datos OHLC en la base de datos vía API ———
    await fetch('/api/crypto/prices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbol: 'BTC',
        ohlc: ohlc.map(c => ({
          time: c.x.toISOString(),
          open: c.o,
          high: c.h,
          low: c.l,
          close: c.c
        }))
      })
    });

  } catch (err) {
    console.error('Error cargando velas:', err);
  }
}

// 6) Arrancamos cuando el DOM esté listo
window.addEventListener('DOMContentLoaded', cargarDatos);
