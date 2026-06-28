const mongoose = require('mongoose');

const resenaSchema = new mongoose.Schema({
  reserva: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reserva',
    required: true,
    unique: true
  },
  paseador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paseador',
    required: true
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  estrellas: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comentario: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Resena || mongoose.model('Resena', resenaSchema);