const express = require('express');
const path    = require('path');
const cron    = require('node-cron');
const axios   = require('axios');
const cors    = require('cors');

const app  = express();
const PORT = process.env.PORT || 3000;

// CORS
app.use(cors());

// Conexión a la base de datos
require('./config/db');

// Middlewares para JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../client/public')));
app.use('/client', express.static(path.join(__dirname, '../client/public')));

// Rutas de API
app.use('/api/usuarios',      require('./routes/usuarios'));
app.use('/api/portafolios',   require('./routes/portafolios'));
app.use('/api/transacciones', require('./routes/transacciones'));
app.use('/api/activos',       require('./routes/activos'));
app.use('/api/alertas',       require('./routes/alertas'));
app.use('/api/chartdata',     require('./routes/chartdata'));
app.use('/api/ohlc',          require('./routes/ohlc_data'));
app.use('/api/metals', require('./routes/metals'));
app.use('/api/portafolios', require('./routes/portafolios'));
app.use('/api/auditoria', require('./routes/auditoria'));


// Caché en memoria para BTC histórico (10 min)
let btcHistoryCache = { timestamp: 0, data: null };
const BTC_HISTORY_TTL = 10 * 60 * 1000;

app.get('/api/crypto/btc', async (req, res) => {
  if (btcHistoryCache.data && (Date.now() - btcHistoryCache.timestamp) < BTC_HISTORY_TTL) {
    return res.json(btcHistoryCache.data);
  }
  try {
    const { data } = await axios.get(
      'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart',
      { params: { vs_currency: 'eur', days: 7, interval: 'daily' } }
    );
    btcHistoryCache = { timestamp: Date.now(), data };
    res.json(data);
  } catch (err) {
    if (err.response && err.response.status === 429) {
      return res.status(429).json({ error: 'Rate limit de CoinGecko. Prueba en unos minutos.' });
    }
    console.error('Error CoinGecko historial BTC:', err.message);
    res.status(500).json({ error: 'No se pudieron obtener datos históricos de BTC' });
  }
});

// Caché en memoria para precio BTC (2 min)
let btcPriceCache = { timestamp: 0, precio: null };
const BTC_PRICE_TTL = 2 * 60 * 1000;

app.get('/api/crypto/price', async (req, res) => {
  if (btcPriceCache.precio !== null && (Date.now() - btcPriceCache.timestamp) < BTC_PRICE_TTL) {
    return res.json({ precio: btcPriceCache.precio });
  }
  try {
    const { data } = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price',
      { params: { ids: 'bitcoin', vs_currencies: 'eur' } }
    );
    const precio = data.bitcoin.eur;
    btcPriceCache = { timestamp: Date.now(), precio };
    res.json({ precio });
  } catch (err) {
    console.error('Error CoinGecko precio BTC:', err.message);
    res.status(500).json({ error: 'No se pudo obtener el precio de BTC' });
  }
});
// Caché en memoria para precio de oro (tether-gold) con CoinGecko (2 min)
let goldPriceCache = { timestamp: 0, precio: null };
const GOLD_PRICE_TTL = 2 * 60 * 1000;

app.get('/api/crypto/gold', async (req, res) => {
  // Si tenemos caché reciente, la devolvemos
  if (goldPriceCache.precio !== null && (Date.now() - goldPriceCache.timestamp) < GOLD_PRICE_TTL) {
    return res.json({ precio: goldPriceCache.precio });
  }
  try {
    // CoinGecko usa "tether-gold" como id para oro tokenizado
    const { data } = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price',
      { params: { ids: 'tether-gold', vs_currencies: 'eur' } }
    );
    const precio = data['tether-gold'].eur;
    goldPriceCache = { timestamp: Date.now(), precio };
    res.json({ precio });
  } catch (err) {
    console.error('Error CoinGecko precio ORO:', err.message);
    res.status(500).json({ error: 'No se pudo obtener el precio de oro' });
  }
});



// Servir front-end estático
app.use('/client', express.static(path.join(__dirname, '../client/public')));
app.use('/gestor', express.static(path.join(__dirname, '../gestor/public')));
app.use(
  '/gestor/partials',
  express.static(path.join(__dirname, '../gestor/public/partials'))
);

// Archivos HTML del cliente
app.get('/',               (req, res) => res.sendFile(path.join(__dirname, '../client/public/login.html')));
app.get('/login.html',     (req, res) => res.sendFile(path.join(__dirname, '../client/public/login.html')));
app.get('/portfolio',      (req, res) => res.sendFile(path.join(__dirname, '../client/public/portfolio.html')));
app.get('/portfolio.html', (req, res) => res.sendFile(path.join(__dirname, '../client/public/portfolio.html')));
app.get('/main',           (req, res) => res.sendFile(path.join(__dirname, '../client/public/main.html')));
app.get('/main.html',      (req, res) => res.sendFile(path.join(__dirname, '../client/public/main.html')));
app.get('/registro.html',  (req, res) => res.sendFile(path.join(__dirname, '../client/public/registro.html')));
app.get('/crypto_chart.html', (req, res) => res.sendFile(path.join(__dirname, '../client/public/crypto_chart.html')));
app.get('/oro_chart.html',    (req, res) => res.sendFile(path.join(__dirname, '../client/public/oro_chart.html')));
app.get('/phantom_wallet.html', (req, res) => res.sendFile(path.join(__dirname, '../client/public/phantom_wallet.html')));
app.get('/foro.html',          (req, res) => res.sendFile(path.join(__dirname, '../client/public/foro.html')));
app.get('/logout.html',        (req, res) => res.sendFile(path.join(__dirname, '../client/public/logout.html')));

// Archivos HTML del gestor
app.get('/dashboard',            (req, res) => res.sendFile(path.join(__dirname, '../gestor/public/dashboard.html')));
app.get('/gestor/logout.html',   (req, res) => res.sendFile(path.join(__dirname, '../gestor/public/logout.html')));
app.get('/gestor/index.html',    (req, res) => res.sendFile(path.join(__dirname, '../gestor/public/index.html')));
app.get('/gestor/create_user.html', (req, res) => res.sendFile(path.join(__dirname, '../gestor/public/create_user.html')));
app.get('/gestor/edit_user.html',   (req, res) => res.sendFile(path.join(__dirname, '../gestor/public/edit_user.html')));

// Cron job cada 15 minutos para monitorizar APIs
const { monitorAPI } = require('./scripts/monitor_apis');
cron.schedule('*/15 * * * *', () => {
  console.log('⏱️ Ejecutando monitorAPI…');
  monitorAPI();
});

// Arranca el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`);
});
