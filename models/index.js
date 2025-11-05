const sequelize = require('../config/db');

// Import all models
const User = require('./User');
const Land = require('./Land');
const Equipment = require('./Equipment');
const Product = require('./Product');
const Transaction = require("./Trasnsaction");

const Lease = require('./Lease');



// user and land
User.hasMany(Land, { foreignKey: 'owner_id', as: 'lands' });
Land.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

// user and equipment
User.hasMany(Equipment, { foreignKey: 'owner_id', as: 'equipments' });
Equipment.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

// user and product
User.hasMany(Product, { foreignKey: 'farmer_id', as: 'products' });
Product.belongsTo(User, { foreignKey: 'farmer_id', as: 'farmer' });

//transaction
User.hasMany(Transaction, { foreignKey: 'buyer_id', as: 'purchases' });
User.hasMany(Transaction, { foreignKey: 'seller_id', as: 'sales' });
Product.hasMany(Transaction, { foreignKey: 'product_id', as: 'transactions' });

Transaction.belongsTo(User, { foreignKey: 'buyer_id', as: 'buyer' });
Transaction.belongsTo(User, { foreignKey: 'seller_id', as: 'seller' });
Transaction.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Transaction.belongsTo(Lease, { foreignKey: "lease_id", as: "lease" });
Transaction.belongsTo(Land, { foreignKey: "land_id", as: "land" });
Transaction.belongsTo(Equipment, { foreignKey: "equipment_id", as: "equipment" });

//lease
User.hasMany(Lease, { foreignKey: 'renter_id', as: 'rented_leases' });
User.hasMany(Lease, { foreignKey: 'owner_id', as: 'owned_leases' });
Land.hasMany(Lease, { foreignKey: 'land_id', as: 'leases' });
Equipment.hasMany(Lease, { foreignKey: 'equipment_id', as: 'leases' });

Lease.belongsTo(User, { foreignKey: 'renter_id', as: 'renter' });
Lease.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });
Lease.belongsTo(Land, { foreignKey: 'land_id', as: 'land' });
Lease.belongsTo(Equipment, { foreignKey: 'equipment_id', as: 'equipment' });


module.exports = {
  sequelize,
  User,
  Land,
  Equipment,
  Product,
  Transaction,
  Lease
};
