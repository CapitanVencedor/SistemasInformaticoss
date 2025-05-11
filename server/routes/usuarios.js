// server/routes/usuarios.js
const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');
const bcrypt  = require('bcrypt');

// 1) Listar todos los clientes (rol = 'cliente')
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, nombre, email, estado 
       FROM usuarios 
       WHERE rol = 'cliente'`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener clientes:", err);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

// 2) Obtener un cliente por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT id, nombre, email, estado 
       FROM usuarios 
       WHERE rol = 'cliente' AND id = ?`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(`Error al obtener cliente ${id}:`, err);
    res.status(500).json({ error: 'Error al obtener cliente' });
  }
});

// 3) Crear nuevo cliente (con contraseña por defecto '1234', hasheada con bcrypt)
router.post('/', async (req, res) => {
  const { nombre, email } = req.body;
  if (!nombre || !email) {
    return res.status(400).json({ error: 'Faltan nombre o email' });
  }
  try {
    // contraseña por defecto
    const hashedPassword = await bcrypt.hash('1234', 10);

    const [result] = await pool.query(
      `INSERT INTO usuarios 
         (nombre, email, password, rol, estado, dosfa, nivel_seguridad) 
       VALUES (?, ?, ?, 'cliente', 1, 'N', 0)`,
      [nombre, email, hashedPassword]
    );
    res.status(201).json({ 
      id: result.insertId, 
      nombre, 
      email, 
      estado: 1 
    });
  } catch (err) {
    console.error("Error al crear cliente:", err);
    res.status(500).json({ error: 'Error al crear cliente' });
  }
});

// 4) Editar cliente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, email, estado } = req.body;
  try {
    const [result] = await pool.query(
      `UPDATE usuarios 
         SET nombre = ?, email = ?, estado = ? 
       WHERE id = ? AND rol = 'cliente'`,
      [nombre, email, estado, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado o sin cambios' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error al editar cliente:", err);
    res.status(500).json({ error: 'Error al editar cliente' });
  }
});

// 5) Eliminar cliente
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      `DELETE FROM usuarios 
       WHERE id = ? AND rol = 'cliente'`,
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error al eliminar cliente:", err);
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
});

// 6) Login de cliente/usuario
router.post('/login', async (req, res) => {
  console.log('>>> Login body:', req.body);
  const { email, password } = req.body;
  console.log('>>> Parámetros recibidos →', { email, password });

  if (!email || !password) {
    return res.status(400).json({ error: 'Faltan email o password' });
  }
  try {
    // Traemos usuario (incluyendo el hash de password)
    const [rows] = await pool.query(
      `SELECT id, nombre, email, rol, estado, password 
       FROM usuarios 
       WHERE email = ? AND estado = 1`,
      [email]
    );
    console.log('>>> Filas devueltas por la consulta:', rows);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    const user = rows[0];
    console.log('>>> Hash almacenado en BD:', user.password);

    // Comparamos con bcrypt
    const match = await bcrypt.compare(password, user.password);
    console.log('>>> Resultado bcrypt.compare:', match);
    if (!match) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // No devolvemos el hash al cliente
    delete user.password;
    res.json({ user });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: 'Error interno en login' });
  }
});

// 7) Registro desde formulario web
router.post('/registro', async (req, res) => {
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    // Verificar si el email ya está registrado
    const [existente] = await pool.query(
      `SELECT id FROM usuarios WHERE email = ?`,
      [email]
    );
    if (existente.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar nuevo usuario
    const [result] = await pool.query(
      `INSERT INTO usuarios 
         (nombre, email, password, rol, estado, dosfa, nivel_seguridad) 
       VALUES (?, ?, ?, 'cliente', 1, 'N', 0)`,
      [nombre, email, hashedPassword]
    );

    // Responder con los datos básicos
    res.status(201).json({
      id: result.insertId,
      nombre,
      email,
      estado: 1
    });
  } catch (err) {
    console.error("❌ Error al registrar nuevo usuario:", err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

module.exports = router;
