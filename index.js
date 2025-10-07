import express from "express";
import mysql from "mysql2";
import cors from "cors";
import bodyParser from "body-parser";
import mqtt from "mqtt";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- Environment Variables ---
const PORT = process.env.PORT || 3000;

// --- MySQL Connection (Railway) ---
const db = mysql.createConnection({
  host: process.env.MYSQLHOST || "mysql.railway.internal",
  user: process.env.MYSQLUSER || "root",
  password: process.env.MYSQLPASSWORD || "oAHzlcBlhJnBkfmjLHrpNnWtopWunqRX",
  database: process.env.MYSQLDATABASE || "railway",
  port: process.env.MYSQLPORT || 3306
});

// Test database connection
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// --- MQTT Connection (EMQX Cloud) ---
const mqttClient = mqtt.connect("mqtts://bbd12090.ala.asia-southeast1.emqxsl.com", {
  port: 8883,
  username: process.env.MQTT_USERNAME || "roisafif",
  password: process.env.MQTT_PASSWORD || "Afif4444"
});

mqttClient.on("connect", () => {
  console.log("Connected to EMQX Cloud");
  mqttClient.subscribe("serverroom/data");
});

mqttClient.on("error", (err) => {
  console.error("MQTT Connection Error:", err);
});

mqttClient.on("message", (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    const { temperature, humidity } = data;

    // Alert logic
    let status = "normal";
    if (temperature > 35) status = "warning";
    if (temperature > 45) status = "critical";

    // Save to database
    db.query(
      "INSERT INTO sensor_data (temperature, humidity, status) VALUES (?, ?, ?)",
      [temperature, humidity, status],
      (err, result) => {
        if (err) {
          console.error("DB Insert Error:", err);
        } else {
          console.log("Data saved to DB:", { 
            id: result.insertId, 
            temperature, 
            humidity, 
            status 
          });
        }
      }
    );
  } catch (error) {
    console.error("MQTT Message Processing Error:", error);
  }
});

// --- REST API Routes ---

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "Server Monitor Backend is Running!",
    timestamp: new Date().toISOString()
  });
});

// Get all sensor data
app.get("/api/data", (req, res) => {
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

// Post new sensor data (manual entry)
app.post("/api/data", (req, res) => {
  const { temperature, humidity, status = "normal" } = req.body;
  
  console.log("Manual data received:", req.body);

  // Validate required fields
  if (temperature === undefined || humidity === undefined) {
    return res.status(400).json({ 
      error: "Temperature and humidity are required" 
    });
  }

  // Insert into database
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: "Endpoint not found",
    available_endpoints: ["GET /", "GET /api/data", "POST /api/data"]
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(`MySQL Host: ${process.env.MYSQLHOST || 'using default'}`);
});