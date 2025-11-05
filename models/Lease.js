const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');


const Lease = sequelize.define('Lease', {
  lease_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  renter_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  owner_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  land_id: {
    type: DataTypes.INTEGER
  },
  equipment_id: {
    type: DataTypes.INTEGER
  },
  lease_type: {
    type: DataTypes.ENUM('land', 'equipment'),
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  total_days: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'pending'
  },
  payment_method: {
    type: DataTypes.STRING,
    defaultValue: 'demo'
  }
}, {
  tableName: 'leases',
  timestamps: true
});

// Simple method to complete lease
Lease.prototype.complete = async function() {
  this.status = 'completed';
  await this.save();
};

// Associations


module.exports = Lease;