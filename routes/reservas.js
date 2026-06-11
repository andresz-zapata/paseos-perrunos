const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const Reserva = require("../models/reserva");
const Mascota = require("../models/mascota");
const User = require("../models/user");
const { enviarConfirmacionReserva } = require("../config/mailer");

const { verificarToken, verificarAdmin } = require('../middleware/auth');

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

      const { mascota, fecha, direccion, notas } = req.body;

      const mascotaExiste = await Mascota.findOne({
        _id: mascota,
        usuario: req.usuario.id,
      });

      if (!mascotaExiste) {
        return res.status(404).json({ message: "Mascota no encontrada" });
      }

      const fechaReserva = new Date(fecha);
      if (fechaReserva <= new Date()) {
        return res.status(400).json({ message: "La fecha debe ser futura" });
      }

      const reserva = new Reserva({
        usuario: req.usuario.id,
        mascota,
        servicio: "Paseos",
        fecha: fechaReserva,
        direccion,
        notas,
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
      .sort({ fecha: 1 });

    res.status(200).json(reservas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
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

module.exports = router;
