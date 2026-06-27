const mongoose = require("mongoose");

const reservaSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    mascota: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "mascota",
      required: true,
    },
    servicio: {
      type: String,
      enum: ["Paseos"],
      default: "Paseos",
    },
    fecha: {
      type: Date,
      required: true,
    },
    direccion: {
      type: String,
      required: true,
      trim: true,
    },
    notas: {
      type: String,
      trim: true,
      default: "",
    },
    paseadorAsignado: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Paseador',
      default: null
    },
    paseadorElegidoPorCliente: {
      type: Boolean,
      default: false
    },
    estado: {
      type: String,
      enum: ["pendiente", "confirmada", "cancelada", "entregado"],
      default: "pendiente",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Reserva || mongoose.model('Reserva', reservaSchema);
