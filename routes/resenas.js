const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Resena = require('../models/resena');
const Reserva = require('../models/reserva');
const Paseador = require('../models/paseador');
const { verificarToken } = require('../middleware/auth');

// Crear una reseña (solo el cliente dueño de la reserva, y solo si está "entregado")
router.post('/', verificarToken, [
  body('reservaId').notEmpty().withMessage('La reserva es obligatoria'),
  body('estrellas').isInt({ min: 1, max: 5 }).withMessage('La calificación debe ser entre 1 y 5 estrellas'),
  body('comentario').optional({ checkFalsy: true }).trim().isLength({ max: 500 }).withMessage('El comentario no puede superar los 500 caracteres')
], async (req, res) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ message: errores.array()[0].msg });
    }

    const { reservaId, estrellas, comentario } = req.body;

    // Validación 1: la reserva existe y pertenece a este usuario
    const reserva = await Reserva.findOne({ _id: reservaId, usuario: req.usuario.id });
    if (!reserva) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    // Validación 2: el paseo debe estar entregado
    if (reserva.estado !== 'entregado') {
      return res.status(400).json({ message: 'Solo puedes calificar paseos que ya fueron entregados' });
    }

    // Validación 3: debe tener un paseador asignado
    if (!reserva.paseadorAsignado) {
      return res.status(400).json({ message: 'Esta reserva no tiene un paseador asignado para calificar' });
    }

    // Validación 4: no puede existir ya una reseña para esta reserva (defensa adicional ante el índice único)
    const resenaExiste = await Resena.findOne({ reserva: reservaId });
    if (resenaExiste) {
      return res.status(400).json({ message: 'Ya calificaste esta reserva' });
    }

    const resena = new Resena({
      reserva: reservaId,
      paseador: reserva.paseadorAsignado,
      usuario: req.usuario.id,
      estrellas,
      comentario
    });

    await resena.save();

    // Recalcular el promedio del paseador (valor derivado cacheado)
    const todasLasResenas = await Resena.find({ paseador: reserva.paseadorAsignado });
    const sumaEstrellas = todasLasResenas.reduce((sum, r) => sum + r.estrellas, 0);
    const nuevoPromedio = sumaEstrellas / todasLasResenas.length;

    await Paseador.findByIdAndUpdate(reserva.paseadorAsignado, {
      calificacionPromedio: nuevoPromedio,
      totalResenas: todasLasResenas.length
    });

    res.status(201).json({ message: '¡Gracias por tu calificación! 🐾', resena });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Ver las reseñas públicas de un paseador (para mostrar en el modal)
router.get('/paseador/:paseadorId', async (req, res) => {
  try {
    const resenas = await Resena.find({ paseador: req.params.paseadorId })
      .populate('usuario', 'nombre foto')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json(resenas);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;