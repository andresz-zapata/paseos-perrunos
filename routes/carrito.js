const express = require('express');
const router = express.Router();
const CarritoItem = require('../models/carritoItem');
const Producto = require('../models/producto');
const { verificarToken } = require('../middleware/auth');

// Ver mi carrito
router.get('/', verificarToken, async (req, res) => {
  try {
    const items = await CarritoItem.find({ usuario: req.usuario.id })
      .populate('producto', 'nombre precio foto stock activo')
      .sort({ createdAt: -1 });

    res.status(200).json(items);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Agregar producto al carrito (o sumar cantidad si ya existe)
router.post('/', verificarToken, async (req, res) => {
  try {
    const { productoId, cantidad } = req.body;

    if (!productoId || !cantidad || cantidad < 1) {
      return res.status(400).json({ message: 'Datos del carrito no válidos' });
    }

    const producto = await Producto.findOne({ _id: productoId, activo: true });
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    let item = await CarritoItem.findOne({ usuario: req.usuario.id, producto: productoId });

    const cantidadDeseada = item ? item.cantidad + cantidad : cantidad;

    if (cantidadDeseada > producto.stock) {
      return res.status(400).json({
        message: `Solo hay ${producto.stock} unidades disponibles de ${producto.nombre}`
      });
    }

    if (item) {
      item.cantidad = cantidadDeseada;
      await item.save();
    } else {
      item = new CarritoItem({ usuario: req.usuario.id, producto: productoId, cantidad });
      await item.save();
    }

    res.status(201).json({ message: '¡Producto agregado al carrito! 🛒', item });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Cambiar cantidad de un item del carrito
router.patch('/:id', verificarToken, async (req, res) => {
  try {
    const { cantidad } = req.body;

    if (!cantidad || cantidad < 1) {
      return res.status(400).json({ message: 'La cantidad debe ser mínimo 1' });
    }

    const item = await CarritoItem.findOne({ _id: req.params.id, usuario: req.usuario.id })
      .populate('producto', 'nombre stock');

    if (!item) {
      return res.status(404).json({ message: 'Item no encontrado en tu carrito' });
    }

    if (cantidad > item.producto.stock) {
      return res.status(400).json({
        message: `Solo hay ${item.producto.stock} unidades disponibles de ${item.producto.nombre}`
      });
    }

    item.cantidad = cantidad;
    await item.save();

    res.status(200).json({ message: 'Cantidad actualizada', item });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Quitar un producto del carrito
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const item = await CarritoItem.findOneAndDelete({ _id: req.params.id, usuario: req.usuario.id });

    if (!item) {
      return res.status(404).json({ message: 'Item no encontrado en tu carrito' });
    }

    res.status(200).json({ message: 'Producto eliminado del carrito' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Vaciar todo el carrito
router.delete('/', verificarToken, async (req, res) => {
  try {
    await CarritoItem.deleteMany({ usuario: req.usuario.id });
    res.status(200).json({ message: 'Carrito vaciado' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;