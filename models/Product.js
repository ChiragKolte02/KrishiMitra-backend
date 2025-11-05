const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Product = sequelize.define('Product', {
  product_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  farmer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'user_id'
    },
    validate: {
      notNull: { msg: 'Farmer ID is required' }
    }
  },
  crop_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Crop name is required' },
      len: { args: [2, 50], msg: 'Crop name must be between 2-50 characters' }
    }
  },
  category: {
    type: DataTypes.ENUM('cereals', 'pulses', 'vegetables', 'fruits', 'spices', 'flowers', 'other'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['cereals', 'pulses', 'vegetables', 'fruits', 'spices', 'flowers', 'other']],
        msg: 'Invalid product category'
      }
    }
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: { args: [0.1], msg: 'Quantity must be at least 0.1 kg' },
      max: { args: [100000], msg: 'Quantity cannot exceed 100,000 kg' },
      isDecimal: { msg: 'Quantity must be a valid number' }
    }
  },
  unit: {
    type: DataTypes.ENUM('kg', 'quintal', 'ton'),
    defaultValue: 'kg',
    validate: {
      isIn: {
        args: [['kg', 'quintal', 'ton']],
        msg: 'Unit must be kg, quintal, or ton'
      }
    }
  },
  price_per_kg: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: { args: [1], msg: 'Price must be at least ₹1 per kg' },
      max: { args: [1000], msg: 'Price cannot exceed ₹1000 per kg' },
      isDecimal: { msg: 'Price must be a valid number' }
    }
  },
  quality: {
    type: DataTypes.ENUM('A', 'B', 'C', 'organic', 'premium'),
    defaultValue: 'A',
    validate: {
      isIn: {
        args: [['A', 'B', 'C', 'organic', 'premium']],
        msg: 'Invalid quality grade'
      }
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
  harvest_date: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: { msg: 'Harvest date must be a valid date' },
      isAfter: { args: ['2020-01-01'], msg: 'Harvest date must be after 2020' }
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
  },
 
}, {
  tableName: 'products',
  timestamps: true,
  indexes: [
    {
      fields: ['crop_name']
    },
    {
      fields: ['category']
    },
    {
      fields: ['location']
    },
    {
      fields: ['is_available']
    }
  ]
});




module.exports = Product;