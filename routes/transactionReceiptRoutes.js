const express = require("express");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const { Transaction, Product, Lease, Land, Equipment, User } = require("../models");
const authMiddleware = require("../middleware/authmiddleware");

const router = express.Router();


const receiptsFolder = path.join(__dirname, "../receipts");
if (!fs.existsSync(receiptsFolder)) fs.mkdirSync(receiptsFolder);


router.get("/product/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({
      where: { transaction_id: id },
      include: [
        { model: Product, as: "product", include: [{ model: User, as: "farmer" }] },
        { model: User, as: "buyer" },
        { model: User, as: "seller" }
      ]
    });

    if (!transaction) return res.status(404).json({ message: "Transaction not found" });

    const filePath = path.join(receiptsFolder, `product_receipt_${id}.pdf`);

    // Generate PDF if it doesn't exist
    if (!fs.existsSync(filePath)) {
      const doc = new PDFDocument();
      doc.pipe(fs.createWriteStream(filePath));

      doc.fontSize(20).text("KrishiMitra Product Receipt", { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(`Transaction ID: ${transaction.transaction_id}`);
      doc.text(`Buyer: ${transaction.buyer?.first_name || transaction.buyer?.email}`);
      doc.text(`Seller/Farmer: ${transaction.seller?.first_name || transaction.seller?.email}`);
      doc.text(`Product: ${transaction.product?.crop_name}`);
      doc.text(`Quantity: ${transaction.quantity} kg`);
      doc.text(`Total Amount: ₹${transaction.total_amount}`);
      doc.text(`Payment Method: ${transaction.payment_method}`);
      doc.text(`Status: ${transaction.status}`);
      doc.text(`Date: ${transaction.createdAt.toDateString()}`);

      doc.end();
    }

    // Force download immediately
    return res.download(filePath, `product_receipt_${id}.pdf`);

  } catch (err) {
    console.error("Failed to generate/download Product PDF:", err);
    res.status(500).json({ message: "Failed to generate/download Product PDF", error: err.message });
  }
});


router.get("/lease/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({
      where: { transaction_id: id },
      include: [
        { 
          model: Lease, 
          as: "lease",
          include: [
            { model: User, as: "renter" },
            { model: User, as: "owner" },
            { model: Land, as: "land" },
            { model: Equipment, as: "equipment" }
          ]
        }
      ]
    });

    if (!transaction) return res.status(404).json({ message: "Transaction not found" });
    const lease = transaction.lease;
    if (!lease) return res.status(404).json({ message: "Lease not associated to this transaction" });

    const filePath = path.join(receiptsFolder, `lease_receipt_${id}.pdf`);

    // Generate PDF if it doesn't exist
    if (!fs.existsSync(filePath)) {
      const doc = new PDFDocument();
      doc.pipe(fs.createWriteStream(filePath));

      doc.fontSize(20).text("KrishiMitra Lease Receipt", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Lease ID: ${lease.lease_id}`);
    doc.text(`Renter: ${lease.renter ? `${lease.renter.first_name || ''} ${lease.renter.last_name || ''}`.trim() : lease.renter?.email || 'Unknown'}`);
    doc.text(`Owner: ${lease.owner ? `${lease.owner.first_name || ''} ${lease.owner.last_name || ''}`.trim() : lease.owner?.email || 'Unknown'}`);

    if (lease.lease_type === "land") {
      doc.text(`Land: ${lease.land ? (lease.land.name || lease.land.location || 'N/A') : 'N/A'}`);
    } else if (lease.lease_type === "equipment") {
      doc.text(`Equipment: ${lease.equipment ? (lease.equipment.name || 'N/A') : 'N/A'}`);
    }

    doc.text(`Start Date: ${new Date(lease.start_date).toDateString()}`);
    doc.text(`End Date: ${new Date(lease.end_date).toDateString()}`);
    doc.text(`Total Days: ${lease.total_days}`);
    doc.text(`Total Amount: ₹${lease.total_amount}`);
    doc.text(`Payment Method: ${transaction.payment_method || 'N/A'}`);
    doc.text(`Status: ${transaction.status || 'N/A'}`);
    doc.text(`Date: ${new Date(transaction.createdAt).toDateString()}`);

      doc.end();
    }

    // Force download immediately
    return res.download(filePath, `lease_receipt_${id}.pdf`);

  } catch (err) {
    console.error("Failed to generate/download Lease PDF:", err);
    res.status(500).json({ message: "Failed to generate/download Lease PDF", error: err.message });
  }
});

module.exports = router;
