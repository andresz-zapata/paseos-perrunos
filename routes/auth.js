const jwt = require("jsonwebtoken");
const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const { enviarBienvenida } = require("../config/mailer");
const { upload } = require("../config/cloudinary");

const { verificarToken } = require('../middleware/auth');

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

      try {
        await enviarBienvenida(nombre, email);
      } catch (emailError) {
        console.error("Error al enviar email de bienvenida:", emailError);
      }

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
        return res.status(400).json({ message: "Correo o contraseña incorrectos" });
      }

      const passwordCorrecta = await bcrypt.compare(password, usuario.password);
      if (!passwordCorrecta) {
        return res.status(400).json({ message: "Correo o contraseña incorrectos" });
      }

      const accessToken = jwt.sign(
        { id: usuario._id, nombre: usuario.nombre, rol: usuario.rol },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      const refreshToken = jwt.sign(
        { id: usuario._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
      );

      usuario.refreshToken = refreshToken;
      await usuario.save();

      res.status(200).json({
        message: `¡Bienvenido ${usuario.nombre}! 🐾`,
        token: accessToken,
        refreshToken,
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
    res
      .status(200)
      .json({
        nombre: usuario.nombre,
        email: usuario.email,
        foto: usuario.foto,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

router.post(
  "/foto",
  verificarToken,
  upload.single("foto"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No se envió ninguna imagen" });
      }

      const usuario = await User.findByIdAndUpdate(
        req.usuario.id,
        { foto: req.file.path },
        { new: true }
      ).select("-password");

      if (!usuario) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      res.status(200).json({
        message: "Foto de perfil actualizada correctamente 🎉",
        foto: usuario.foto,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error en el servidor" });
    }
  }
);

router.put('/perfil', verificarToken, [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 3 }).withMessage('El nombre debe tener mínimo 3 caracteres'),
  body('passwordActual')
    .optional({ checkFalsy: true }),
  body('passwordNueva')
    .optional({ checkFalsy: true })
    .isLength({ min: 6 }).withMessage('La contraseña debe tener mínimo 6 caracteres')
    .matches(/\d/).withMessage('La contraseña debe contener al menos un número')
    .matches(/[a-zA-Z]/).withMessage('La contraseña debe contener al menos una letra')
], async (req, res) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ message: errores.array()[0].msg });
    }

    const usuario = await User.findById(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    usuario.nombre = req.body.nombre;

    if (req.body.passwordNueva) {
      if (!req.body.passwordActual) {
        return res.status(400).json({ message: 'Debes ingresar tu contraseña actual' });
      }

      const passwordCorrecta = await bcrypt.compare(req.body.passwordActual, usuario.password);
      if (!passwordCorrecta) {
        return res.status(400).json({ message: 'La contraseña actual es incorrecta' });
      }

      const salt = await bcrypt.genSalt(10);
      usuario.password = await bcrypt.hash(req.body.passwordNueva, salt);
    }

    await usuario.save();

    res.status(200).json({
      message: '¡Perfil actualizado correctamente! 🎉',
      nombre: usuario.nombre
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token no encontrado' });
    }

    const verificado = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const usuario = await User.findById(verificado.id);
    if (!usuario || usuario.refreshToken !== refreshToken) {
      return res.status(403).json({ message: 'Refresh token inválido' });
    }

    const nuevoAccessToken = jwt.sign(
      { id: usuario._id, nombre: usuario.nombre, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.status(200).json({ token: nuevoAccessToken });

  } catch (error) {
    return res.status(403).json({ message: 'Refresh token inválido o expirado' });
  }
});

router.post('/logout', verificarToken, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.usuario.id, { refreshToken: '' });
    res.status(200).json({ message: 'Sesión cerrada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;
