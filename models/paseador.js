const mongoose = require('mongoose');

const paseadorSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    default: null
  },
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },
  telefono: {
    type: String,
    trim: true,
    default: ''
  },
  foto: {
    type: String,
    default: ''
  },
  zonaCobertura: {
    type: String,
    required: true,
    trim: true
  },
  especialidad: {
    type: String,
    required: true,
    trim: true
  },
  experiencia: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: {
    type: String,
    required: true,
    trim: true
  },
  estado: {
    type: String,
    enum: ['pendiente', 'aprobado', 'rechazado'],
    default: 'pendiente'
  },
  activo: {
    type: Boolean,
    default: true
  },
  origen: {
    type: String,
    enum: ['admin', 'solicitud'],
    required: true
  },
  calificacionPromedio: {
    type: Number,
    default: 5.0,
    min: 0,
    max: 5
  },
  totalResenas: {
    type: Number,
    default: 0
  },
  totalPaseos: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Paseador', paseadorSchema);