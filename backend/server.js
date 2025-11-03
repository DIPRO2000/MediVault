import express from "express";
import cors from "cors";
import dotenv from "dotenv";

//Routes would be imported here in future
import ipfsRoutes from "./src/routes/ipfsRoutes.js";  

// Load environment variables
dotenv.config();


const app = express();


// Middleware
app.use(cors());
app.use(express.json());

//Routes
app.use("/api/ipfs", ipfsRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("✅ Server is running successfully!");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on PORT:${PORT}`);
});
