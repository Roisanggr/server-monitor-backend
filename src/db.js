// src/db.js (versi diperbaiki)
import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: parseInt(process.env.MYSQLPORT, 10) || 3306,
});

export const initDB = () => {
  db.connect((err) => {
    if (err) {
      console.error('❌ Database connection failed:', err);
    } else {
      console.log('✅ Connected to MySQL database');
      
      db.query(`
        CREATE TABLE IF NOT EXISTS sensor_data (
          id INT AUTO_INCREMENT PRIMARY KEY,
          temperature FLOAT NOT NULL,
          humidity FLOAT NOT NULL,
          status VARCHAR(20) DEFAULT 'normal',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) console.error('❌ Table creation error:', err);
        else console.log('✅ Table sensor_data ready');
      });
    }
  });
};

// Helper untuk cek status
export const getDBStatus = () => db.state === 'connected' ? 'connected' : 'disconnected';

export default db;