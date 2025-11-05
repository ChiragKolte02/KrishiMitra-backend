const { DataTypes } = require('sequelize'); // Remove Transaction from import
const sequelize = require('../config/db');
const User = require('./User');
const Product = require('./Product');

const Transaction = sequelize.define('Transaction', {
  transaction_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  buyer_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  seller_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
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
  tableName: 'transactions',
  timestamps: true
});

// Simple method to complete transaction
Transaction.prototype.complete = async function() {
  this.status = 'completed';
  await this.save();
};

// Associations


module.exports = Transaction;
