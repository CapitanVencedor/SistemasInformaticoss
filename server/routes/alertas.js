// server/routes/alertas.js
const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');

// GET todas las alertas
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM alertas ORDER BY fecha DESC`);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener alertas' });
  }
});

// POST nueva alerta
router.post('/', async (req, res) => {
  const { tipo, mensaje, valor, cambio, timestamp } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO alertas (tipo, mensaje, valor, cambio_pct, fecha) VALUES (?, ?, ?, ?, ?)`,
      [tipo, mensaje, valor, cambio, new Date(timestamp)]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear alerta' });
  }
});

module.exports = router;
