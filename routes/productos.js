const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Producto = require('../models/producto');
const { uploadProducto } = require('../config/cloudinary');
const { verificarToken, verificarAdmin } = require('../middleware/auth');

// Ruta pública: catálogo (solo productos activos)
router.get('/', async (req, res) => {
  try {
    const { categoria } = req.query;

    const filtro = { activo: true };
    if (categoria) filtro.categoria = categoria;

    const productos = await Producto.find(filtro).sort({ createdAt: -1 });
    res.status(200).json(productos);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Ruta pública: detalle de un producto
router.get('/:id', async (req, res) => {
  try {
    const producto = await Producto.findOne({ _id: req.params.id, activo: true });
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.status(200).json(producto);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Ruta admin: ver TODOS los productos (incluso inactivos)
router.get('/admin/todos', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const productos = await Producto.find().sort({ createdAt: -1 });
    res.status(200).json(productos);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Ruta admin: crear producto
router.post('/', verificarToken, verificarAdmin, uploadProducto.single('foto'), [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('descripcion').trim().notEmpty().withMessage('La descripción es obligatoria'),
  body('precio').isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
  body('categoria').isIn(['Salud e Higiene', 'Accesorios y Confort', 'Juguetes', 'Farmacia y Bienestar']).withMessage('Categoría no válida'),
  body('stock').isInt({ min: 0 }).withMessage('El stock debe ser un número entero positivo')
], async (req, res) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ message: errores.array()[0].msg });
    }

    const { nombre, descripcion, precio, categoria, stock } = req.body;
    const foto = req.file ? req.file.path : '';

    const producto = new Producto({ nombre, descripcion, precio, categoria, stock, foto });
    await producto.save();

    res.status(201).json({ message: '¡Producto creado correctamente! 📦', producto });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Ruta admin: editar producto
router.put('/:id', verificarToken, verificarAdmin, uploadProducto.single('foto'), [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('descripcion').trim().notEmpty().withMessage('La descripción es obligatoria'),
  body('precio').isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
  body('categoria').isIn(['Salud e Higiene', 'Accesorios y Confort', 'Juguetes', 'Farmacia y Bienestar']).withMessage('Categoría no válida'),
  body('stock').isInt({ min: 0 }).withMessage('El stock debe ser un número entero positivo')
], async (req, res) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ message: errores.array()[0].msg });
    }

    const producto = await Producto.findById(req.params.id);
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    producto.nombre = req.body.nombre;
    producto.descripcion = req.body.descripcion;
    producto.precio = req.body.precio;
    producto.categoria = req.body.categoria;
    producto.stock = req.body.stock;

    if (req.file) {
      producto.foto = req.file.path;
    }

    await producto.save();
    res.status(200).json({ message: '¡Producto actualizado correctamente! 📦', producto });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Ruta admin: activar/desactivar producto (soft delete)
router.patch('/:id/estado', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    producto.activo = !producto.activo;
    await producto.save();

    res.status(200).json({
      message: `Producto ${producto.activo ? 'activado' : 'desactivado'} correctamente`,
      producto
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;