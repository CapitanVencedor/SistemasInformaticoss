// server/app.js
const express = require('express');
const path    = require('path');
const cron    = require('node-cron');
const axios   = require('axios');
const app     = express();
const PORT    = process.env.PORT || 3000;
const cors = require('cors');
app.use(cors());

// Conexión a la base de datos
require('./config/db');

// Middlewares
app.use(express.json());

// Rutas de API existentes
app.use('/api/usuarios',      require('./routes/usuarios'));
app.use('/api/portafolios',   require('./routes/portafolios'));
app.use('/api/transacciones', require('./routes/transacciones'));
app.use('/api/activos',       require('./routes/activos'));

// **Nueva ruta**: datos históricos de BTC desde CoinGecko
app.get('/api/crypto/btc', async (req, res) => {
  try {
    const { data } = await axios.get(
      'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart',
      {
        params: {
          vs_currency: 'eur',
          days: 7,
          interval: 'daily'
        }
      }
    );
    res.json(data);
  } catch (err) {
    console.error('Error CoinGecko:', err.message);
    res.status(500).json({ error: 'No se pudieron obtener datos de BTC' });
  }
});

// Caché en memoria
let btcCache = {
  timestamp: 0,
  data: null
};
// Tiempo de vida del caché (en ms). Aquí 10 minutos.
const CACHE_TTL = 10 * 60 * 1000;

app.get('/api/crypto/btc', async (req, res) => {
  // Si hay datos y no han expirado, devuelve el caché
  if (btcCache.data && (Date.now() - btcCache.timestamp) < CACHE_TTL) {
    return res.json(btcCache.data);
  }

  try {
    const { data } = await axios.get(
      'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart',
      {
        params: {
          vs_currency: 'eur',
          days: 7,
          interval: 'daily'
        }
      }
    );
    // Actualiza caché
    btcCache = {
      timestamp: Date.now(),
      data
    };
    return res.json(data);

  } catch (err) {
    // Si la API devuelve 429, devolvemos un mensaje claro
    if (err.response && err.response.status === 429) {
      console.warn('CoinGecko rate limit hit');
      return res.status(429).json({
        error: 'Rate limit de CoinGecko. Prueba de nuevo en unos minutos.'
      });
    }
    console.error('Error CoinGecko:', err.message);
    res.status(500).json({ error: 'No se pudieron obtener datos de BTC' });
  }
});
app.get('/api/crypto/price', async (req, res) => {
  try {
    const { data } = await axios.get(
      'https://api.coindesk.com/v1/bpi/currentprice.json'
    );
    // Devuelve el JSON bruto de Coindesk
    return res.json(data);
  } catch (err) {
    console.error('Error Coindesk:', err.message);
    // Manda un 500 con un JSON de error que luego reconozca el front
    return res.status(500).json({ error: 'No pude obtener el precio BTC' });
  }
});
// Front-end estático
app.use('/client', express.static(path.join(__dirname, '../client/public')));
app.use('/gestor', express.static(path.join(__dirname, '../gestor/public')));

// Páginas principales
app.get('/',         (req, res) => res.sendFile(path.join(__dirname, '../client/public/login.html')));
app.get('/dashboard',(req, res) => res.sendFile(path.join(__dirname, '../gestor/public/dashboard.html')));
app.get('/portfolio',(req, res) => res.sendFile(path.join(__dirname, '../client/public/portfolio.html')));
app.get('/main',     (req, res) => res.sendFile(path.join(__dirname, '../client/public/main.html')));

// Tarea cron cada 15 minutos
const { monitorAPI } = require('./scripts/monitor_apis');
cron.schedule('*/15 * * * *', () => {
  console.log('⏱️  Ejecutando monitorAPI cada 15 minutos…');
  monitorAPI();
});

// Arranca el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});

