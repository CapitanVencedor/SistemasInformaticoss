const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Importa la conexión a la BD

// GET: Listar todos los usuarios
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM usuarios');
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// POST: Crear usuario
router.post('/', async (req, res) => {
  const { nombre, email, password, rol } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, MD5(?), ?)',
      [nombre, email, password, rol]
    );
    res.json({
      id: result.insertId,
      nombre,
      email,
      rol
    });
  } catch (err) {
    console.error("Error al crear usuario:", err);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// PUT: Editar usuario
router.put('/:id', async (req, res) => {
  const userId = req.params.id;
  const { nombre, email, rol, estado } = req.body;
  try {
    await pool.query(
      'UPDATE usuarios SET nombre = ?, email = ?, rol = ?, estado = ? WHERE id = ?',
      [nombre, email, rol, estado, userId]
    );
    res.json({ success: true, message: `Usuario ${userId} editado con éxito` });
  } catch (err) {
    console.error("Error al editar usuario:", err);
    res.status(500).json({ error: 'Error al editar usuario' });
  }
});

// DELETE: Eliminar usuario
router.delete('/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    await pool.query('DELETE FROM usuarios WHERE id = ?', [userId]);
    res.json({ success: true, message: `Usuario ${userId} eliminado con éxito` });
  } catch (err) {
    console.error("Error al eliminar usuario:", err);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

// POST: Login de usuario
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // NOTA: MD5 se usa solo para demostración; en producción utiliza bcrypt u otro hash seguro.
    const [rows] = await pool.query(
      'SELECT * FROM usuarios WHERE email = ? AND password = MD5(?)',
      [email, password]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    res.json({ user: rows[0] });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
