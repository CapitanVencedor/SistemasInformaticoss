const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Conexión a la base de datos (si aplica)
// require('./config/db');  // Descomenta si la base de datos es necesaria

// Middleware para parsear JSON
app.use(express.json());

// Rutas de la API
const usuariosRoutes = require('./routes/usuarios');
app.use('/api/usuarios', usuariosRoutes);

// Servir archivos estáticos para CLIENT y GESTOR
app.use('/client', express.static(path.join(__dirname, '../client/public')));
app.use('/gestor', express.static(path.join(__dirname, '../gestor/public')));

// Rutas HTML principales
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/login.html'));
});
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../gestor/public/dashboard.html'));
});
app.get('/portfolio', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/portfolio.html'));
});
app.get('/main', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/main.html'));
});

// ======================================================
// Integración de node-cron para monitorizar APIs periódicamente
const cron = require('node-cron');
const { monitorAPI } = require('./scripts/monitor_apis');

// Programa la ejecución de monitorAPI cada 5 minutos
cron.schedule('*/5 * * * *', () => {
  console.log('Ejecutando monitorAPI cada 5 minutos...');
  monitorAPI();
});
// ======================================================

app.listen(PORT, () => {
  console.log(`Servidor AURUM escuchando en http://localhost:${PORT}`);
});
