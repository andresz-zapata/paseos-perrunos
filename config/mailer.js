const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const enviarBienvenida = async (nombre, email) => {
  await resend.emails.send({
    from: 'Paseos Perrunos <onboarding@resend.dev>',
    to: email,
    subject: '¡Bienvenido a Paseos Perrunos! 🐾',
    html: `
      <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1f7a63; font-size: 28px;">Paseos Perrunos 🐶</h1>
        </div>
        <div style="background-color: #ffffff; border-radius: 20px; padding: 40px; box-shadow: 0px 10px 30px rgba(0,0,0,0.08);">
          <h2 style="color: #1f7a63; margin-bottom: 15px;">¡Hola ${nombre}! 👋</h2>
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
            Nos alegra tenerte en nuestra familia. En Paseos Perrunos cuidamos a tu mascota como si fuera nuestra.
          </p>
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Ya puedes registrar tus mascotas y agendar paseos desde tu perfil.
          </p>
          <div style="text-align: center;">
            <a href="https://andresz-zapata.github.io/paseos-perrunos" 
               style="background: linear-gradient(135deg, #27ae60, #1f7a63); color: white; padding: 12px 30px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Ir a mi perfil 🐾
            </a>
          </div>
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #6b7280; font-size: 13px;">© 2026 Paseos Perrunos. Todos los derechos reservados.</p>
          <p style="color: #6b7280; font-size: 13px;">paseosperrunosmedellin@gmail.com</p>
        </div>
      </div>
    `
  });
};

const enviarConfirmacionReserva = async (nombre, email, mascotaNombre, fecha, direccion) => {
  const fechaFormateada = new Date(fecha).toLocaleString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  await resend.emails.send({
    from: 'Paseos Perrunos <onboarding@resend.dev>',
    to: email,
    subject: '¡Tu reserva fue recibida! 📅',
    html: `
      <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1f7a63; font-size: 28px;">Paseos Perrunos 🐶</h1>
        </div>
        <div style="background-color: #ffffff; border-radius: 20px; padding: 40px; box-shadow: 0px 10px 30px rgba(0,0,0,0.08);">
          <h2 style="color: #1f7a63; margin-bottom: 15px;">¡Hola ${nombre}! 🐾</h2>
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Tu reserva de paseo fue recibida correctamente. Pronto te confirmaremos.
          </p>
          <div style="background-color: #f0fdf4; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
            <h3 style="color: #1f7a63; margin-bottom: 15px;">Detalles de tu reserva</h3>
            <p style="color: #6b7280; font-size: 15px; margin-bottom: 8px;">🐶 <strong>Mascota:</strong> ${mascotaNombre}</p>
            <p style="color: #6b7280; font-size: 15px; margin-bottom: 8px;">📅 <strong>Fecha:</strong> ${fechaFormateada}</p>
            <p style="color: #6b7280; font-size: 15px;">📍 <strong>Dirección:</strong> ${direccion}</p>
          </div>
          <div style="text-align: center;">
            <a href="https://andresz-zapata.github.io/paseos-perrunos/reservas.html"
               style="background: linear-gradient(135deg, #27ae60, #1f7a63); color: white; padding: 12px 30px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Ver mis reservas 📅
            </a>
          </div>
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #6b7280; font-size: 13px;">© 2026 Paseos Perrunos. Todos los derechos reservados.</p>
          <p style="color: #6b7280; font-size: 13px;">paseosperrunosmedellin@gmail.com</p>
        </div>
      </div>
    `
  });
};

module.exports = { enviarBienvenida, enviarConfirmacionReserva };