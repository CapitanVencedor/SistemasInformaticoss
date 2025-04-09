const express = require('express');
const bodyParser = require('body-parser');
const usuariosRoutes = require('./routes/usuarios');

const app = express();
const port = 3000; // Puedes cambiarlo si lo deseas

// Configuración de middlewares para parseo de JSON y formulario
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Endpoint raíz para probar el servidor
app.get('/', (req, res) => {
  res.json({ message: "Servidor AURUM funcionando con Node.js" });
});

// Rutas para usuarios (CRUD)
app.use('/api/usuarios', usuariosRoutes);

app.listen(port, () => {
  console.log(`Servidor AURUM corriendo en http://localhost:${port}`);
});
