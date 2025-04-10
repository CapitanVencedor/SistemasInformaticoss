const express = require('express');
const app = express();
const port = 3000;

// Conexión a la base de datos (MongoDB) - opcional
require('./config/db');

// Middlewares
app.use(express.json()); // Para parsear JSON

// Rutas
const usuariosRoutes = require('./routes/usuarios');
app.use('/usuarios', usuariosRoutes);

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
