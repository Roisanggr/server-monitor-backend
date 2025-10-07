import express from "express";
import mysql from "mysql2";
import cors from "cors";
import bodyParser from "body-parser";
import mqtt from "mqtt";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// --- MySQL Connection (FIXED) ---
const db = mysql.createConnection({
  host: process.env.MYSQLHOST || "mysql://root:oAHzlcBlhJnBkfmjLHrpNnWtopWunqRX@centerbeam.proxy.rlwy.net:32261/railway", // Host dari Railway
  user: process.env.MYSQLUSER || "root",
  password: process.env.MYSQLPASSWORD || "oAHzlcBlhJnBkfmjLHrpNnWtopWunqRX",
  database: process.env.MYSQLDATABASE || "railway",
  port: process.env.MYSQLPORT || 3306
});

// Test database connection dengan error handling
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    // Jangan exit, biarkan aplikasi tetap running untuk debugging
  } else {
    console.log('Connected to MySQL database');
    
    // Buat table jika belum ada
    db.query(`
      CREATE TABLE IF NOT EXISTS sensor_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        temperature FLOAT NOT NULL,
        humidity FLOAT NOT NULL,
        status VARCHAR(20) DEFAULT 'normal',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Table creation error:', err);
      else console.log('Table sensor_data ready');
    });
  }
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

    console.log("MQTT Data received:", data);

    let status = "normal";
    if (temperature > 35) status = "warning";
    if (temperature > 45) status = "critical";

    // Check if database is connected before inserting
    if (db.state === 'connected') {
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
    } else {
      console.log("Database not connected, skipping save");
    }
  } catch (error) {
    console.error("MQTT Message Processing Error:", error);
  }
});

// --- REST API Routes ---

// Health check endpoint
app.get("/", (req, res) => {
  const dbStatus = db.state === 'connected' ? 'connected' : 'disconnected';
  res.json({ 
    message: "Server Monitor Backend is Running!",
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Get all sensor data
app.get("/api/data", (req, res) => {
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

// Post new sensor data (manual entry)
app.post("/api/data", (req, res) => {
  const { temperature, humidity, status = "normal" } = req.body;
  
  console.log("Manual data received:", req.body);

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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: "Endpoint not found",
    available_endpoints: ["GET /", "GET /api/data", "POST /api/data"]
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(`Environment:`, {
    node_env: process.env.NODE_ENV,
    mysql_host: process.env.MYSQLHOST || 'using default',
    port: PORT
  });
});