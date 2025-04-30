// app.js
const express = require('express');
const path    = require('path');
const cron    = require('node-cron');
const app     = express();
const PORT    = process.env.PORT || 3000;

// Conexión BD
require('./config/db');

// Middlewares
app.use(express.json());

// API de clientes
app.use('/api/usuarios', require('./routes/usuarios'));

// Front-end estático
app.use('/client', express.static(path.join(__dirname,'../client/public')));
app.use('/gestor', express.static(path.join(__dirname,'../gestor/public')));

// Portafolios
app.use('/api/portafolios', require('./routes/portafolios'));

// Trasnsacciones
app.use('/api/transacciones', require('./routes/transacciones'));

// Activos
app.use('/api/activos', require('./routes/activos'));

// Páginas principales
app.get('/',        (req,res) => res.sendFile(path.join(__dirname,'../client/public/login.html')));
app.get('/dashboard',(req,res) => res.sendFile(path.join(__dirname,'../gestor/public/dashboard.html')));
app.get('/portfolio',(req,res) => res.sendFile(path.join(__dirname,'../client/public/portfolio.html')));
app.get('/main',     (req,res) => res.sendFile(path.join(__dirname,'../client/public/main.html')));

// Tarea de monitorización periódico (cada 15m)
const { monitorAPI } = require('./scripts/monitor_apis');
cron.schedule('*/15 * * * *', () => {
  console.log('⏱️  Ejecutando monitorAPI cada 15 minutos…');
  monitorAPI();
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
