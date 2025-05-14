// server/scripts/auditoria.js
const pool = require('../config/db');

/**
 * Registra un evento de auditoría en la base de datos.
 * @param {number|null} usuario_id - El ID del usuario (o null si no aplica)
 * @param {string} accion - Descripción textual del evento realizado.
 * @param {string} ip_origen - Dirección IP desde donde se realizó la acción.
 * @param {string} [entidad='general'] - Módulo o entidad afectada (usuarios, transacciones...).
 * @param {string} [operacion='desconocida'] - Tipo de operación (crear, borrar, etc.)
 * @returns {Promise<number>} - ID del registro insertado.
 */
async function registrarAuditoria(usuario_id, accion, ip_origen, entidad = 'general', operacion = 'desconocida') {
  try {
    const [result] = await pool.query(
      `INSERT INTO auditoria (usuario_id, accion, ip_origen, entidad, operacion)
       VALUES (?, ?, ?, ?, ?)`,
      [usuario_id, accion, ip_origen, entidad, operacion]
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
