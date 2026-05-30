const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user');

router.post('/register', async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    const usuarioExiste = await User.findOne({ email });
    if (usuarioExiste) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordEncriptada = await bcrypt.hash(password, salt);

    const nuevoUsuario = new User({
      nombre,
      email,
      password: passwordEncriptada
    });

    await nuevoUsuario.save();

    res.status(201).json({ message: '¡Cuenta creada correctamente! 🎉' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;