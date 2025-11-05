const express = require("express");
const router = express.Router();
const { User } = require("../models");
const bcrypt = require("bcryptjs");
const authMiddleware = require("../middleware/authmiddleware");


// =============================
// 1️⃣ GET CURRENT USER PROFILE
// =============================
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({ message: "User profile fetched successfully", user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user", error: err.message });
  }
});

// =============================
// 2️⃣ UPDATE USER PROFILE
// =============================
router.patch("/update", authMiddleware, async (req, res) => {
  try {
    const { first_name, last_name, contact, address, location } = req.body;

    await req.user.update({
      first_name: first_name || req.user.first_name,
      last_name: last_name || req.user.last_name,
      contact: contact || req.user.contact,
      address: address || req.user.address,
      location: location || req.user.location,
    });

    res.status(200).json({ message: "User profile updated successfully", user: req.user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile", error: err.message });
  }
});

// =============================
// 3️⃣ CHANGE PASSWORD
// =============================
router.put("/change-password", authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword)
      return res.status(400).json({ message: "Both old and new passwords are required" });

    const isMatch = await bcrypt.compare(oldPassword, req.user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Old password is incorrect" });

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    req.user.password = hashedPassword;
    await req.user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to change password", error: err.message });
  }
});

// =============================
// 4️⃣ DELETE ACCOUNT (OPTIONAL)
// =============================
router.delete("/delete", authMiddleware, async (req, res) => {
  try {
    await req.user.destroy();
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete account", error: err.message });
  }
});

module.exports = router;
