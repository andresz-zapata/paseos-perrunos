const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: {
    type: String,
    required: true,
    trim: true
  },
  precio: {
    type: Number,
    required: true,
    min: 0
  },
  categoria: {
    type: String,
    required: true,
    enum: ['Salud e Higiene', 'Accesorios y Confort', 'Juguetes', 'Farmacia y Bienestar']
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  foto: {
    type: String,
    default: ''
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Producto', productoSchema);