const jwt = require("jsonwebtoken");
const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const { enviarBienvenida } = require("../config/mailer");
const { upload } = require("../config/cloudinary");

const { verificarToken } = require("../middleware/auth");

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
  return res.status(400).json({ message: "El correo ya está registrado" });
}

const Paseador = require('../models/paseador');
const solicitudPaseador = await Paseador.findOne({
  email,
  estado: { $in: ['pendiente', 'aprobado'] }
});

if (solicitudPaseador) {
  const mensajes = {
    pendiente: 'Este correo tiene una solicitud de paseador pendiente de revisión. Si quieres registrarte como cliente usa otro correo, o espera la respuesta del administrador.',
    aprobado: 'Este correo pertenece a un paseador aprobado. Crea tu cuenta desde el enlace de registro de paseadores.'
  };
  return res.status(400).json({ message: mensajes[solicitudPaseador.estado] });
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

      enviarBienvenida(nombre, email)
        .then(() => console.log("✅ Email de bienvenida enviado a:", email))
        .catch((emailError) => {
          console.error(
            "❌ Error al enviar email de bienvenida:",
            emailError.message
          );
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error en el servidor" });
    }
  }
);

router.post(
  "/registro-paseador",
  [
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

      const { email, password } = req.body;

      const Paseador = require('../models/paseador');
      const paseadorExiste = await Paseador.findOne({
        email,
        estado: "aprobado",
      });

      if (!paseadorExiste) {
        return res.status(404).json({
          message:
            "No encontramos un perfil de paseador aprobado con ese correo. Verifica que sea el mismo correo de tu solicitud.",
        });
      }

      if (paseadorExiste.usuario) {
        return res.status(400).json({
          message: "Este perfil de paseador ya tiene una cuenta creada. Intenta iniciar sesión.",
        });
      }

      const usuarioExiste = await User.findOne({ email });
if (usuarioExiste) {
  const mensaje = usuarioExiste.rol === 'cliente'
    ? 'Este correo ya tiene una cuenta de cliente. No puedes crear una cuenta de paseador con el mismo correo.'
    : 'Ese correo ya está registrado con otra cuenta.';
  return res.status(400).json({ message: mensaje });
}

      const salt = await bcrypt.genSalt(10);
      const passwordEncriptada = await bcrypt.hash(password, salt);

      const nuevoUsuario = new User({
        nombre: paseadorExiste.nombre,
        email,
        password: passwordEncriptada,
        rol: "paseador",
      });

      await nuevoUsuario.save();

      paseadorExiste.usuario = nuevoUsuario._id;
      await paseadorExiste.save();

      res.status(201).json({
        message: "¡Cuenta de paseador creada correctamente! 🐕",
      });
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
    res.status(200).json({
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

router.put(
  "/perfil",
  verificarToken,
  [
    body("nombre")
      .trim()
      .notEmpty()
      .withMessage("El nombre es obligatorio")
      .isLength({ min: 3 })
      .withMessage("El nombre debe tener mínimo 3 caracteres"),
    body("email")
      .optional({ checkFalsy: true })
      .isEmail()
      .withMessage("El correo no tiene un formato válido")
      .normalizeEmail(),
    body("passwordActual").optional({ checkFalsy: true }),
    body("passwordNueva")
      .optional({ checkFalsy: true })
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

      const usuario = await User.findById(req.usuario.id);
      if (!usuario) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      usuario.nombre = req.body.nombre;

      if (req.body.emailNuevo && req.body.emailNuevo !== usuario.email) {
        if (!req.body.passwordActual) {
          return res
            .status(400)
            .json({
              message:
                "Debes ingresar tu contraseña actual para cambiar el correo",
            });
        }

        const passwordCorrecta = await bcrypt.compare(
          req.body.passwordActual,
          usuario.password
        );
        if (!passwordCorrecta) {
          return res
            .status(400)
            .json({ message: "La contraseña actual es incorrecta" });
        }

        const emailExiste = await User.findOne({ email: req.body.emailNuevo });
        if (emailExiste) {
          return res
            .status(400)
            .json({
              message: "Ese correo ya está registrado por otro usuario",
            });
        }

        usuario.email = req.body.emailNuevo;
      }

      if (req.body.passwordNueva) {
        if (!req.body.passwordActual) {
          return res
            .status(400)
            .json({
              message: "Debes ingresar tu contraseña actual para cambiarla",
            });
        }

        const passwordCorrecta = await bcrypt.compare(
          req.body.passwordActual,
          usuario.password
        );
        if (!passwordCorrecta) {
          return res
            .status(400)
            .json({ message: "La contraseña actual es incorrecta" });
        }

        const salt = await bcrypt.genSalt(10);
        usuario.password = await bcrypt.hash(req.body.passwordNueva, salt);
      }

      await usuario.save();

      res.status(200).json({
        message: "¡Perfil actualizado correctamente! 🎉",
        nombre: usuario.nombre,
        email: usuario.email,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error en el servidor" });
    }
  }
);

router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token no encontrado" });
    }

    const verificado = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const usuario = await User.findById(verificado.id);
    if (!usuario || usuario.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Refresh token inválido" });
    }

    const nuevoAccessToken = jwt.sign(
      { id: usuario._id, nombre: usuario.nombre, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.status(200).json({ token: nuevoAccessToken });
  } catch (error) {
    return res
      .status(403)
      .json({ message: "Refresh token inválido o expirado" });
  }
});

router.post("/logout", verificarToken, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.usuario.id, { refreshToken: "" });
    res.status(200).json({ message: "Sesión cerrada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

router.get("/stats", verificarToken, async (req, res) => {
  try {
    if (req.usuario.rol !== "admin") {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    const totalUsuarios = await User.countDocuments({ rol: "cliente" });
    const totalMascotas = await require("../models/mascota").countDocuments();

    res.status(200).json({ totalUsuarios, totalMascotas });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

router.get("/usuarios", verificarToken, async (req, res) => {
  try {
    if (req.usuario.rol !== "admin") {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    const usuarios = await User.find({ rol: "cliente" })
      .select("-password -refreshToken")
      .sort({ createdAt: -1 });

    res.status(200).json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

router.patch("/usuarios/:id/rol", verificarToken, async (req, res) => {
  try {
    if (req.usuario.rol !== "admin") {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    const { rol } = req.body;

    if (!["cliente", "admin"].includes(rol)) {
      return res.status(400).json({ message: "Rol no válido" });
    }

    if (req.params.id === req.usuario.id) {
      return res
        .status(400)
        .json({ message: "No puedes cambiar tu propio rol" });
    }

    const usuario = await User.findByIdAndUpdate(
      req.params.id,
      { rol },
      { new: true }
    ).select("-password -refreshToken");

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res
      .status(200)
      .json({ message: `Rol actualizado a ${rol} correctamente`, usuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// Ruta de health check para detectar si el servidor está activo
router.get('/ping', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = router;
