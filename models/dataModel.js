const { pool } = require('../config/db');

class DataModel {
  // Get all data
  static async getAll() {
    const [rows] = await pool.execute(
      'SELECT * FROM sensor_data ORDER BY created_at DESC LIMIT 100'
    );
    return rows;
  }
  
  // Get by ID
  static async getById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM sensor_data WHERE id = ?',
      [id]
    );
    return rows[0];
  }
  
  // Create new data
  static async create(data) {
    const { temperature, humidity, status } = data;
    const [result] = await pool.execute(
      'INSERT INTO sensor_data ( temperature, humidity, status) VALUES (?, ?, ?)',
      [ temperature, humidity, status]
    );
    return result.insertId;
  }
  
  // Update data
  static async update(id, data) {
    const {  temperature, humidity, status } = data;
    const [result] = await pool.execute(
      'UPDATE sensor_data SET temperature = ?, humidity = ?, status = ? WHERE id = ?',
      [ temperature, temperature, status, id]
    );
    return result.affectedRows;
  }
  
  // Delete data
  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM sensor_data WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }
}

module.exports = DataModel;