// routes/alertas.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET todas las alertas
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM alertas ORDER BY fecha DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener alertas' });
  }
});

// POST nueva alerta
router.post('/', async (req, res) => {
  console.log('[alertas] body recibido →', req.body);
  const { usuario_id, mensaje, nivel, cambio, valor, tipo } = req.body;

  try {
    // Verificar que el usuario exista y sea cliente
    const [[usuario]] = await pool.query(
      `SELECT * FROM usuarios WHERE id = ? AND rol = 'cliente'`,
      [usuario_id]
    );
    if (!usuario) {
      return res
        .status(403)
        .json({ error: 'Usuario no autorizado para recibir alertas' });
    }

    const [result] = await pool.query(
      `INSERT INTO alertas 
        (usuario_id, mensaje, cambio_pct, nivel, valor, tipo, leido, fecha)
      VALUES (?, ?, ?, ?, ?, ?, 0, NOW())`,
      [
        usuario_id,
        mensaje,
        cambio,
        nivel || 'info',
        valor || null,
        tipo  || null
      ]
    );

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear alerta' });
  }
});

module.exports = router;
