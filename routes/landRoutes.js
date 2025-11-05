const express = require("express");
const router = express.Router();
const { Land, User } = require("../models");

const roleMiddleware = require("../middleware/rolemiddleware");
const authMiddleware = require("../middleware/authmiddleware");



// =====================
// CREATE LAND (Landowner only)
// =====================
router.post("/add", authMiddleware, roleMiddleware(["landowner"]), async (req, res) => {
  try {
    const { location, size_in_acres, price_per_day, description, images } = req.body;

    if (!location || !size_in_acres || !price_per_day) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newLand = await Land.create({
      owner_id: req.user.user_id,
      location,
      size_in_acres,
      price_per_day,
      description: description || "No description provided",
      images: images || [],
      is_available: true,
      is_verified: false
    });

    res.status(201).json({ message: "Land created successfully", land: newLand });
  } catch (err) {
    console.error("Error creating land:", err);
    res.status(500).json({ message: "Failed to create land", error: err.message });
  }
});

// =====================
// GET ALL AVAILABLE LANDS (Anyone)
// =====================
router.get("/all", async (req, res) => {
  try {
    const lands = await Land.findAll({
      where: { is_available: true },
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["first_name", "last_name", "email", "location"]
        }
      ]
    });

    res.status(200).json(lands);
  } catch (err) {
    console.error("Error fetching lands:", err);
    res.status(500).json({ message: "Failed to fetch lands", error: err.message });
  }
});
// =====================
// GET MY LANDS (Landowner only)
// =====================
router.get("/my-lands", authMiddleware, roleMiddleware(["landowner"]), async (req, res) => {
  try {
    const myLands = await Land.findAll({ where: { owner_id: req.user.user_id } });
    res.status(200).json(myLands);
  } catch (err) {
    console.error("Error fetching my lands:", err);
    res.status(500).json({ message: "Failed to fetch your lands", error: err.message });
  }
});

// =====================
// GET LAND BY ID (Anyone)
// =====================
router.get("/:id", async (req, res) => {
  try {
    const land = await Land.findByPk(req.params.id, {
      include: [
        { model: User, as: "owner", attributes: ["first_name", "last_name", "email", "location"] }
      ]
    });

    if (!land) return res.status(404).json({ message: "Land not found" });

    res.status(200).json(land);
  } catch (err) {
    console.error("Error fetching land:", err);
    res.status(500).json({ message: "Failed to fetch land", error: err.message });
  }
});

// =====================
// UPDATE LAND (Owner only, Partial Update)
// =====================
router.patch("/update/:id", authMiddleware, roleMiddleware(["landowner"]), async (req, res) => {
  try {
    const land = await Land.findByPk(req.params.id);
    if (!land) return res.status(404).json({ message: "Land not found" });

    if (land.owner_id !== req.user.user_id) {
      return res.status(403).json({ message: "Unauthorized: You can only update your own land" });
    }

    const allowedUpdates = ["location", "size_in_acres", "price_per_day", "description", "is_available", "images"];
    const updates = {};

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (Object.keys(updates).length === 0)
      return res.status(400).json({ message: "No valid fields provided for update" });

    await land.update(updates);
    res.status(200).json({ message: "Land updated successfully", updatedFields: updates });
  } catch (err) {
    console.error("Error updating land:", err);
    res.status(500).json({ message: "Failed to update land", error: err.message });
  }
});

// =====================
// DELETE LAND (Owner only)
// =====================
router.delete("/delete/:id", authMiddleware, roleMiddleware(["landowner"]), async (req, res) => {
  try {
    const land = await Land.findByPk(req.params.id);
    if (!land) return res.status(404).json({ message: "Land not found" });

    if (land.owner_id !== req.user.user_id)
      return res.status(403).json({ message: "Unauthorized: You can only delete your own land" });

    await land.destroy();
    res.status(200).json({ message: "Land deleted successfully" });
  } catch (err) {
    console.error("Error deleting land:", err);
    res.status(500).json({ message: "Failed to delete land", error: err.message });
  }
});



module.exports = router;
