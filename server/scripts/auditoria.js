// server/scripts/auditoria.js
const pool = require('../config/db');

/**
 * Registra un evento de auditoría en la base de datos.
 * @param {number|null} usuario_id - El ID del usuario (o null si no aplica)
 * @param {string} accion - Descripción de la acción realizada.
 * @param {string} ip_origen - La dirección IP desde donde se realizó la acción.
 * @returns {Promise<number>} - El ID del registro de auditoría insertado.
 */
async function registrarAuditoria(usuario_id, accion, ip_origen) {
  try {
    const [result] = await pool.query(
      'INSERT INTO auditoria (usuario_id, accion, ip_origen) VALUES (?, ?, ?)',
      [usuario_id, accion, ip_origen]
    );
    console.log(`Auditoría registrada (ID: ${result.insertId})`);
    return result.insertId;
  } catch (error) {
    console.error('Error registrando auditoría:', error);
    throw error;
  }
}

module.exports = {
  registrarAuditoria
};
