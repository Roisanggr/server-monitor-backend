import express from "express";
import { db } from "../db.js";

const router = express.Router();

// --- GET Data (untuk Dashboard / Frontend) ---
router.get("/", (req, res) => {
  db.query("SELECT * FROM sensor_data ORDER BY id DESC LIMIT 50", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// --- POST Data (untuk ESP32) ---
router.post("/", (req, res) => {
  const { temperature, humidity, status, alert } = req.body;

  if (!temperature || !humidity || !status || !alert) {
    return res.status(400).json({ message: "Invalid data" });
  }

  db.query(
    "INSERT INTO sensor_data (temperature, humidity, status) VALUES (?, ?, ?)",
    [temperature, humidity, status],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      console.log("✅ Data received:", req.body);
      res.json({
        message: "Data received successfully",
        data: { temperature, humidity, status },
      });
    }
  );
});

export default router;
