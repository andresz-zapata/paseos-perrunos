const mongoose = require('mongoose');

const pedidoItemSchema = new mongoose.Schema({
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
    required: true
  },
  nombreSnapshot: {
    type: String,
    required: true
  },
  precioSnapshot: {
    type: Number,
    required: true
  },
  cantidad: {
    type: Number,
    required: true,
    min: 1
  }
});

const pedidoSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  items: [pedidoItemSchema],
  total: {
    type: Number,
    required: true
  },
  direccionEntrega: {
    type: String,
    required: true,
    trim: true
  },
  telefonoContacto: {
    type: String,
    required: true,
    trim: true
  },
  estado: {
    type: String,
    enum: ['pendiente_pago', 'pagado', 'enviado', 'entregado', 'cancelado'],
    default: 'pendiente_pago'
  },
  wompiTransactionId: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Pedido', pedidoSchema);