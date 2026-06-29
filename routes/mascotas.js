const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const Mascota = require("../models/mascota");
const { upload } = require("../config/cloudinary");

const { verificarToken } = require('../middleware/auth');

// ==========================================
// RUTA: REGISTRAR MASCOTA (POST /)
// ==========================================
router.post(
  "/",
  verificarToken,
  upload.single("foto"),
  [
    body("nombre")
      .trim()
      .notEmpty()
      .withMessage("El nombre es obligatorio")
      .isLength({ min: 2 })
      .withMessage("El nombre debe tener mínimo 2 caracteres"),
    body("raza").trim().notEmpty().withMessage("La raza es obligatoria"),
    body("edad")
      .notEmpty()
      .withMessage("La edad es obligatoria")
      .isInt({ min: 0, max: 30 })
      .withMessage("La edad debe ser un número entre 0 y 30"),
    body("genero")
      .trim()
      .notEmpty()
      .withMessage("El género es obligatorio")
      .isIn(["macho", "hembra"])
      .withMessage("El género debe ser macho o hembra"),
  ],
  async (req, res) => {
    try {
      const errores = validationResult(req);
      if (!errores.isEmpty()) {
        return res.status(400).json({ message: errores.array()[0].msg });
      }

      const { nombre, raza, edad, genero, notas } = req.body;
      const foto = req.file ? req.file.path : "";

      const mascota = new Mascota({
        usuario: req.usuario.id,
        nombre,
        raza,
        edad,
        genero,
        foto,
        notas,
      });

      await mascota.save();
      res
        .status(201)
        .json({ message: "¡Mascota registrada correctamente! 🐾", mascota });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error en el servidor" });
    }
  }
);

// ==========================================
// RUTA: OBTENER MASCOTAS (GET /)
// ==========================================
router.get("/", verificarToken, async (req, res) => {
  try {
    const mascotas = await Mascota.find({ usuario: req.usuario.id }).sort({
      createdAt: -1,
    });
    res.status(200).json(mascotas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// ==========================================
// RUTA: ACTUALIZAR MASCOTA (PUT /:id)
// ==========================================
router.put('/:id', verificarToken, upload.single('foto'), [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 2 }).withMessage('El nombre debe tener mínimo 2 caracteres'),
  body('raza')
    .trim()
    .notEmpty().withMessage('La raza es obligatoria'),
  body('edad')
    .notEmpty().withMessage('La edad es obligatoria')
    .isInt({ min: 0, max: 30 }).withMessage('La edad debe ser un número entre 0 y 30'),
  body('genero')
    .trim()
    .notEmpty().withMessage('El género es obligatorio')
    .isIn(['macho', 'hembra']).withMessage('El género debe ser macho o hembra')
], async (req, res) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ message: errores.array()[0].msg });
    }

    const mascota = await Mascota.findOne({
      _id: req.params.id,
      usuario: req.usuario.id
    });

    if (!mascota) {
      return res.status(404).json({ message: 'Mascota no encontrada' });
    }

    mascota.nombre = req.body.nombre;
    mascota.raza = req.body.raza;
    mascota.edad = req.body.edad;
    mascota.genero = req.body.genero;
    mascota.notas = req.body.notas || '';

    if (req.file) {
      mascota.foto = req.file.path;
    }

    await mascota.save();
    res.status(200).json({ message: '¡Mascota actualizada correctamente! 🐾', mascota });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// ==========================================
// RUTA: ELIMINAR MASCOTA (DELETE /:id)
// ==========================================
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const mascota = await Mascota.findOne({
      _id: req.params.id,
      usuario: req.usuario.id
    });

    if (!mascota) {
      return res.status(404).json({ message: 'Mascota no encontrada' });
    }

    await mascota.deleteOne();
    res.status(200).json({ message: '¡Mascota eliminada correctamente!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;