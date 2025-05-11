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
app.use('/api/alertas', require('./routes/alertas'));
app.use('/api/chartdata', require('./routes/chartdata'));
// montamos todas las rutas de OHLC en '/api/ohlc'
app.use('/api/ohlc', require('./routes/ohlc_data'));

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
// server/app.js (o donde tengas montadas las rutas)
app.get('/api/crypto/price', async (req, res) => {
  try {
    // Llama al endpoint específico para EUR
    const { data } = await axios.get(
      'https://api.coindesk.com/v1/bpi/currentprice/EUR.json'
    );
    // Extrae solo el precio en euros
    const precio = data.bpi.EUR.rate_float;
    // Devuelve un objeto simple con el precio
    return res.json({ precio });
  } catch (err) {
    console.error('Error al obtener precio BTC:', err.message);
    // En caso de fallo, devolvemos un 500 y un JSON con error
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

// Archivos HTML del cliente
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../client/public/login.html')));
app.get('/login.html', (req, res) => res.sendFile(path.join(__dirname, '../client/public/login.html')));
app.get('/portfolio', (req, res) => res.sendFile(path.join(__dirname, '../client/public/portfolio.html')));
app.get('/portfolio.html', (req, res) => res.sendFile(path.join(__dirname, '../client/public/portfolio.html')));
app.get('/main', (req, res) => res.sendFile(path.join(__dirname, '../client/public/main.html')));
app.get('/main.html', (req, res) => res.sendFile(path.join(__dirname, '../client/public/main.html')));
app.get('/registro.html', (req, res) => res.sendFile(path.join(__dirname, '../client/public/registro.html')));
app.get('/crypto_chart.html', (req, res) => res.sendFile(path.join(__dirname, '../client/public/crypto_chart.html')));
app.get('/oro_chart.html', (req, res) => res.sendFile(path.join(__dirname, '../client/public/oro_chart.html')));
app.get('/phantom_wallet.html', (req, res) => res.sendFile(path.join(__dirname, '../client/public/phantom_wallet.html')));
app.get('/foro.html', (req, res) => res.sendFile(path.join(__dirname, '../client/public/foro.html')));
app.get('/logout.html', (req, res) => res.sendFile(path.join(__dirname, '../client/public/logout.html')));

// Archivos HTML del gestor
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, '../gestor/public/dashboard.html')));
app.get('/gestor/logout.html', (req, res) => res.sendFile(path.join(__dirname, '../gestor/public/logout.html')));
app.get('/gestor/index.html', (req, res) => res.sendFile(path.join(__dirname, '../gestor/public/index.html')));
app.get('/gestor/create_user.html', (req, res) => res.sendFile(path.join(__dirname, '../gestor/public/create_user.html')));
app.get('/gestor/edit_user.html', (req, res) => res.sendFile(path.join(__dirname, '../gestor/public/edit_user.html')));
