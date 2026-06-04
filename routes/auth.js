const jwt = require("jsonwebtoken");
const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/user");

const verificarToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Acceso denegado, token no encontrado" });
  }

  try {
    const verificado = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = verificado;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token inválido o expirado" });
  }
};

router.post(
  "/register",
  [
    body("nombre")
      .trim()
      .notEmpty()
      .withMessage("El nombre es obligatorio")
      .isLength({ min: 3 })
      .withMessage("El nombre debe tener mínimo 3 caracteres"),
    body("email")
      .trim()
      .notEmpty()
      .withMessage("El correo es obligatorio")
      .isEmail()
      .withMessage("El correo no tiene un formato válido")
      .normalizeEmail(),
    body("password")
      .notEmpty()
      .withMessage("La contraseña es obligatoria")
      .isLength({ min: 6 })
      .withMessage("La contraseña debe tener mínimo 6 caracteres")
      .matches(/\d/)
      .withMessage("La contraseña debe contener al menos un número")
      .matches(/[a-zA-Z]/)
      .withMessage("La contraseña debe contener al menos una letra"),
  ],
  async (req, res) => {
    try {
      const errores = validationResult(req);
      if (!errores.isEmpty()) {
        return res.status(400).json({ message: errores.array()[0].msg });
      }
      const { nombre, email, password } = req.body;

      const usuarioExiste = await User.findOne({ email });
      if (usuarioExiste) {
        return res
          .status(400)
          .json({ message: "El correo ya está registrado" });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordEncriptada = await bcrypt.hash(password, salt);

      const nuevoUsuario = new User({
        nombre,
        email,
        password: passwordEncriptada,
      });

      await nuevoUsuario.save();

      res.status(201).json({ message: "¡Cuenta creada correctamente! 🎉" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error en el servidor" });
    }
  }
);

router.post(
  "/login",
  [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("El correo es obligatorio")
      .isEmail()
      .withMessage("El correo no tiene un formato válido"),
    body("password").notEmpty().withMessage("La contraseña es obligatoria"),
  ],
  async (req, res) => {
    try {
      const errores = validationResult(req);
      if (!errores.isEmpty()) {
        return res.status(400).json({ message: errores.array()[0].msg });
      }
      const { email, password } = req.body;

      const usuario = await User.findOne({ email });
      if (!usuario) {
        return res
          .status(400)
          .json({ message: "Correo o contraseña incorrectos" });
      }

      const passwordCorrecta = await bcrypt.compare(password, usuario.password);
      if (!passwordCorrecta) {
        return res
          .status(400)
          .json({ message: "Correo o contraseña incorrectos" });
      }

      const token = jwt.sign(
        { id: usuario._id, nombre: usuario.nombre, rol: usuario.rol },
        process.env.JWT_SECRET,
        { expiresIn: "8h" }
      );

      res.status(200).json({
        message: `¡Bienvenido ${usuario.nombre}! 🐾`,
        token,
        nombre: usuario.nombre,
        rol: usuario.rol,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error en el servidor" });
    }
  }
);

router.get("/perfil", verificarToken, async (req, res) => {
  try {
    const usuario = await User.findById(req.usuario.id).select("-password");
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.status(200).json({ nombre: usuario.nombre, email: usuario.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

module.exports = router;
