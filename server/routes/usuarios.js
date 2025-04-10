const express = require('express');
const router = express.Router();

// GET: Listar usuarios
router.get('/', (req, res) => {
  // Aquí iría la lógica para obtener usuarios de la BD
  res.send('Lista de usuarios');
});

// POST: Crear usuario
router.post('/', (req, res) => {
  // Aquí iría la lógica para crear un usuario en la BD
  console.log('Datos recibidos:', req.body);
  res.send('Usuario creado correctamente');
});

// PUT: Editar usuario
router.put('/:id', (req, res) => {
  const userId = req.params.id;
  console.log('Editando usuario con ID:', userId, 'y datos:', req.body);
  res.send(`Usuario ${userId} editado con éxito`);
});

// DELETE: Eliminar usuario
router.delete('/:id', (req, res) => {
  const userId = req.params.id;
  res.send(`Usuario ${userId} eliminado con éxito`);
});

module.exports = router;
