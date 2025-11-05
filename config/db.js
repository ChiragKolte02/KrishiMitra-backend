// config/db.js
const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // needed for Supabase
    },
  },
  logging: false, // disable SQL logging
});

sequelize
  .authenticate()
  .then(() => console.log("✅ Connected to Supabase PostgreSQL (transaction pooler)"))
  .catch((err) => console.error("❌ DB connection failed:", err));

module.exports = sequelize;
