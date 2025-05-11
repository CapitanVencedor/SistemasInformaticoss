// server/routes/metals.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

// Ruta para obtener precio del oro en EUR
router.get('/price', async (req, res) => {
  const metal = req.query.metal;
  if (!metal || metal !== 'oro') return res.status(400).json({ error: 'Metal no soportado' });

  try {
    const url = `https://api.metalpriceapi.com/v1/latest?api_key=beabd5fcbef2f00f93d11adf808172df&base=XAU&currencies=EUR`;
    const { data } = await axios.get(url);
    const precio = data.rates.EUR;
    res.json({ precio });
  } catch (err) {
    console.error('❌ Error al obtener precio del oro:', err.message);
    res.status(500).json({ error: 'No se pudo obtener el precio del oro' });
  }
});

module.exports = router;
