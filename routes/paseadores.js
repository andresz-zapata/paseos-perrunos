const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Paseador = require('../models/Paseador');
const { uploadPaseador } = require('../config/cloudinary');
const { verificarToken, verificarAdmin } = require('../middleware/auth');

// Pública: listar paseadores aprobados y activos (para el modal en paseos.html)
router.get('/', async (req, res) => {
  try {
    const paseadores = await Paseador.find({ estado: 'aprobado', activo: true })
      .select('-email -telefono -origen')
      .sort({ totalPaseos: -1 });

    res.status(200).json(paseadores);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Pública: solicitud para ser paseador (formulario en paseos.html)
router.post('/solicitud', [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('email').trim().isEmail().withMessage('El correo no tiene un formato válido'),
  body('telefono').trim().notEmpty().withMessage('El teléfono es obligatorio'),
  body('zonaCobertura').trim().notEmpty().withMessage('La zona de cobertura es obligatoria'),
  body('especialidad').trim().notEmpty().withMessage('La especialidad es obligatoria'),
  body('experiencia').trim().notEmpty().withMessage('La experiencia es obligatoria'),
  body('descripcion').trim().notEmpty().withMessage('La descripción es obligatoria')
], async (req, res) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ message: errores.array()[0].msg });
    }

    const { nombre, email, telefono, zonaCobertura, especialidad, experiencia, descripcion } = req.body;

    const solicitudExiste = await Paseador.findOne({ email, estado: 'pendiente' });
    if (solicitudExiste) {
      return res.status(400).json({ message: 'Ya existe una solicitud pendiente con ese correo' });
    }

    const paseador = new Paseador({
      nombre, email, telefono, zonaCobertura, especialidad, experiencia, descripcion,
      estado: 'pendiente',
      origen: 'solicitud'
    });

    await paseador.save();

    res.status(201).json({ message: '¡Solicitud enviada correctamente! Te contactaremos pronto. 🐾' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Admin: ver TODOS los paseadores (cualquier estado)
router.get('/admin/todos', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const paseadores = await Paseador.find()
      .populate('usuario', 'nombre email')
      .sort({ createdAt: -1 });

    res.status(200).json(paseadores);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Admin: crear paseador directamente (ya aprobado)
router.post('/', verificarToken, verificarAdmin, uploadPaseador.single('foto'), [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('zonaCobertura').trim().notEmpty().withMessage('La zona de cobertura es obligatoria'),
  body('especialidad').trim().notEmpty().withMessage('La especialidad es obligatoria'),
  body('experiencia').trim().notEmpty().withMessage('La experiencia es obligatoria'),
  body('descripcion').trim().notEmpty().withMessage('La descripción es obligatoria')
], async (req, res) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ message: errores.array()[0].msg });
    }

    const { nombre, email, telefono, zonaCobertura, especialidad, experiencia, descripcion } = req.body;
    const foto = req.file ? req.file.path : '';

    const paseador = new Paseador({
      nombre, email, telefono, zonaCobertura, especialidad, experiencia, descripcion, foto,
      estado: 'aprobado',
      origen: 'admin'
    });

    await paseador.save();

    res.status(201).json({ message: '¡Paseador creado correctamente! 🐾', paseador });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Admin: editar paseador
router.put('/:id', verificarToken, verificarAdmin, uploadPaseador.single('foto'), [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('zonaCobertura').trim().notEmpty().withMessage('La zona de cobertura es obligatoria'),
  body('especialidad').trim().notEmpty().withMessage('La especialidad es obligatoria'),
  body('experiencia').trim().notEmpty().withMessage('La experiencia es obligatoria'),
  body('descripcion').trim().notEmpty().withMessage('La descripción es obligatoria')
], async (req, res) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ message: errores.array()[0].msg });
    }

    const paseador = await Paseador.findById(req.params.id);
    if (!paseador) {
      return res.status(404).json({ message: 'Paseador no encontrado' });
    }

    paseador.nombre = req.body.nombre;
    paseador.email = req.body.email || paseador.email;
    paseador.telefono = req.body.telefono || paseador.telefono;
    paseador.zonaCobertura = req.body.zonaCobertura;
    paseador.especialidad = req.body.especialidad;
    paseador.experiencia = req.body.experiencia;
    paseador.descripcion = req.body.descripcion;

    if (req.file) {
      paseador.foto = req.file.path;
    }

    await paseador.save();
    res.status(200).json({ message: '¡Paseador actualizado correctamente! 🐾', paseador });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Admin: aprobar o rechazar una solicitud
router.patch('/:id/revision', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { estado } = req.body;

    if (!['aprobado', 'rechazado'].includes(estado)) {
      return res.status(400).json({ message: 'Estado de revisión no válido' });
    }

    const paseador = await Paseador.findById(req.params.id);
    if (!paseador) {
      return res.status(404).json({ message: 'Paseador no encontrado' });
    }

    if (paseador.estado !== 'pendiente') {
      return res.status(400).json({ message: 'Esta solicitud ya fue revisada' });
    }

    paseador.estado = estado;
    await paseador.save();

    res.status(200).json({ message: `Solicitud ${estado} correctamente`, paseador });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Admin: activar/desactivar un paseador ya aprobado (soft-delete operativo)
router.patch('/:id/estado', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const paseador = await Paseador.findById(req.params.id);
    if (!paseador) {
      return res.status(404).json({ message: 'Paseador no encontrado' });
    }

    paseador.activo = !paseador.activo;
    await paseador.save();

    res.status(200).json({
      message: `Paseador ${paseador.activo ? 'activado' : 'desactivado'} correctamente`,
      paseador
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;