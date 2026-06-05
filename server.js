const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    'https://andresz-zapata.github.io',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.options('*', cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "/")));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch((error) => console.error("❌ Error al conectar:", error));

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);
const mascotasRoutes = require("./routes/mascotas");
app.use("/api/mascotas", mascotasRoutes);
const reservasRoutes = require("./routes/reservas");
app.use("/api/reservas", reservasRoutes);
app.get("/{*path}", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
