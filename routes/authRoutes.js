const express = require("express");
const router = express.Router();
const { User } = require("../models");
const { generateToken } = require("../utils/jwtUtils");
const authMiddleware = require("../middleware/authmiddleware");


router.post("/register", async (req, res) => {
  try {
    const { first_name, last_name, email, password, contact, address, location, user_type } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    // Create user (password will be hashed automatically via model hook)
    const user = await User.create({
      first_name,
      last_name,
      email,
      password,
      contact,
      address,
      location,
      user_type,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    // Use instance method to check password
    const isMatch = await user.checkPassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    // Generate JWT and save in currentToken
    const token = generateToken(user);
    user.currentToken = token;
    await user.save();

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 8 * 3600000), 
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});


router.post("/logout", authMiddleware, async (req, res) => {
  const user = req.user;
  user.currentToken = null;
  await user.save();

  res.cookie("token", null, { httpOnly: true, expires: new Date(0) });
  res.json({ message: "Logged out successfully" });
});


module.exports = router;
