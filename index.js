import express from "express";
import mysql from "mysql2";
import cors from "cors";
import bodyParser from "body-parser";
import mqtt from "mqtt";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- MySQL Connection ---
const db = mysql.createConnection({
  host: "mysql.railway.internal", // ganti sesuai credentials
  user: "root",
  password: "oAHzlcBlhJnBkfmjLHrpNnWtopWunqRX",
  database: "railway",
  port: 3306
});

// --- MQTT Connection (EMQX Cloud) ---
const mqttClient = mqtt.connect("mqtts://bbd12090.ala.asia-southeast1.emqxsl.com", {
  port: 8883,
  username: "roisafif",
  password: "Afif4444"
});

mqttClient.on("connect", () => {
  console.log("Connected to EMQX Cloud");
  mqttClient.subscribe("serverroom/data"); // topic dari ESP32
});

mqttClient.on("message", (topic, message) => {
  const data = JSON.parse(message.toString());
  const { temperature, humidity } = data;

  // deteksi alert suhu naik
  let status = "normal";
  if (temperature > 35) status = "warning";
  if (temperature > 45) status = "critical";

  db.query(
    "INSERT INTO sensor_data (temperature, humidity, status) VALUES (?, ?, ?)",
    [temperature, humidity, status],
    (err) => {
      if (err) console.error("DB Error:", err);
      else console.log("Data saved:", data);
    }
  );
});

// --- REST API untuk Frontend ---
app.get("/api/data", (req, res) => {
  db.query("SELECT * FROM sensor_data ORDER BY id DESC LIMIT 50", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

app.listen(3000, () => console.log("Backend running on port 3000"));
