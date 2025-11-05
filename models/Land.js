const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Land = sequelize.define('Land', {
  land_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  owner_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'user_id'
    },
    validate: {
      notNull: { msg: 'Owner ID is required' }
    }
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Location is required' },
      len: { args: [2, 100], msg: 'Location must be between 2-100 characters' }
    }
  },
  size_in_acres: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: { args: [0.1], msg: 'Land size must be at least 0.1 acre' },
      max: { args: [10000], msg: 'Land size cannot exceed 10,000 acres' }
    }
  },
  price_per_day: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: { args: [100], msg: 'Price per day must be at least ₹100' },
      max: { args: [100000], msg: 'Price per day cannot exceed ₹100,000' },
      isDecimal: { msg: 'Price must be a valid number' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    validate: {
      len: { args: [10, 1000], msg: 'Description must be between 10-1000 characters' }
    }
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  }
}, {
  tableName: 'lands',
  timestamps: true,
  indexes: [
    { fields: ['location'] },
    { fields: ['is_available'] }
  ]
});

// Associations will be defined in models/index.js to prevent circular import issues

module.exports = Land;
