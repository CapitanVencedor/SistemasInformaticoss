const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// 1) Obtener todas las transacciones
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.id, t.portafolio_id, t.activo_id, a.nombre AS nombre_activo, 
             t.tipo, t.cantidad, t.precio, t.fecha
      FROM transacciones t
      JOIN activos a ON t.activo_id = a.id
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener transacciones:", err);
    res.status(500).json({ error: 'Error al obtener transacciones' });
  }
});

// 2) Obtener una transacción por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT * FROM transacciones WHERE id = ?
    `, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Error al obtener transacción:", err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// 3) Crear nueva transacción
router.post('/', async (req, res) => {
  const { portafolio_id, activo_id, tipo, cantidad, precio } = req.body;
  try {
    const [result] = await pool.query(`
      INSERT INTO transacciones (portafolio_id, activo_id, tipo, cantidad, precio)
      VALUES (?, ?, ?, ?, ?)
    `, [portafolio_id, activo_id, tipo, cantidad, precio]);

    res.status(201).json({ 
      id: result.insertId, 
      portafolio_id, activo_id, tipo, cantidad, precio 
    });
  } catch (err) {
    console.error("Error al crear transacción:", err);
    res.status(500).json({ error: 'Error al crear transacción' });
  }
});

// 4) Editar transacción
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { portafolio_id, activo_id, tipo, cantidad, precio } = req.body;
  try {
    const [result] = await pool.query(`
      UPDATE transacciones 
      SET portafolio_id = ?, activo_id = ?, tipo = ?, cantidad = ?, precio = ?
      WHERE id = ?
    `, [portafolio_id, activo_id, tipo, cantidad, precio, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transacción no encontrada o sin cambios' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error al editar transacción:", err);
    res.status(500).json({ error: 'Error al editar transacción' });
  }
});

// 5) Eliminar transacción
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(`
      DELETE FROM transacciones WHERE id = ?
    `, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error al eliminar transacción:", err);
    res.status(500).json({ error: 'Error al eliminar transacción' });
  }
});

module.exports = router;
