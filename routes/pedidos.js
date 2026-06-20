const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Pedido = require('../models/pedido');
const CarritoItem = require('../models/carritoItem');
const Producto = require('../models/producto');
const { verificarToken, verificarAdmin } = require('../middleware/auth');

// Crear pedido desde el carrito (checkout)
router.post('/', verificarToken, [
  body('direccionEntrega').trim().notEmpty().withMessage('La dirección de entrega es obligatoria'),
  body('telefonoContacto').trim().notEmpty().withMessage('El teléfono de contacto es obligatorio')
], async (req, res) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ message: errores.array()[0].msg });
    }

    const { direccionEntrega, telefonoContacto } = req.body;

    const carritoItems = await CarritoItem.find({ usuario: req.usuario.id }).populate('producto');

    if (carritoItems.length === 0) {
      return res.status(400).json({ message: 'Tu carrito está vacío' });
    }

    // PASO 1: Validar y descontar stock de forma ATÓMICA para cada item.
    // Si cualquiera falla, revertimos lo ya descontado (compensación manual,
    // ya que MongoDB Atlas free tier no soporta transacciones multi-documento
    // en todos los casos de forma sencilla para este nivel de proyecto).
    const itemsDescontados = [];
    const itemsPedido = [];
    let total = 0;

    for (const item of carritoItems) {
      if (!item.producto || !item.producto.activo) {
        // Revertir lo ya descontado antes de fallar
        await revertirStock(itemsDescontados);
        return res.status(400).json({
          message: `El producto "${item.producto?.nombre || 'desconocido'}" ya no está disponible`
        });
      }

      const productoActualizado = await Producto.findOneAndUpdate(
        { _id: item.producto._id, stock: { $gte: item.cantidad } },
        { $inc: { stock: -item.cantidad } },
        { new: true }
      );

      if (!productoActualizado) {
        await revertirStock(itemsDescontados);
        return res.status(400).json({
          message: `No hay suficiente stock de "${item.producto.nombre}". Por favor ajusta la cantidad en tu carrito.`
        });
      }

      itemsDescontados.push({ productoId: item.producto._id, cantidad: item.cantidad });

      itemsPedido.push({
        producto: item.producto._id,
        nombreSnapshot: item.producto.nombre,
        precioSnapshot: item.producto.precio,
        cantidad: item.cantidad
      });

      total += item.producto.precio * item.cantidad;
    }

    // PASO 2: Crear el pedido con el snapshot congelado
    const pedido = new Pedido({
      usuario: req.usuario.id,
      items: itemsPedido,
      total,
      direccionEntrega,
      telefonoContacto,
      estado: 'pendiente_pago'
    });

    await pedido.save();

    // PASO 3: Vaciar el carrito ya que se convirtió en pedido
    await CarritoItem.deleteMany({ usuario: req.usuario.id });

    res.status(201).json({ message: '¡Pedido creado correctamente! 📦', pedido });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Función auxiliar: revertir stock descontado si algo falla a mitad de camino
async function revertirStock(itemsDescontados) {
  for (const item of itemsDescontados) {
    await Producto.findByIdAndUpdate(item.productoId, { $inc: { stock: item.cantidad } });
  }
}

// Ver mis pedidos
router.get('/', verificarToken, async (req, res) => {
  try {
    const pedidos = await Pedido.find({ usuario: req.usuario.id }).sort({ createdAt: -1 });
    res.status(200).json(pedidos);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Admin: ver todos los pedidos
router.get('/admin/todos', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const pedidos = await Pedido.find()
      .populate('usuario', 'nombre email')
      .sort({ createdAt: -1 });

    res.status(200).json(pedidos);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Admin: cambiar estado de un pedido
router.patch('/admin/:id/estado', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { estado } = req.body;
    const estadosValidos = ['pendiente_pago', 'pagado', 'enviado', 'entregado', 'cancelado'];

    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ message: 'Estado no válido' });
    }

    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    // Si se cancela un pedido que NO estaba ya cancelado, devolvemos el stock
    if (estado === 'cancelado' && pedido.estado !== 'cancelado') {
      for (const item of pedido.items) {
        await Producto.findByIdAndUpdate(item.producto, { $inc: { stock: item.cantidad } });
      }
    }

    pedido.estado = estado;
    await pedido.save();

    res.status(200).json({ message: `Pedido actualizado a "${estado}"`, pedido });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;