const jwt = require("jsonwebtoken");
require("dotenv").config();

// Generate token with user id and type
const generateToken = (user) => {
  return jwt.sign(
    { id: user.user_id, user_type: user.user_type },
    process.env.JWT_SECRET,
    { expiresIn: "7d" } // 7 days validity
  );
};

// Verify token
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
