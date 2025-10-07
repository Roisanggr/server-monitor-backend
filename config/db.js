const mysql = require('mysql2/promise');
require('dotenv').config();

// Konfigurasi pool koneksi MySQL
const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Fungsi untuk test koneksi
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Koneksi MySQL berhasil!');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Koneksi MySQL gagal:', error.message);
    return false;
  }
};

module.exports = { pool, testConnection };