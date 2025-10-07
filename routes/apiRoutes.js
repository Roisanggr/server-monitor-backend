const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

// Data routes
router.get('/data', dataController.getAllData);
router.get('/data/:id', dataController.getDataById);
router.post('/data', dataController.createData);
router.put('/data/:id', dataController.updateData);
router.delete('/data/:id', dataController.deleteData);

// MQTT route
router.post('/mqtt/publish', dataController.publishMQTT);

module.exports = router;