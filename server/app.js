const express = require('express');
const path = require('path');
const app = express();

// Middleware para servir archivos estáticos desde /client/public
app.use(express.static(path.join(__dirname, '../client/public')));

// Ruta principal que carga el login
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/login.html'));
});

// Puedes añadir rutas adicionales si quieres (opcional)
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/dashboard.html'));
});

app.get('/portfolio', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/portfolio.html'));
});

// Puerto del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor AURUM escuchando en http://localhost:${PORT}`);
});
