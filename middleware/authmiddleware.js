const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { verifyToken } = require("../utils/jwtutils");

// Auth middleware to support both header and cookie
const authMiddleware = async (req, res, next) => {
  try {
    // 1️⃣ Get token from header OR cookie
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token)
      return res.status(401).json({ message: "Unauthorized: No token provided" });

    const decoded = verifyToken(token);

    
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(401).json({ message: "Unauthorized: User not found" });

    if (user.currentToken !== token)
      return res.status(401).json({ message: "Unauthorized: Token invalidated" });

   
    req.user = user;
    req.token = token;

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Unauthorized: Invalid or expired token",
      error: err.message,
    });
  }
};

module.exports = authMiddleware;
