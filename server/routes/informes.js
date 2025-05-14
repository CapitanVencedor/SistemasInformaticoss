const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');

const PERIOD_SQL = {
  semanal:  `DATE_FORMAT(t.fecha,'%x-%v')`,   // año-semana ISO
  mensual:  `DATE_FORMAT(t.fecha,'%Y-%m')`,   // año-mes
  anual:    `YEAR(t.fecha)`                   // año
};

/**
 * GET /api/informes
 * Query params:
 *   - usuarioId (opcional): filtrar un cliente concreto
 *   - periodo: 'semanal' | 'mensual' | 'anual' (por defecto 'mensual')
 */
router.get('/', async (req, res) => {
  const { usuarioId, periodo = 'mensual' } = req.query;
  if (!PERIOD_SQL[periodo]) {
    return res.status(400).json({ error: 'Periodo inválido' });
  }

  try {
    // 1) Agregamos compras y ventas por periodo para cada portafolio
    const fechaGroup = PERIOD_SQL[periodo];
    const params = [];
    let where = '';
    if (usuarioId) {
      where = 'WHERE p.usuario_id = ?';
      params.push(usuarioId);
    }

    const [rows] = await pool.query(`
      SELECT
        ${fechaGroup}      AS periodo,
        p.id               AS portafolio_id,
        u.nombre           AS cliente,
        SUM(CASE WHEN t.tipo='venta' THEN t.cantidad * t.precio ELSE 0 END)
                            AS total_ventas,
        SUM(CASE WHEN t.tipo='compra' THEN t.cantidad * t.precio ELSE 0 END)
                            AS total_compras,
        SUM(CASE WHEN t.tipo='venta' THEN t.cantidad * t.precio
                 WHEN t.tipo='compra' THEN - t.cantidad * t.precio
                 ELSE 0 END)
                            AS pnl
      FROM transacciones t
      JOIN portafolios p ON t.portafolio_id = p.id
      JOIN usuarios u    ON p.usuario_id = u.id
      ${where}
      GROUP BY periodo, p.id
      ORDER BY periodo DESC
    `, params);

    res.json(rows);

  } catch (err) {
    console.error('Error en informes:', err);
    res.status(500).json({ error: 'Error al generar informes' });
  }
});

module.exports = router;
