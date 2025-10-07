const express = require('express');
const router = express.Router();
const apiRoutes = require('./apiRoutes');
const { testConnection } = require('../config/db');

// Home route
router.get('/', (req, res) => {
  res.json({
    message: 'Backend API Railway',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Health check
router.get('/health', async (req, res) => {
  const dbStatus = await testConnection();
  const mqttClient = req.app.get('mqttClient');
  
  res.json({
    status: 'ok',
    database: dbStatus ? 'connected' : 'disconnected',
    mqtt: mqttClient.connected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// API routes
router.use('/api', apiRoutes);

module.exports = router;