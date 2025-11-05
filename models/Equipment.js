const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Equipment = sequelize.define('Equipment', {
  equipment_id: {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Equipment name is required' },
      len: { args: [2, 100], msg: 'Name must be between 2-100 characters' }
    }
  },
  type: {
    type: DataTypes.ENUM('tractor', 'harvester', 'plough', 'irrigation', 'sprayer', 'tiller', 'other'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['tractor', 'harvester', 'plough', 'irrigation', 'sprayer', 'tiller', 'other']],
        msg: 'Invalid equipment type'
      }
    }
  },
  brand: {
    type: DataTypes.STRING,
    validate: {
      len: { args: [1, 50], msg: 'Brand must be between 1-50 characters' }
    }
  },
  model: {
    type: DataTypes.STRING,
    validate: {
      len: { args: [1, 50], msg: 'Model must be between 1-50 characters' }
    }
  },
  rent_price_per_day: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: { args: [100], msg: 'Rent price must be at least ₹100 per day' },
      max: { args: [50000], msg: 'Rent price cannot exceed ₹50,000 per day' },
      isDecimal: { msg: 'Rent price must be a valid number' }
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
  description: {
    type: DataTypes.TEXT,
    validate: {
      len: { args: [10, 1000], msg: 'Description must be between 10-1000 characters' }
    }
  },
  specifications: {
    type: DataTypes.JSONB,
    defaultValue: {}
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
  },
  minimum_rent_days: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: { args: [1], msg: 'Minimum rent days must be at least 1' }
    }
  }
}, {
  tableName: 'equipment',
  timestamps: true,
  indexes: [
    {
      fields: ['type']
    },
    {
      fields: ['location']
    },
    {
      fields: ['is_available']
    }
  ]
});

// Associations
// NEW (unique aliases):

module.exports = Equipment;