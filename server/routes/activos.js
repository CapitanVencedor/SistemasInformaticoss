const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// 1) Listar todos los activos
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM activos`);
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener activos:", err);
    res.status(500).json({ error: 'Error al obtener activos' });
  }
});

// 2) Obtener un activo por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(`SELECT * FROM activos WHERE id = ?`, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Activo no encontrado' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Error al obtener activo:", err);
    res.status(500).json({ error: 'Error al obtener activo' });
  }
});

// 3) Crear nuevo activo
router.post('/', async (req, res) => {
  const { nombre, simbolo, tipo, unidad, decimales } = req.body;
  try {
    const [result] = await pool.query(`
      INSERT INTO activos (nombre, simbolo, tipo, unidad, decimales)
      VALUES (?, ?, ?, ?, ?)
    `, [nombre, simbolo, tipo, unidad, decimales]);
    res.status(201).json({ id: result.insertId, nombre, simbolo, tipo, unidad, decimales });
  } catch (err) {
    console.error("Error al crear activo:", err);
    res.status(500).json({ error: 'Error al crear activo' });
  }
});

// 4) Editar activo
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, simbolo, tipo, unidad, decimales } = req.body;
  try {
    const [result] = await pool.query(`
      UPDATE activos
      SET nombre = ?, simbolo = ?, tipo = ?, unidad = ?, decimales = ?
      WHERE id = ?
    `, [nombre, simbolo, tipo, unidad, decimales, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Activo no encontrado o sin cambios' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error al editar activo:", err);
    res.status(500).json({ error: 'Error al editar activo' });
  }
});

// 5) Eliminar activo
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(`DELETE FROM activos WHERE id = ?`, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Activo no encontrado' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error al eliminar activo:", err);
    res.status(500).json({ error: 'Error al eliminar activo' });
  }
});

module.exports = router;
