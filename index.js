import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dataRoutes from "./routes/data.js";

const app = express();

app.use(cors());
app.use(bodyParser.json());

// tes server
app.get("/", (req, res) => {
  res.send("Server Monitor Backend is running 🚀");
});

// gunakan prefix /api untuk semua route
app.use("/api/data", dataRoutes);

// handle route tidak ditemukan
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.path,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
