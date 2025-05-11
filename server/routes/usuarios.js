// server/routes/usuarios.js
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

// 3) Crear nuevo cliente (contraseña por defecto '1234')
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
// 6) Login de cliente/usuario
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Faltan email o password' });
  }
  try {
    // 1) Traer usuario con hash
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

    // 2) Comparar contraseña
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // 3) Obtener o crear portafolio para este usuario
    const [pfRows] = await pool.query(
      `SELECT id FROM portafolios WHERE usuario_id = ?`,
      [user.id]
    );
    let portafolioId;
    if (pfRows.length === 0) {
      // No existe → creamos uno nuevo con saldo 0
      const [insertResult] = await pool.query(
        `INSERT INTO portafolios (usuario_id, nombre, saldo_total)
         VALUES (?, ?, 0)`,
        [user.id, `${user.nombre}'s portfolio`]
      );
      portafolioId = insertResult.insertId;
    } else {
      portafolioId = pfRows[0].id;
    }

    // 4) Limpiar el objeto user para devolver al front
    delete user.password;
    user.portafolioId = portafolioId;

    // 5) Devolver el usuario + su portafolio
    return res.json({ user });
  } catch (err) {
    console.error("Error en login:", err);
    return res.status(500).json({ error: 'Error interno en login' });
  }
});

// 7) Registro desde formulario web
router.post('/registro', async (req, res) => {
  const { nombre, email, password } = req.body;

  // 1) Validar campos obligatorios
  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    // 2) Verificar si el email ya existe
    const [existente] = await pool.query(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );
    if (existente.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    // 3) Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4) Insertar nuevo usuario con rol 'cliente'
    const [result] = await pool.query(
      `INSERT INTO usuarios 
         (nombre, email, password, rol, estado, dosfa, nivel_seguridad) 
       VALUES (?, ?, ?, 'cliente', 1, 'N', 0)`,
      [nombre, email, hashedPassword]
    );

    // 5) Redirigir al login.html en vez de devolver JSON
    return res.redirect(303, '/login.html');
  } catch (err) {
    console.error('❌ Error al registrar nuevo usuario:', err);
    return res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

module.exports = router;
