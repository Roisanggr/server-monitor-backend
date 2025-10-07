// src/routes/data.js
import express from "express";
import db from "../db.js"; // import koneksi DB

const router = express.Router();

// GET /api/data
router.get("/", (req, res) => {
  if (db.state !== 'connected') {
    return res.status(500).json({ error: "Database not connected" });
  }

  db.query(
    "SELECT * FROM sensor_data ORDER BY created_at DESC LIMIT 50", 
    (err, results) => {
      if (err) {
        console.error("DB Query Error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json(results);
    }
  );
});

// POST /api/data
router.post("/", (req, res) => {
  const { temperature, humidity, status = "normal" } = req.body;
  
  if (temperature === undefined || humidity === undefined) {
    return res.status(400).json({ 
      error: "Temperature and humidity are required" 
    });
  }

  if (db.state !== 'connected') {
    return res.status(500).json({ error: "Database not connected" });
  }

  db.query(
    "INSERT INTO sensor_data (temperature, humidity, status) VALUES (?, ?, ?)",
    [temperature, humidity, status],
    (err, result) => {
      if (err) {
        console.error("DB Insert Error:", err);
        return res.status(500).json({ error: "Failed to save data" });
      }
      
      res.json({
        message: "Data received successfully",
        data: { 
          id: result.insertId,
          temperature, 
          humidity, 
          status 
        },
      });
    }
  );
});

export default router;