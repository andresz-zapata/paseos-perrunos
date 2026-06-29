const express = require('express');
const router = express.Router();
const Reserva = require('../models/reserva');
const Paseador = require('../models/paseador');
const { verificarToken } = require('../middleware/auth');

// Middleware: verifica que el usuario logueado sea un paseador y resuelve su perfil de Paseador
const verificarPaseador = async (req, res, next) => {
  if (req.usuario.rol !== 'paseador') {
    return res.status(403).json({ message: 'Acceso denegado, se requiere rol de paseador' });
  }

  const paseador = await Paseador.findOne({ usuario: req.usuario.id });
  if (!paseador) {
    return res.status(404).json({ message: 'No se encontró tu perfil de paseador' });
  }

  if (!paseador.activo) {
    return res.status(403).json({ message: 'Tu perfil de paseador está desactivado. Contacta al administrador.' });
  }

  req.paseador = paseador;
  next();
};

// Ver mi perfil de paseador (datos operativos + estadísticas)
router.get('/mi-perfil', verificarToken, verificarPaseador, async (req, res) => {
  try {
    res.status(200).json(req.paseador);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Ver mis paseos asignados
router.get('/mis-paseos', verificarToken, verificarPaseador, async (req, res) => {
  try {
    const reservas = await Reserva.find({ paseadorAsignado: req.paseador._id })
      .populate('usuario', 'nombre email')
      .populate('mascota', 'nombre foto')
      .sort({ fecha: 1 });

    res.status(200).json(reservas);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Marcar un paseo como completado
router.patch('/mis-paseos/:id/completar', verificarToken, verificarPaseador, async (req, res) => {
  try {
    const reserva = await Reserva.findOne({
      _id: req.params.id,
      paseadorAsignado: req.paseador._id
    });

    if (!reserva) {
      return res.status(404).json({ message: 'Paseo no encontrado o no asignado a ti' });
    }

    if (reserva.estado !== 'confirmada') {
      return res.status(400).json({ message: 'Solo puedes completar paseos que estén confirmados' });
    }

    reserva.estado = 'entregado';
    await reserva.save();

    req.paseador.totalPaseos += 1;
    await req.paseador.save();

    res.status(200).json({ message: '¡Paseo marcado como completado! 🐾', reserva });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;