import { db } from "./db.js";

db.query(`
  CREATE TABLE IF NOT EXISTS sensor_data (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    temperature FLOAT,
    humidity FLOAT,
    status VARCHAR(50),
    alert VARCHAR(100),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) console.error("❌ Table creation failed:", err);
  else console.log("✅ Table ready");
});
