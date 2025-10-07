import express from "express";
import db from "../db.js"; // sesuaikan dengan lokasi file koneksi database kamu

const router = express.Router();

// GET endpoint - ambil 50 data terakhir
router.get("/", (req, res) => {
  db.query("SELECT * FROM sensor_data ORDER BY id DESC LIMIT 50", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// POST endpoint - terima data dari IoT
router.post("/", (req, res) => {
  const { temperature, humidity, status } = req.body;

  console.log("Data diterima:", req.body);

  // bisa tambahkan logika INSERT ke DB di sini
  res.json({
    message: "Data received successfully",
    data: { temperature, humidity, status },
  });
});

export default router;
