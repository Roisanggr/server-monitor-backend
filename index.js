// index.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

// Routes
import dataRoutes from "./src/routes/data.js";

// Inisialisasi dotenv
dotenv.config();

// Inisialisasi database
import "./src/db.js"; // cukup import untuk jalankan init
import "./src/mqtt.js"; // cukup import untuk jalankan koneksi MQTT

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Mount routes
app.use("/api/data", dataRoutes);

// Health check
app.get("/", async (req, res) => {
  const dbModule = await import("./src/db.js");
  const dbStatus = dbModule.default.state === 'connected' ? 'connected' : 'disconnected';

  res.json({ 
    message: "Server Monitor Backend is Running!",
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: "Endpoint not found",
    available_endpoints: ["GET /", "GET /api/data", "POST /api/data"]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  MySQL Host: ${process.env.MYSQLHOST}`);
});