const express = require("express");
const router = express.Router();
const { Equipment, User } = require("../models");

const roleMiddleware = require("../middleware/rolemiddleware");
const authMiddleware = require("../middleware/authmiddleware");


router.post("/add", authMiddleware, roleMiddleware(["equipment_owner"]), async (req, res) => {
  try {
    const {
      name,
      type,
      brand,
      model,
      rent_price_per_day,
      location,
      description,
      specifications,
      minimum_rent_days,
      images,
      is_available
    } = req.body;

    if (!name || !type || !rent_price_per_day || !location) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const equipment = await Equipment.create({
      name,
      type,
      brand,
      model,
      rent_price_per_day,
      location,
      description,
      specifications,
      minimum_rent_days: minimum_rent_days || 1,
      images: images || [],
      is_available: is_available !== undefined ? is_available : true,
      owner_id: req.user.user_id
    });

    res.status(201).json({ message: "Equipment added successfully", equipment });
  } catch (err) {
    console.error("Error creating equipment:", err);
    res.status(500).json({ message: "Failed to add equipment", error: err.message });
  }
});

//get all equipments
router.get("/all", async (req, res) => {
  try {
    const equipments = await Equipment.findAll({
      where: { is_available: true },
      include: [
        { model: User, as: "owner", attributes: ["first_name", "last_name", "email", "location"] }
      ]
    });

    res.status(200).json(equipments);
  } catch (err) {
    console.error("Error fetching equipments:", err);
    res.status(500).json({ message: "Failed to fetch equipments", error: err.message });
  }
});
// get my equipments
router.get("/my-equipments", authMiddleware, roleMiddleware(["equipment_owner"]), async (req, res) => {
  try {
    const myEquipments = await Equipment.findAll({ where: { owner_id: req.user.user_id } });
    res.status(200).json(myEquipments);
  } catch (err) {
    console.error("Error fetching my equipments:", err);
    res.status(500).json({ message: "Failed to fetch your equipments", error: err.message });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const equipment = await Equipment.findByPk(req.params.id, {
      include: [{ model: User, as: "owner", attributes: ["first_name", "last_name", "email", "location"] }]
    });

    if (!equipment) return res.status(404).json({ message: "Equipment not found" });

    res.status(200).json(equipment);
  } catch (err) {
    console.error("Error fetching equipment:", err);
    res.status(500).json({ message: "Failed to fetch equipment", error: err.message });
  }
});


router.patch("/update/:id", authMiddleware, roleMiddleware(["equipment_owner"]), async (req, res) => {
  try {
    const equipment = await Equipment.findByPk(req.params.id);
    if (!equipment) return res.status(404).json({ message: "Equipment not found" });

    if (equipment.owner_id !== req.user.user_id)
      return res.status(403).json({ message: "Unauthorized: You can only update your own equipment" });

    // Only update allowed fields
    const allowedUpdates = [
      "name",
      "type",
      "brand",
      "model",
      "rent_price_per_day",
      "location",
      "description",
      "specifications",
      "minimum_rent_days",
      "images",
      "is_available"
    ];
    const updates = {};

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (Object.keys(updates).length === 0)
      return res.status(400).json({ message: "No valid fields provided for update" });

    await equipment.update(updates);
    res.status(200).json({ message: "Equipment updated successfully", updatedFields: updates });
  } catch (err) {
    console.error("Error updating equipment:", err);
    res.status(500).json({ message: "Failed to update equipment", error: err.message });
  }
});


router.delete("/delete/:id", authMiddleware, roleMiddleware(["equipment_owner"]), async (req, res) => {
  try {
    const equipment = await Equipment.findByPk(req.params.id);
    if (!equipment) return res.status(404).json({ message: "Equipment not found" });

    if (equipment.owner_id !== req.user.user_id)
      return res.status(403).json({ message: "Unauthorized: You can only delete your own equipment" });

    await equipment.destroy();
    res.status(200).json({ message: "Equipment deleted successfully" });
  } catch (err) {
    console.error("Error deleting equipment:", err);
    res.status(500).json({ message: "Failed to delete equipment", error: err.message });
  }
});



module.exports = router;
