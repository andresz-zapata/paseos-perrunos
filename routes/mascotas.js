const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Mascota = require('../models/mascota');
const { upload } = require('../config/cloudinary');

const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado, token no encontrado' });
  }

  try {
    const verificado = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = verificado;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido o expirado' });
  }
};

router.post('/', verificarToken, upload.single('foto'), [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 2 }).withMessage('El nombre debe tener mínimo 2 caracteres'),
  body('raza')
    .trim()
    .notEmpty().withMessage('La raza es obligatoria'),
  body('edad')
    .notEmpty().withMessage('La edad es obligatoria')
    .isInt({ min: 0, max: 30 }).withMessage('La edad debe ser un número entre 0 y 30')
], async (req, res) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ message: errores.array()[0].msg });
    }

    const { nombre, raza, edad, notas } = req.body;
    const foto = req.file ? req.file.path : '';

    const mascota = new Mascota({
      usuario: req.usuario.id,
      nombre,
      raza,
      edad,
      foto,
      notas
    });

    await mascota.save();
    res.status(201).json({ message: '¡Mascota registrada correctamente! 🐾', mascota });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

router.get('/', verificarToken, async (req, res) => {
  try {
    const mascotas = await Mascota.find({ usuario: req.usuario.id }).sort({ createdAt: -1 });
    res.status(200).json(mascotas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;