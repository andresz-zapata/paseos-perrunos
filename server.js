const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const env = require('./config/env');
const path = require("path");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

const app = express();

app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(
  cors({
    origin: [
      "https://andresz-zapata.github.io",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

const limiterGeneral = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Demasiadas peticiones, intenta de nuevo en 15 minutos" },
  standardHeaders: true,
  legacyHeaders: false,
});

const limiterLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    message:
      "Demasiados intentos de inicio de sesión, intenta de nuevo en 15 minutos",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const limiterRegistro = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { message: 'Demasiados registros desde esta IP, intenta de nuevo en 1 hora' },
  standardHeaders: true,
  legacyHeaders: false
});

app.use("/api/", limiterGeneral);
app.use("/api/auth/login", limiterLogin);
app.use("/api/auth/register", limiterRegistro);

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
const productosRoutes = require("./routes/productos");
app.use("/api/productos", productosRoutes);
const carritoRoutes = require("./routes/carrito");
app.use("/api/carrito", carritoRoutes);
const pedidosRoutes = require("./routes/pedidos");
app.use("/api/pedidos", pedidosRoutes);
const paseadoresRoutes = require("./routes/paseadores");
app.use("/api/paseadores", paseadoresRoutes);

app.use(express.static(path.join(__dirname, "/"), {
  index: false,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();

  const paginasValidas = [
    'index.html', 'login.html', 'registro.html', 'recuperar.html',
    'perfil.html', 'mascotas.html', 'reservas.html', 'admin.html',
    'admin-perfil.html', 'paseos.html', 'petshop.html', 'carrito.html',
    'checkout.html', 'pedidos.html', '404.html'
  ];

  const ruta = req.path.replace('/', '') || 'index.html';

  if (paginasValidas.includes(ruta) || ruta === '') {
    res.sendFile(path.join(__dirname, ruta === '' ? 'index.html' : ruta));
  } else {
    res.status(404).sendFile(path.join(__dirname, '404.html'));
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});