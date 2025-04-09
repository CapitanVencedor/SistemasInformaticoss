// db.js (Conexión con la BD creada)
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',          // o 'aurumuser' si usaste usuario propio
  password: '',          // cambia si tienes contraseña
  database: 'aurum_db',
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;
