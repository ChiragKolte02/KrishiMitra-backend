const express = require("express");
const router = express.Router();
const { Product, User } = require("../models");
const authMiddleware = require("../middleware/authmiddleware");
const roleMiddleware = require("../middleware/rolemiddleware");


// =====================
// CREATE PRODUCT (Farmer only)
// =====================
router.post("/add", authMiddleware, roleMiddleware(["farmer"]), async (req, res) => {
  try {
    const {
      crop_name,
      category,
      quantity,
      unit,
      price_per_kg,
      quality,
      location,
      harvest_date,
      description,
      images,
      is_available
    } = req.body;

    if (!crop_name || !category || !quantity || !price_per_kg || !location || !harvest_date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const product = await Product.create({
      crop_name,
      category,
      quantity,
      unit: unit || "kg",
      price_per_kg,
      quality: quality || "A",
      location,
      harvest_date,
      description,
      images: images || [],
      is_available: is_available !== undefined ? is_available : true,
      farmer_id: req.user.user_id
    });

    res.status(201).json({ message: "Product added successfully", product });
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ message: "Failed to add product", error: err.message });
  }
});

// =====================
// GET ALL AVAILABLE PRODUCTS (Anyone)
// =====================
router.get("/all", async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { is_available: true },
      include: [
        { model: User, as: "farmer", attributes: ["first_name", "last_name", "email", "location"] }
      ]
    });

    res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Failed to fetch products", error: err.message });
  }
});
// =====================
// GET MY OWN PRODUCTS (Farmer only)
// =====================
router.get("/my-products", authMiddleware, roleMiddleware(["farmer"]), async (req, res) => {
  try {
    const myProducts = await Product.findAll({ where: { farmer_id: req.user.user_id } });
    res.status(200).json(myProducts);
  } catch (err) {
    console.error("Error fetching my products:", err);
    res.status(500).json({ message: "Failed to fetch your products", error: err.message });
  }
});


// =====================
// GET PRODUCT BY ID (Anyone)
// =====================
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: User, as: "farmer", attributes: ["first_name", "last_name", "email", "location"] }]
    });

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ message: "Failed to fetch product", error: err.message });
  }
});

// =====================
// UPDATE PRODUCT (Farmer only, Partial Update)
// =====================
router.patch("/update/:id", authMiddleware, roleMiddleware(["farmer"]), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.farmer_id !== req.user.user_id)
      return res.status(403).json({ message: "Unauthorized: You can only update your own product" });

    const allowedUpdates = [
      "crop_name",
      "category",
      "quantity",
      "unit",
      "price_per_kg",
      "quality",
      "location",
      "harvest_date",
      "description",
      "images",
      "is_available"
    ];

    const updates = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (Object.keys(updates).length === 0)
      return res.status(400).json({ message: "No valid fields provided for update" });

    await product.update(updates);
    res.status(200).json({ message: "Product updated successfully", updatedFields: updates });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ message: "Failed to update product", error: err.message });
  }
});

// =====================
// DELETE PRODUCT (Farmer only)
// =====================
router.delete("/delete/:id", authMiddleware, roleMiddleware(["farmer"]), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.farmer_id !== req.user.user_id)
      return res.status(403).json({ message: "Unauthorized: You can only delete your own product" });

    await product.destroy();
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ message: "Failed to delete product", error: err.message });
  }
});


module.exports = router;
