import express from "express";
import { db } from "../../db.js";

const router = express.Router();

// GET semua data
router.get("/", (req, res) => {
  db.query("SELECT * FROM data_sensor ORDER BY id DESC LIMIT 50", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// POST data baru
router.post("/", (req, res) => {
  const { temperature, humidity, status, alert } = req.body;
  const query = "INSERT INTO data_sensor (temperature, humidity, status, alert) VALUES (?, ?, ?, ?)";
  db.query(query, [temperature, humidity, status, alert], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "✅ Data inserted successfully", id: result.insertId });
  });
});

export default router;
