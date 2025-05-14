const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    // Auditoría tradicional
    const [auditorias] = await pool.query(`
      SELECT 
        a.id,
        a.accion,
        a.entidad,
        a.operacion,
        a.usuario_id,
        u.nombre AS usuario_nombre,
        a.fecha
      FROM auditoria a
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      ORDER BY a.fecha DESC
      LIMIT 100
    `);

    // Alertas automáticas
    const [alertas] = await pool.query(`
      SELECT 
        id,
        'alerta' AS entidad,
        tipo AS operacion,
        usuario_id,
        mensaje AS accion,
        fecha
      FROM alertas
      ORDER BY fecha DESC
      LIMIT 100
    `);

    // Unificamos ambas listas
    const resultado = [...auditorias, ...alertas].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    res.json(resultado);

  } catch (err) {
    console.error('Error al obtener auditoría y alertas:', err);
    res.status(500).json({ error: 'Error al cargar auditoría y alertas' });
  }
});

module.exports = router;
