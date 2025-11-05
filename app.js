const express = require("express");
const { sequelize } = require("./models");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const path = require("path");

// Import routes

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const landRoutes = require("./routes/landRoutes");
const equipmentRoutes=require("./routes/equipmentRoutes")
const productRoutes=require("./routes/productRoutes")
const leaseRoutes=require("./routes/leaseRoutes")
const transactionRoutes=require("./routes/transactionRoutes")
const transactionReceiptRoutes=require("./routes/transactionReceiptRoutes")
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const cors=require("cors")

app.use(cors({
    origin:"http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE","PATCH"],
    credentials: true
}))

app.use("/receipts", express.static(path.join(__dirname, "receipts")));

app.get("/", (req, res) => {
  res.send("🌾 KrishiMitra Backend Running!");
});

app.use("/auth", authRoutes);
app.use("/user", userRoutes); // 👈 User routes mounted
app.use("/lands",landRoutes)
app.use("/equipment",equipmentRoutes)
app.use("/product",productRoutes)
app.use("/lease",leaseRoutes)
app.use("/transaction",transactionRoutes)
app.use("/receipts",transactionReceiptRoutes)

sequelize.sync({ alter: true })
  .then(() => console.log("🗄️ Database synced with all relationships!"))
  .catch((err) => console.error("❌ Sync error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));

