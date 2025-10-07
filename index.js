import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dataRoutes from "./src/routes/data.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    message: "Route not found",
    path: req.path 
  });
});

// Route utama
app.use("/api/data", dataRoutes);

app.get("/", (req, res) => {
  res.send("Server Monitor Backend is Running 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
