const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const Reserva = require("../models/reserva");
const Mascota = require("../models/mascota");
const User = require("../models/user");
const { enviarConfirmacionReserva } = require("../config/mailer");

const { verificarToken, verificarAdmin } = require("../middleware/auth");

router.post(
  "/",
  verificarToken,
  [
    body("mascota").notEmpty().withMessage("Debes seleccionar una mascota"),
    body("fecha")
      .notEmpty()
      .withMessage("La fecha es obligatoria")
      .isISO8601()
      .withMessage("La fecha no tiene un formato válido"),
    body("direccion")
      .trim()
      .notEmpty()
      .withMessage("La dirección es obligatoria")
      .isLength({ min: 5 })
      .withMessage("La dirección debe tener mínimo 5 caracteres"),
  ],
  async (req, res) => {
    try {
      const errores = validationResult(req);
      if (!errores.isEmpty()) {
        return res.status(400).json({ message: errores.array()[0].msg });
      }

      const { mascota, fecha, direccion, notas, paseadorId } = req.body;

      const mascotaExiste = await Mascota.findOne({
        _id: mascota,
        usuario: req.usuario.id,
      });

      if (!mascotaExiste) {
        return res.status(404).json({ message: "Mascota no encontrada" });
      }

      const fechaReserva = new Date(fecha);
      const ahora = new Date();
      ahora.setMinutes(ahora.getMinutes() - 30);
      if (fechaReserva <= ahora) {
        return res.status(400).json({
          message: "La fecha debe ser al menos 30 minutos en el futuro",
        });
      }

      let paseadorAsignado = null;
      let paseadorElegidoPorCliente = false;

      if (paseadorId) {
        const Paseador = require('../models/paseador'); 
        const paseadorExiste = await Paseador.findOne({ _id: paseadorId, estado: 'aprobado', activo: true });

        if (!paseadorExiste) {
          return res.status(400).json({ message: 'El paseador seleccionado no está disponible' });
        }

        paseadorAsignado = paseadorExiste._id;
        paseadorElegidoPorCliente = true;
      }

      const reserva = new Reserva({
        usuario: req.usuario.id,
        mascota,
        servicio: "Paseos",
        fecha: fechaReserva,
        direccion,
        notas,
        paseadorAsignado,
        paseadorElegidoPorCliente,
      });

      await reserva.save();

      try {
        const usuario = await User.findById(req.usuario.id);
        await enviarConfirmacionReserva(
          usuario.nombre,
          usuario.email,
          mascotaExiste.nombre,
          fechaReserva,
          direccion
        );
      } catch (emailError) {
        console.error("Error al enviar email de confirmación:", emailError);
      }

      res
        .status(201)
        .json({ message: "¡Reserva creada correctamente! 🐾", reserva });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error en el servidor" });
    }
  }
);

router.get("/", verificarToken, async (req, res) => {
  try {
    const reservas = await Reserva.find({ usuario: req.usuario.id })
      .populate("mascota", "nombre foto")
      .populate("paseadorAsignado", "nombre foto calificacionPromedio")
      .sort({ fecha: 1 });

    res.status(200).json(reservas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

router.get("/admin/todas", verificarToken, verificarAdmin, async (req, res) => {
  try {
    const reservas = await Reserva.find()
      .populate("usuario", "nombre email")
      .populate("mascota", "nombre foto")
      .populate("paseadorAsignado", "nombre foto")
      .sort({ fecha: 1 });

    res.status(200).json(reservas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

router.patch('/admin/:id/paseador', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { paseadorId } = req.body;

    const reserva = await Reserva.findById(req.params.id);
    if (!reserva) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    if (paseadorId) {
      const Paseador = require('../models/paseador');
      const paseadorExiste = await Paseador.findOne({ _id: paseadorId, estado: 'aprobado', activo: true });
      if (!paseadorExiste) {
        return res.status(400).json({ message: 'El paseador seleccionado no está disponible' });
      }
      reserva.paseadorAsignado = paseadorId;
    } else {
      reserva.paseadorAsignado = null;
    }

    // Reasignar desde admin siempre se marca como decisión administrativa, no del cliente
    reserva.paseadorElegidoPorCliente = false;

    await reserva.save();

    res.status(200).json({ message: 'Paseador reasignado correctamente', reserva });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

router.patch(
  "/admin/:id/estado",
  verificarToken,
  verificarAdmin,
  async (req, res) => {
    try {
      const { estado } = req.body;

      if (!["confirmada", "cancelada"].includes(estado)) {
        return res.status(400).json({ message: "Estado no válido" });
      }

      const reserva = await Reserva.findByIdAndUpdate(
        req.params.id,
        { estado },
        { new: true }
      );

      if (!reserva) {
        return res.status(404).json({ message: "Reserva no encontrada" });
      }

      res
        .status(200)
        .json({ message: `Reserva ${estado} correctamente`, reserva });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error en el servidor" });
    }
  }
);

router.patch("/:id/cancelar", verificarToken, async (req, res) => {
  try {
    const reserva = await Reserva.findOne({
      _id: req.params.id,
      usuario: req.usuario.id,
    });

    if (!reserva) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    if (reserva.estado === "cancelada") {
      return res.status(400).json({ message: "La reserva ya está cancelada" });
    }

    if (reserva.estado === "confirmada") {
      return res
        .status(400)
        .json({ message: "No puedes cancelar una reserva ya confirmada" });
    }

    reserva.estado = "cancelada";
    await reserva.save();

    res.status(200).json({ message: "Reserva cancelada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

router.get("/stats", verificarToken, verificarAdmin, async (req, res) => {
  try {
    const totalReservas = await Reserva.countDocuments();
    const pendientes = await Reserva.countDocuments({ estado: "pendiente" });
    const confirmadas = await Reserva.countDocuments({ estado: "confirmada" });
    const canceladas = await Reserva.countDocuments({ estado: "cancelada" });

    const ingresoEstimado = confirmadas * 25000;

    res.status(200).json({
      totalReservas,
      pendientes,
      confirmadas,
      canceladas,
      ingresoEstimado,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

module.exports = router;
