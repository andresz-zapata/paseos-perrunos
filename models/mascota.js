const mongoose = require("mongoose");

const mascotaSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    raza: {
      type: String,
      required: true,
      trim: true,
    },
    edad: {
      type: Number,
      required: true,
      min: 0,
      max: 30,
    },
    // AGREGAR ESTA PROPIEDAD DENTRO DEL SCHEMA DE MASCOTA:
genero: {
  type: String,
  required: [true, 'El género de la mascota es obligatorio'],
  default: "macho",
  enum: {
    values: ['macho', 'hembra'],
    message: '{VALUE} no es un género válido (debe ser macho o hembra)'
  }
},
    foto: {
      type: String,
      default: "",
    },
    notas: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("mascota", mascotaSchema);
