const express = require("express");
const router = express.Router();
const { Transaction, Product, Land, Equipment, Lease,User } = require("../models");
const authMiddleware = require("../middleware/authmiddleware");



router.post("/create/:type/:id", authMiddleware, async (req, res) => {
  try {
    const { type, id } = req.params;
    const { quantity, start_date, end_date, payment_method, transaction_type } = req.body;

    if (!transaction_type) {
      return res.status(400).json({ message: "transaction_type is required (buy or rent)" });
    }

    let item, seller_id, total_amount, price;

    // ==========================
    // BUY LOGIC (Product only)
    // ==========================
    if (transaction_type === "buy") {
      if (type !== "product") {
        return res.status(400).json({ message: "Only products can be bought" });
      }

      if (!quantity || isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({ message: "Invalid quantity" });
      }

      item = await Product.findByPk(id);
      if (!item) return res.status(404).json({ message: "Product not found" });
      if (!item.is_available || item.available_quantity <= 0) {
        return res.status(400).json({ message: "Product not available" });
      }

      if (quantity > item.available_quantity) {
        return res.status(400).json({ message: `Only ${item.available_quantity} kg available` });
      }

      seller_id = item.farmer_id;
      if (!seller_id) return res.status(400).json({ message: "Product has no seller" });

      if (req.user.user_id === seller_id) {
        return res.status(400).json({ message: "You cannot buy your own product" });
      }

      price = Number(item.price_per_kg || item.price);
      total_amount = price * Number(quantity);

     // ✅ BALANCE CHECK & UPDATE FOR BUYER
      const buyer = await User.findByPk(req.user.user_id);
      
      // ✅ FIX: Handle NaN/undefined balance for buyer
      const buyerBalance = parseFloat(buyer.balance) || 0;
      if (buyerBalance < total_amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // Deduct from buyer's balance
      buyer.balance = buyerBalance - total_amount;
      await buyer.save();

      // ✅ ADD TO SELLER'S BALANCE
      const seller = await User.findByPk(seller_id);
      
      // ✅ FIX: Handle NaN/undefined balance for seller
      const sellerBalance = parseFloat(seller.balance) || 0;
      seller.balance = sellerBalance + total_amount;
      await seller.save();

      console.log('🔍 DEBUG - Seller Balance Update:');
      console.log('Seller ID:', seller_id);

      // Update product quantity
      item.quantity -= Number(quantity);
      item.available_quantity -= Number(quantity);
      if (item.available_quantity <= 0) {
        item.is_available = false;
        item.available_quantity = 0;
      }
      await item.save();

      // Create transaction
      const transaction = await Transaction.create({
        buyer_id: req.user.user_id,
        seller_id,
        product_id: id,
        quantity,
        total_amount: total_amount.toFixed(2),
        payment_method: payment_method || "demo",
        status: "completed",
      });

      return res.status(201).json({
        message: "Product purchased successfully",
        transaction,
        remaining_quantity: item.available_quantity
      });
    }
    

    // ==========================
    // RENT LOGIC (Land/Equipment only)
    // ==========================
    else if (transaction_type === "rent") {
      if (type !== "land" && type !== "equipment") {
        return res.status(400).json({ message: "Only land and equipment can be rented" });
      }

      if (!start_date || !end_date) {
        return res.status(400).json({ message: "start_date and end_date are required for rent" });
      }

      const total_days = Math.ceil(
        (new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24)
      );
      if (total_days <= 0) return res.status(400).json({ message: "Invalid rental dates" });

      // ===== LAND RENT =====
      if (type === "land") {
        item = await Land.findByPk(id);
        if (!item) return res.status(404).json({ message: "Land not found" });
        if (!item.is_available) return res.status(400).json({ message: "Land not available" });

        seller_id = item.owner_id;
        if (req.user.user_id === seller_id) {
          return res.status(400).json({ message: "You cannot rent your own land" });
        }

        price = parseFloat(item.rent_price_per_day);
        if (isNaN(price)) {
          return res.status(400).json({ message: `Invalid rent_price_per_day for this land` });
        }

        total_amount = price * total_days;
        item.is_available = false;
        await item.save();
      }

      // ===== EQUIPMENT RENT =====
      if (type === "equipment") {
        item = await Equipment.findByPk(id);
        if (!item) return res.status(404).json({ message: "Equipment not found" });
        if (!item.is_available) return res.status(400).json({ message: "Equipment not available" });

        seller_id = item.owner_id;
        if (req.user.user_id === seller_id) {
          return res.status(400).json({ message: "You cannot rent your own equipment" });
        }

        price = parseFloat(item.rent_price_per_day);
        if (isNaN(price)) {
          return res.status(400).json({ message: `Invalid rent_price_per_day for this equipment` });
        }

        total_amount = price * total_days;
        item.is_available = false;
        await item.save();
      }
         // ✅ BALANCE CHECK & UPDATE FOR RENTER
      const renter = await User.findByPk(req.user.user_id);
      
      // ✅ FIX: Handle NaN/undefined balance for renter
      const renterBalance = parseFloat(renter.balance) || 0;
      if (renterBalance < total_amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // Deduct from renter's balance
      renter.balance = renterBalance - total_amount;
      await renter.save();

      // ✅ ADD TO OWNER'S BALANCE
      const owner = await User.findByPk(seller_id);
      
      // ✅ FIX: Handle NaN/undefined balance for owner
      const ownerBalance = parseFloat(owner.balance) || 0;
      owner.balance = ownerBalance + total_amount;
      await owner.save();

      console.log('🔍 DEBUG - Owner Balance Update:');
      console.log('Owner ID:', seller_id);
      // Create Lease entry
      const lease = await Lease.create({
        renter_id: req.user.user_id,
        owner_id: seller_id,
        lease_type: type,
        land_id: type === "land" ? id : null,
        equipment_id: type === "equipment" ? id : null,
        start_date,
        end_date,
        total_days,
        total_amount: total_amount.toFixed(2),
        payment_method: payment_method || "demo",
        status: "pending",
      });

      // Create transaction linked to lease
    const transaction = await Transaction.create({
    buyer_id: req.user.user_id,
    seller_id,
    lease_id: lease.lease_id,
    product_id: null,
    land_id: type === "land" ? id : null,
    equipment_id: type === "equipment" ? id : null,
    quantity: 1,
    total_amount: total_amount.toFixed(2),
    payment_method: payment_method || "demo",
    status: "completed",
});

      return res.status(201).json({
        message: `${type} rented successfully`,
        lease,
        transaction,
      });
    }

    // ==========================
    // Invalid transaction_type
    // ==========================
    else {
      return res.status(400).json({
        message: "Invalid transaction_type (use 'buy' for product or 'rent' for land/equipment)",
      });
    }

  } catch (err) {
    console.error("Error creating transaction/lease:", err);
    res.status(500).json({ message: "Failed to process request", error: err.message });
  }
});


router.get("/my", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.user_id;

    const transactions = await Transaction.findAll({
      where: { buyer_id: userId },
      include: [
        { model: Product, as: "product" },
        { model: Lease, as: "lease" },
        { model: Land, as: "land" },
        { model: Equipment, as: "equipment" }
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      message: "Your transactions fetched successfully",
      transactions
    });

  } catch (err) {
    console.error("Error fetching user transactions:", err);
    res.status(500).json({ message: "Failed to fetch transactions", error: err.message });
  }
});

module.exports = router;
