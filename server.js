const express = require('express');
const cors = require('cors');
const mqtt = require('mqtt');
require('dotenv').config();

const { testConnection } = require('./config/db');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MQTT Connection
const mqttClient = mqtt.connect('mqtt://broker.emqx.io', {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
  clientId: `backend_${Math.random().toString(16).slice(3)}`
});

mqttClient.on('connect', () => {
  console.log('✅ MQTT Connected');
});

mqttClient.on('error', (err) => {
  console.error('❌ MQTT Error:', err);
});

// Make mqttClient available globally
app.set('mqttClient', mqttClient);

// Routes
app.use('/', routes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await testConnection();
  console.log(`📡 Environment: ${process.env.NODE_ENV}`);
});