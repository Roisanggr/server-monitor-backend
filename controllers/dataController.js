const DataModel = require('../models/dataModel');

// Get all data
exports.getAllData = async (req, res, next) => {
  try {
    const data = await DataModel.getAll();
    res.json({
      success: true,
      count: data.length,
      data: data
    });
  } catch (error) {
    next(error);
  }
};

// Get data by ID
exports.getDataById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await DataModel.getById(id);
    
    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Data tidak ditemukan'
      });
    }
    
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    next(error);
  }
};

// Create new data
exports.createData = async (req, res, next) => {
  try {
    const insertId = await DataModel.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Data berhasil dibuat',
      insertId: insertId
    });
  } catch (error) {
    next(error);
  }
};

// Update data
exports.updateData = async (req, res, next) => {
  try {
    const { id } = req.params;
    const affectedRows = await DataModel.update(id, req.body);
    
    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data tidak ditemukan'
      });
    }
    
    res.json({
      success: true,
      message: 'Data berhasil diupdate'
    });
  } catch (error) {
    next(error);
  }
};

// Delete data
exports.deleteData = async (req, res, next) => {
  try {
    const { id } = req.params;
    const affectedRows = await DataModel.delete(id);
    
    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data tidak ditemukan'
      });
    }
    
    res.json({
      success: true,
      message: 'Data berhasil dihapus'
    });
  } catch (error) {
    next(error);
  }
};

// Publish MQTT
exports.publishMQTT = (req, res, next) => {
  try {
    const { topic, message } = req.body;
    const mqttClient = req.app.get('mqttClient');
    
    if (!topic || !message) {
      return res.status(400).json({
        success: false,
        message: 'Topic dan message harus diisi'
      });
    }
    
    mqttClient.publish(topic, JSON.stringify(message), (err) => {
      if (err) {
        return next(err);
      }
      res.json({
        success: true,
        message: 'Pesan berhasil dipublish'
      });
    });
  } catch (error) {
    next(error);
  }
};