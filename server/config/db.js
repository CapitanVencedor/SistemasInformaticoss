// db.js (Conexión con la BD creada)
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'EwnizEv5',
  database: 'aurum_db',
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;
