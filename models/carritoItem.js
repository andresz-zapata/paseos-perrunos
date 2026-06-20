const mongoose = require('mongoose');

const carritoItemSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
    required: true
  },
  cantidad: {
    type: Number,
    required: true,
    min: 1
  }
}, {
  timestamps: true
});

// Un usuario no puede tener el mismo producto duplicado en dos documentos distintos
carritoItemSchema.index({ usuario: 1, producto: 1 }, { unique: true });

module.exports = mongoose.model('CarritoItem', carritoItemSchema);