const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');
const bcrypt  = require('bcryptjs');

// 1) Listar todos los clientes
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

// 3) Crear nuevo cliente (pasword por defecto '1234')
router.post('/', async (req, res) => {
  const { nombre, email } = req.body;
  if (!nombre || !email) {
    return res.status(400).json({ error: 'Faltan nombre o email' });
  }
  try {
    const hashedPassword = await bcrypt.hash('1234', 10);
    const [result] = await pool.query(
      `INSERT INTO usuarios 
         (nombre, email, password, rol, estado, dosfa, nivel_seguridad) 
       VALUES (?, ?, ?, 'cliente', 1, 'N', 0)`,
      [nombre, email, hashedPassword]
    );
    res.status(201).json({
      id:     result.insertId,
      nombre,
      email,
      estado: 1
    });
  } catch (err) {
    console.error("Error al crear cliente:", err);
    res.status(500).json({ error: 'Error al crear cliente' });
  }
});

/*
  4) Actualización parcial de cliente
     - Si en el body viene `nombre`, actualiza nombre.
     - Si viene `email`, actualiza email.
     - Si viene `estado`, actualiza estado.
*/
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, email, estado } = req.body;

  const updates = [];
  const params  = [];

  if (nombre !== undefined) {
    updates.push('nombre = ?');
    params.push(nombre);
  }
  if (email !== undefined) {
    updates.push('email = ?');
    params.push(email);
  }
  if (estado !== undefined) {
    updates.push('estado = ?');
    params.push(estado);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No hay campos para actualizar' });
  }

  const sql = `
    UPDATE usuarios
       SET ${updates.join(', ')}
     WHERE id = ? AND rol = 'cliente'
  `;
  params.push(id);

  try {
    const [result] = await pool.query(sql, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado o sin cambios' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error al actualizar cliente:", err);
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
});

// 5) Eliminar físicamente un cliente (opcional, si aún lo necesitas)
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

// 6) Login de usuario
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Faltan email o password' });
  }
  try {
    const [rows] = await pool.query(
      `SELECT id, nombre, email, rol, estado, password
         FROM usuarios
        WHERE email = ? AND estado = 1`,
      [email]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Obtener o crear portafolio...
    const [pfRows] = await pool.query(
      `SELECT id FROM portafolios WHERE usuario_id = ?`,
      [user.id]
    );
    let portafolioId;
    if (pfRows.length === 0) {
      const [insertResult] = await pool.query(
        `INSERT INTO portafolios (usuario_id, nombre, saldo_total)
         VALUES (?, ?, 0)`,
        [user.id, `${user.nombre}'s portfolio`]
      );
      portafolioId = insertResult.insertId;
    } else {
      portafolioId = pfRows[0].id;
    }

    delete user.password;
    user.portafolioId = portafolioId;
    res.json({ user });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: 'Error interno en login' });
  }
});

// 7) Registro web
router.post('/registro', async (req, res) => {
  const { nombre, email, password } = req.body;
  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  try {
    const [existente] = await pool.query(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );
    if (existente.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO usuarios 
         (nombre, email, password, rol, estado, dosfa, nivel_seguridad) 
       VALUES (?, ?, ?, 'cliente', 1, 'N', 0)`,
      [nombre, email, hashedPassword]
    );
    return res.redirect(303, '/login.html');
  } catch (err) {
    console.error('Error al registrar usuario:', err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

module.exports = router;
