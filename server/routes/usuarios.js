// server/routes/usuarios.js
const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');

// 1) Listar todos los clientes (rol = 'cliente')
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, nombre, email, estado 
       FROM usuarios 
       WHERE rol = 'cliente'`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener clientes:", err);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

// 2) Crear nuevo cliente
router.post('/', async (req, res) => {
  const { nombre, email } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO usuarios 
         (nombre, email, password, rol, estado, dosfa, nivel_seguridad) 
       VALUES (?, ?, MD5(?), 'cliente', 1, 'N', 0)`,
      [nombre, email, '1234']
    );
    res.status(201).json({ id: result.insertId, nombre, email, estado: 1 });
  } catch (err) {
    console.error("Error al crear cliente:", err);
    res.status(500).json({ error: 'Error al crear cliente' });
  }
});

// 3) Editar cliente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, email, estado } = req.body;
  try {
    await pool.query(
      `UPDATE usuarios 
         SET nombre = ?, email = ?, estado = ? 
       WHERE id = ? AND rol = 'cliente'`,
      [nombre, email, estado, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error al editar cliente:", err);
    res.status(500).json({ error: 'Error al editar cliente' });
  }
});

// 4) Eliminar cliente
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      `DELETE FROM usuarios 
       WHERE id = ? AND rol = 'cliente'`,
      [id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error al eliminar cliente:", err);
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
});

module.exports = router;
