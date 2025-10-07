// src/mqtt.js
import mqtt from "mqtt";
import dotenv from "dotenv";
import db from "./db.js"; // import koneksi DB untuk simpan data

dotenv.config();

const mqttClient = mqtt.connect("mqtts://bbd12090.ala.asia-southeast1.emqxsl.com", {
  port: 8883,
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
});

mqttClient.on("connect", () => {
  console.log("✅ Connected to EMQX Cloud");
  mqttClient.subscribe("serverroom/data");
});

mqttClient.on("error", (err) => {
  console.error("❌ MQTT Connection Error:", err);
});

mqttClient.on("message", (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    const { temperature, humidity } = data;

    console.log("📡 MQTT Data received:", data);

    let status = "normal";
    if (temperature > 35) status = "warning";
    if (temperature > 45) status = "critical";

    // Simpan ke database jika terhubung
    if (db.state === 'connected') {
      db.query(
        "INSERT INTO sensor_data (temperature, humidity, status) VALUES (?, ?, ?)",
        [temperature, humidity, status],
        (err, result) => {
          if (err) {
            console.error("❌ DB Insert Error:", err);
          } else {
            console.log("💾 Data saved to DB:", { 
              id: result.insertId, 
              temperature, 
              humidity, 
              status 
            });
          }
        }
      );
    } else {
      console.log("⚠️ Database not connected, skipping save");
    }
  } catch (error) {
    console.error("❌ MQTT Message Processing Error:", error);
  }
});

export default mqttClient;