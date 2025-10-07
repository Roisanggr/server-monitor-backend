const express = require('express');
const mysql = require('mysql2/promise');

const app = express();

// Railway menyediakan PORT otomatis
const PORT = process.env.PORT || 3000;

// Middleware untuk parse JSON
app.use(express.json());

// Buat pool koneksi menggunakan env vars dari Railway
const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// POST: Simpan data sensor
app.post('/api/sensor', async (req, res) => {
  const { temperature, humidity, status, alert } = req.body;

  // Validasi sederhana
  if (
    typeof temperature !== 'number' ||
    typeof humidity !== 'number' ||
    typeof status !== 'string' ||
    typeof alert !== 'boolean'
  ) {
    return res.status(400).json({ error: 'Invalid input. Required: temperature (number), humidity (number), status (string), alert (boolean)' });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO sensor_data (temperature, humidity, status, alert) VALUES (?, ?, ?, ?)`,
      [temperature, humidity, status, alert]
    );

    res.status(201).json({
      success: true,
      id: result.insertId,
      message: 'Data saved successfully'
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Failed to save data', details: err.message });
  }
});

// GET: Ambil data terbaru (opsional, untuk debugging)
app.get('/api/sensor', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM sensor_data ORDER BY timestamp DESC LIMIT 10`
    );
    res.json(rows);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'Sensor backend is running on Railway!' });
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});