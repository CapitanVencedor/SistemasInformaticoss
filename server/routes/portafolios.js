const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');

// 1) Obtener todos los portafolios
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.id,
        p.usuario_id,
        u.nombre         AS nombre_usuario,
        p.nombre         AS nombre_portafolio,
        p.saldo_total,
        p.fecha_creacion
      FROM portafolios p
      JOIN usuarios u ON p.usuario_id = u.id
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener portafolios:", err);
    res.status(500).json({ error: 'Error al obtener portafolios' });
  }
});

// 2) Obtener un portafolio por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT
        p.id,
        p.usuario_id,
        u.nombre         AS nombre_usuario,
        p.nombre         AS nombre_portafolio,
        p.saldo_total,
        p.fecha_creacion
      FROM portafolios p
      JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Portafolio no encontrado' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Error al obtener portafolio:", err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// 3) Crear un nuevo portafolio
router.post('/', async (req, res) => {
  const { usuario_id, nombre_portafolio } = req.body;
  if (!usuario_id || !nombre_portafolio) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO portafolios (usuario_id, nombre) VALUES (?, ?)',
      [usuario_id, nombre_portafolio]
    );
    // Recuperar fila recién creada con los campos completos
    const [newRow] = await pool.query(`
      SELECT
        p.id,
        p.usuario_id,
        u.nombre         AS nombre_usuario,
        p.nombre         AS nombre_portafolio,
        p.saldo_total,
        p.fecha_creacion
      FROM portafolios p
      JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.id = ?
    `, [result.insertId]);
    res.status(201).json(newRow[0]);
  } catch (err) {
    console.error("Error al crear portafolio:", err);
    res.status(500).json({ error: 'Error al crear portafolio' });
  }
});

// 4) Editar portafolio
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre_portafolio } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE portafolios SET nombre = ? WHERE id = ?',
      [nombre_portafolio, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Portafolio no encontrado' });
    }
    // Recuperar datos actualizados
    const [updated] = await pool.query(`
      SELECT
        p.id,
        p.usuario_id,
        u.nombre         AS nombre_usuario,
        p.nombre         AS nombre_portafolio,
        p.saldo_total,
        p.fecha_creacion
      FROM portafolios p
      JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.id = ?
    `, [id]);
    res.json(updated[0]);
  } catch (err) {
    console.error("Error al editar portafolio:", err);
    res.status(500).json({ error: 'Error al editar portafolio' });
  }
});

// 5) Eliminar portafolio
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      'DELETE FROM portafolios WHERE id = ?',
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Portafolio no encontrado' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error al eliminar portafolio:", err);
    res.status(500).json({ error: 'Error al eliminar portafolio' });
  }
});

module.exports = router;
