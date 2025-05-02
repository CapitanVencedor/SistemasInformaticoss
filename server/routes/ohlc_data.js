const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');

// GET /api/ohlc ⇒ lee de la tabla `ohcl_data`
router.get('/', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM ohcl_data ORDER BY time DESC');
  res.json({ data: rows });
});

module.exports = router;
