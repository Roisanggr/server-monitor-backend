import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./db.js";
import dataRoute from "./src/routes/data.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// ROUTE UTAMA
app.use("/api/data", dataRoute);

// Default route (fallback)
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found", path: req.originalUrl });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
