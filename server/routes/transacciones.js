// server/routes/transacciones.js
const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');
const { registrarAuditoria } = require('../scripts/auditoria');


// 1) Obtener todas las transacciones
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        t.id,
        t.portafolio_id,
        t.activo_id,
        a.nombre          AS nombre_activo,
        t.tipo,
        t.cantidad,
        t.precio,
        t.ip_origen,
        t.fecha
      FROM transacciones t
      JOIN activos a ON t.activo_id = a.id
      ORDER BY t.fecha DESC
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
      SELECT
        t.id,
        t.portafolio_id,
        t.activo_id,
        a.nombre          AS nombre_activo,
        t.tipo,
        t.cantidad,
        t.precio,
        t.ip_origen,
        t.fecha
      FROM transacciones t
      JOIN activos a ON t.activo_id = a.id
      WHERE t.id = ?
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

// 3) Crear nueva transacción genérica
router.post('/', async (req, res) => {
  const { portafolio_id, activo_id, tipo, cantidad, precio, ip_origen } = req.body;
  if (!portafolio_id || !activo_id || !tipo || cantidad == null || precio == null) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  try {
    const [result] = await pool.query(
      `INSERT INTO transacciones
         (portafolio_id, activo_id, tipo, cantidad, precio, ip_origen, fecha)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [portafolio_id, activo_id, tipo, cantidad, precio, ip_origen]
    );
    res.status(201).json({
      id: result.insertId,
      portafolio_id,
      activo_id,
      tipo,
      cantidad,
      precio,
      ip_origen
    });
  } catch (err) {
    console.error("Error al crear transacción:", err);
    res.status(500).json({ error: 'Error al crear transacción' });
  }
});

// 4) Editar transacción
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { portafolio_id, activo_id, tipo, cantidad, precio, ip_origen } = req.body;
  try {
    const [result] = await pool.query(
      `UPDATE transacciones
         SET portafolio_id = ?, activo_id = ?, tipo = ?, cantidad = ?, precio = ?, ip_origen = ?
       WHERE id = ?`,
      [portafolio_id, activo_id, tipo, cantidad, precio, ip_origen, id]
    );
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
    const [result] = await pool.query(
      `DELETE FROM transacciones WHERE id = ?`,
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error al eliminar transacción:", err);
    res.status(500).json({ error: 'Error al eliminar transacción' });
  }
});

// 6) COMPRAR activo
router.post('/comprar', async (req, res) => {
  const { portafolio_id, activo_id, cantidad, precio, ip_origen, usuario_id } = req.body;
  const tipo = 'compra';

  try {
    await pool.query(
      `INSERT INTO transacciones
         (portafolio_id, activo_id, tipo, cantidad, precio, ip_origen, fecha)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [portafolio_id, activo_id, tipo, cantidad, precio, ip_origen]
    );

    await pool.query(
      `INSERT INTO portafolios_activos (portafolio_id, activo_id, cantidad)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE cantidad = cantidad + VALUES(cantidad)`,
      [portafolio_id, activo_id, cantidad]
    );
    await registrarAuditoria(
      usuario_id || null,
      `Compra de ${cantidad} del activo ID ${activo_id} por ${precio} €`,
      ip_origen,
      'transacciones',
      'compra'
    );
        return res.json({ success: true, mensaje: 'Compra registrada correctamente' });
  } catch (err) {
    console.error("Error en la compra:", err);
    return res.status(500).json({ error: 'Error al registrar la compra' });
  }
});

// 7) VENDER activo
router.post('/vender', async (req, res) => {
  const { portafolio_id, activo_id, cantidad, precio, ip_origen } = req.body;
  const tipo = 'venta';

  try {
    const [rows] = await pool.query(
      `SELECT cantidad FROM portafolios_activos WHERE portafolio_id = ? AND activo_id = ?`,
      [portafolio_id, activo_id]
    );
    if (!rows.length || rows[0].cantidad < cantidad) {
      return res.status(400).json({ error: 'Cantidad insuficiente para vender' });
    }

    await pool.query(
      `INSERT INTO transacciones
         (portafolio_id, activo_id, tipo, cantidad, precio, ip_origen, fecha)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [portafolio_id, activo_id, tipo, cantidad, precio, ip_origen]
    );

    await pool.query(`
      UPDATE portafolios_activos
         SET cantidad = cantidad - ?
       WHERE portafolio_id = ? AND activo_id = ?
    `, [cantidad, portafolio_id, activo_id]);

    res.json({ success: true, mensaje: 'Venta registrada correctamente' });
  } catch (err) {
    console.error("Error en la venta:", err);
    res.status(500).json({ error: 'Error al registrar la venta' });
  }
});

// 8) SWAP entre activos
router.post('/swap', async (req, res) => {
  const {
    portafolio_id,
    activo_origen_id,
    activo_destino_id,
    cantidad,
    precio,
    ip_origen
  } = req.body;

  try {
    const [rows] = await pool.query(
      `SELECT cantidad FROM portafolios_activos WHERE portafolio_id = ? AND activo_id = ?`,
      [portafolio_id, activo_origen_id]
    );
    if (!rows.length || rows[0].cantidad < cantidad) {
      return res.status(400).json({ error: 'Cantidad insuficiente para swap' });
    }

    await pool.query(
      `INSERT INTO transacciones
         (portafolio_id, activo_id, tipo, cantidad, precio, ip_origen, fecha)
       VALUES (?, ?, 'swap_origen', ?, ?, ?, NOW())`,
      [portafolio_id, activo_origen_id, cantidad, precio, ip_origen]
    );

    await pool.query(
      `INSERT INTO transacciones
         (portafolio_id, activo_id, tipo, cantidad, precio, ip_origen, fecha)
       VALUES (?, ?, 'swap_destino', ?, ?, ?, NOW())`,
      [portafolio_id, activo_destino_id, cantidad, precio, ip_origen]
    );

    await pool.query(`
      UPDATE portafolios_activos
         SET cantidad = cantidad - ?
       WHERE portafolio_id = ? AND activo_id = ?
    `, [cantidad, portafolio_id, activo_origen_id]);

    await pool.query(`
      INSERT INTO portafolios_activos (portafolio_id, activo_id, cantidad)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE cantidad = cantidad + VALUES(cantidad)
    `, [portafolio_id, activo_destino_id, cantidad]);

    res.json({ success: true, mensaje: 'Swap realizado correctamente' });
  } catch (err) {
    console.error("Error en el swap:", err);
    res.status(500).json({ error: 'Error al realizar el swap' });
  }
});

// 9) Obtener historial por portafolio_id (CORREGIDO)
router.get('/historial/:portafolioId', async (req, res) => {
  const portafolioId = req.params.portafolioId;

  try {
    const [rows] = await pool.query(
      'SELECT tipo, cantidad, precio AS valor_unitario, activo_id, fecha AS timestamp FROM transacciones WHERE portafolio_id = ? ORDER BY fecha DESC',
      [portafolioId]
    );
    res.json(rows);
  } catch (err) {
    console.error('❌ Error al obtener historial:', err);
    res.status(500).json({ error: 'Error del servidor al obtener historial' });
  }
});

module.exports = router;
