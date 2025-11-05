const express = require("express");
const router = express.Router();
const { Lease, Land, Equipment, User } = require("../models");
const authMiddleware = require("../middleware/authmiddleware");
const roleMiddleware = require("../middleware/rolemiddleware");


// router.post("/create/:type/:id", authMiddleware, async (req, res) => {
//   try {
//     const lease_type = req.params.type;       // "land" or "equipment"
//     const resourceId = req.params.id;         // land_id or equipment_id
//     const { start_date, end_date, payment_method } = req.body;

//     if (!lease_type || !resourceId || !start_date || !end_date) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     let owner_id;
//     let total_amount;
//     let total_days = Math.ceil(
//       (new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24)
//     );
//     if (total_days <= 0) return res.status(400).json({ message: "Invalid dates" });

//     if (lease_type === "land") {
//       const land = await Land.findByPk(resourceId);
//       if (!land) return res.status(404).json({ message: "Land not found" });
//       owner_id = land.owner_id;
//       total_amount = Number(land.rent_price_per_day) * total_days;
//     } else if (lease_type === "equipment") {
//       const equipment = await Equipment.findByPk(resourceId);
//       if (!equipment) return res.status(404).json({ message: "Equipment not found" });
//       owner_id = equipment.owner_id;
//       total_amount = Number(equipment.rent_price_per_day) * total_days;
//     } else {
//       return res.status(400).json({ message: "Invalid lease type" });
//     }

//     const lease = await Lease.create({
//       renter_id: req.user.user_id,
//       owner_id,
//       lease_type,
//       land_id: lease_type === "land" ? resourceId : null,
//       equipment_id: lease_type === "equipment" ? resourceId : null,
//       start_date,
//       end_date,
//       total_days,
//       total_amount: total_amount.toFixed(2),  // rounding to 2 decimals
//       payment_method: payment_method || "demo",
//       status: "pending"
//     });

//     res.status(201).json({ message: "Lease created successfully", lease });
//   } catch (err) {
//     console.error("Error creating lease:", err);
//     res.status(500).json({ message: "Failed to create lease", error: err.message });
//   }
// });


// =====================
// GET ALL LEASES (Admin only)
// =====================
router.get("/all", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const leases = await Lease.findAll({
      include: [
        { model: User, as: "renter", attributes: ["first_name", "last_name", "email"] },
        { model: User, as: "owner", attributes: ["first_name", "last_name", "email"] },
        { model: Land, as: "land" },
        { model: Equipment, as: "equipment" }
      ]
    });

    res.status(200).json(leases);
  } catch (err) {
    console.error("Error fetching leases:", err);
    res.status(500).json({ message: "Failed to fetch leases", error: err.message });
  }
});

// =====================
// GET MY LEASES (Renter only)
// =====================
router.get("/my-leases", authMiddleware, async (req, res) => {
  try {
    const myLeases = await Lease.findAll({
      where: { renter_id: req.user.user_id },
      include: [
        { model: User, as: "owner", attributes: ["first_name", "last_name", "email"] },
        { model: Land, as: "land" },
        { model: Equipment, as: "equipment" }
      ]
    });

    res.status(200).json(myLeases);
  } catch (err) {
    console.error("Error fetching my leases:", err);
    res.status(500).json({ message: "Failed to fetch your leases", error: err.message });
  }
});

// =====================
// UPDATE LEASE STATUS (Owner only)
// =====================
router.patch("/update-status/:id", authMiddleware, async (req, res) => {
  try {
    const lease = await Lease.findByPk(req.params.id);
    if (!lease) return res.status(404).json({ message: "Lease not found" });

    if (lease.owner_id !== req.user.user_id)
      return res.status(403).json({ message: "Unauthorized: Only owner can update status" });

    const { status } = req.body;
    if (!["pending", "completed", "failed"].includes(status))
      return res.status(400).json({ message: "Invalid status" });

    lease.status = status;
    await lease.save();

    res.status(200).json({ message: "Lease status updated", lease });
  } catch (err) {
    console.error("Error updating lease status:", err);
    res.status(500).json({ message: "Failed to update lease", error: err.message });
  }
});

// =====================
// DELETE LEASE (Admin only)
// =====================
router.delete("/delete/:id", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const lease = await Lease.findByPk(req.params.id);
    if (!lease) return res.status(404).json({ message: "Lease not found" });

    await lease.destroy();
    res.status(200).json({ message: "Lease deleted successfully" });
  } catch (err) {
    console.error("Error deleting lease:", err);
    res.status(500).json({ message: "Failed to delete lease", error: err.message });
  }
});

module.exports = router;
