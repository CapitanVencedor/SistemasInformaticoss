// routes/chartdata.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Ruta chartdata activa' });
});

module.exports = router;
