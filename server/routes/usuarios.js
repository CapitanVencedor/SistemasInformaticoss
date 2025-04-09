const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM usuarios");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear un nuevo usuario
router.post('/', async (req, res) => {
  const { nombre, email, rol, estado } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO usuarios (nombre, email, rol, estado) VALUES (?, ?, ?, ?)",
      [nombre, email, rol, estado]
    );
    res.json({ id: result.insertId, nombre, email, rol, estado });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar usuario
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, email, rol, estado } = req.body;
  try {
    await pool.query(
      "UPDATE usuarios SET nombre = ?, email = ?, rol = ?, estado = ? WHERE id = ?",
      [nombre, email, rol, estado, id]
    );
    res.json({ id, nombre, email, rol, estado });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar usuario
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM usuarios WHERE id = ?", [id]);
    res.json({ message: "Usuario eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
