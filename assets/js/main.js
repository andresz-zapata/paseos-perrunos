console.log("JavaScript conectado correctamente 🚀");
const BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? ""
    : "https://paseos-perrunos.onrender.com";

const navbar = document.querySelector(".navbar");
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

const loginPassword = document.querySelector("#login-password");
const toggleLoginPassword = document.querySelector("#toggle-login-password");
if (loginPassword && toggleLoginPassword) {
  toggleLoginPassword.addEventListener("click", () => {
    if (loginPassword.type === "password") {
      loginPassword.type = "text";
    } else {
      loginPassword.type = "password";
    }
  });
}

const registerForm = document.querySelector("#register-form");
if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nombre = document.querySelector(
      "input[placeholder='Nombre completo']"
    ).value;
    const email = document.querySelector(
      "input[placeholder='Correo electrónico']"
    ).value;
    const password = document.querySelector("#register-password").value;
    const confirmPassword = document.querySelector("#confirm-password").value;
    const message = document.querySelector("#register-message");

    if (nombre.trim().length < 3) {
      message.textContent = "El nombre debe tener mínimo 3 caracteres";
      message.style.color = "red";
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      message.textContent = "El correo no tiene un formato válido";
      message.style.color = "red";
      return;
    }

    if (password.length < 6) {
      message.textContent = "La contraseña debe tener mínimo 6 caracteres";
      message.style.color = "red";
      return;
    }

    if (!/\d/.test(password)) {
      message.textContent = "La contraseña debe contener al menos un número";
      message.style.color = "red";
      return;
    }

    if (!/[a-zA-Z]/.test(password)) {
      message.textContent = "La contraseña debe contener al menos una letra";
      message.style.color = "red";
      return;
    }

    if (password !== confirmPassword) {
      message.textContent = "Las contraseñas no coinciden";
      message.style.color = "red";
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombre, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        message.textContent = data.message;
        message.style.color = "green";
        registerForm.reset();
        setTimeout(() => {
          message.textContent = "";
        }, 2000);
      } else {
        message.textContent = data.message;
        message.style.color = "red";
      }
    } catch (error) {
      message.textContent = "No se pudo conectar con el servidor";
      message.style.color = "red";
    }
  });
}

const loginForm = document.querySelector(".auth-form");
if (loginForm && document.querySelector("#login-password")) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.querySelector(
      "input[placeholder='Correo electrónico']"
    ).value;
    const password = document.querySelector("#login-password").value;

    const message = document.createElement("p");
    message.style.marginTop = "10px";
    message.style.fontWeight = "500";

    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        message.textContent = data.message;
        message.style.color = "green";
        loginForm.reset();

        localStorage.setItem("token", data.token);
        localStorage.setItem("nombre", data.nombre);
        localStorage.setItem("rol", data.rol);

        setTimeout(() => {
          if (data.rol === "admin") {
            window.location.href = "admin.html";
          } else {
            window.location.href = "perfil.html";
          }
        }, 1500);
      } else {
        message.textContent = data.message;
        message.style.color = "red";
      }
    } catch (error) {
      message.textContent = "No se pudo conectar con el servidor";
      message.style.color = "red";
    }

    const form = document.querySelector(".auth-form");
    const existing = form.querySelector("p.login-msg");
    if (existing) existing.remove();
    message.classList.add("login-msg");
    form.appendChild(message);
  });
}

const token = localStorage.getItem("token");
const nombre = localStorage.getItem("nombre");

// Navbar index.html
const miCuentaLink = document.querySelector(".menu a[href='login.html']");
if (miCuentaLink && token && nombre) {
  miCuentaLink.textContent = `👤 ${nombre}`;
  const rolActual = localStorage.getItem("rol");
  miCuentaLink.href = rolActual === "admin" ? "admin.html" : "perfil.html";
}

// Perfil y páginas protegidas
const perfilNombre = document.querySelector("#perfil-nombre");
const perfilEmail = document.querySelector("#perfil-email");
const nombreUsuario = document.querySelector("#nombre-usuario");
const cerrarSesion = document.querySelector("#cerrar-sesion");

if (nombreUsuario && token && nombre) {
  nombreUsuario.textContent = `👤 ${nombre}`;
}

if (perfilNombre) {
  if (!token) {
    window.location.href = "login.html";
  } else {
    perfilNombre.textContent = nombre;

    fetch(`${BASE_URL}/api/auth/perfil`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.email) {
          perfilEmail.textContent = data.email;
          nombreUsuario.textContent = `👤 ${data.nombre}`;
        }
        if (data.foto) {
          const perfilFoto = document.querySelector('#perfil-foto');
          const perfilEmoji = document.querySelector('#perfil-emoji');
          perfilFoto.src = data.foto;
          perfilFoto.style.display = 'block';
          perfilEmoji.style.display = 'none';
        }
      })
      .catch(() => {
        perfilEmail.textContent = "No se pudo cargar el correo";
      });
  }

  const fotoPerfil = document.querySelector('#foto-perfil-input');
  const fotoPerfilMessage = document.querySelector('#foto-perfil-message');

  if (fotoPerfil) {
    fotoPerfil.addEventListener('change', async () => {
      const archivo = fotoPerfil.files[0];
      if (!archivo) return;

      const formData = new FormData();
      formData.append('foto', archivo);

      fotoPerfilMessage.textContent = 'Subiendo foto...';
      fotoPerfilMessage.style.color = 'var(--gris)';

      try {
        const response = await fetch(`${BASE_URL}/api/auth/foto`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const data = await response.json();

        if (response.ok) {
          const perfilFoto = document.querySelector('#perfil-foto');
          const perfilEmoji = document.querySelector('#perfil-emoji');
          perfilFoto.src = data.foto;
          perfilFoto.style.display = 'block';
          perfilEmoji.style.display = 'none';
          fotoPerfilMessage.textContent = data.message;
          fotoPerfilMessage.style.color = 'green';
          setTimeout(() => {
            fotoPerfilMessage.textContent = '';
          }, 3000);
        } else {
          fotoPerfilMessage.textContent = data.message;
          fotoPerfilMessage.style.color = 'red';
        }

      } catch (error) {
        fotoPerfilMessage.textContent = 'No se pudo conectar con el servidor';
        fotoPerfilMessage.style.color = 'red';
      }
    });
  }
}

if (cerrarSesion) {
  cerrarSesion.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("nombre");
    localStorage.removeItem("rol");
    window.location.href = "login.html";
  });
}

const menuToggle = document.querySelector("#menu-toggle");
const menu = document.querySelector(".menu");

if (menuToggle && menu) {
  menuToggle.addEventListener("click", () => {
    menu.classList.toggle("open");
    menuToggle.textContent = menu.classList.contains("open") ? "✕" : "☰";
  });

  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && !menuToggle.contains(e.target)) {
      menu.classList.remove("open");
      menuToggle.textContent = "☰";
    }
  });
}

// Mascotas
const mascotaForm = document.querySelector("#mascota-form");
const btnAgregar = document.querySelector("#btn-agregar");
const formularioMascota = document.querySelector("#formulario-mascota");
const mascotasLista = document.querySelector("#mascotas-lista");
const mascotasEmpty = document.querySelector("#mascotas-empty");

if (mascotaForm) {
  if (!token) {
    window.location.href = "login.html";
  }

  btnAgregar.addEventListener("click", () => {
    if (formularioMascota.style.display === "none") {
      formularioMascota.style.display = "block";
      btnAgregar.textContent = "− Cancelar";
    } else {
      formularioMascota.style.display = "none";
      btnAgregar.textContent = "+ Agregar mascota";
    }
  });

  const cargarMascotas = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/mascotas`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const mascotas = await response.json();

      if (mascotas.length === 0) {
        mascotasEmpty.style.display = "block";
        return;
      }

      mascotasEmpty.style.display = "none";
      mascotasLista.innerHTML = "";

      mascotas.forEach((mascota) => {
        const card = document.createElement("div");
        card.classList.add("mascota-card");

        const fotoHTML = mascota.foto
          ? `<div class="mascota-foto"><img src="${mascota.foto}" alt="${mascota.nombre}" /></div>`
          : `<div class="mascota-foto">🐶</div>`;

        card.innerHTML = `
          ${fotoHTML}
          <div class="mascota-info">
            <h3>${mascota.nombre}</h3>
            <p>🐾 Raza: ${mascota.raza}</p>
            <p>🎂 Edad: ${mascota.edad} año${mascota.edad === 1 ? "" : "s"}</p>
            ${mascota.notas ? `<p>📝 ${mascota.notas}</p>` : ""}
          </div>
        `;

        mascotasLista.appendChild(card);
      });
    } catch (error) {
      console.error("Error al cargar mascotas:", error);
    }
  };

  cargarMascotas();

  const mascotaFotoInput = document.querySelector('#mascota-foto');
  const btnQuitarFoto = document.querySelector('#btn-quitar-foto');
  const fotoNombre = document.querySelector('#foto-nombre');

  if (mascotaFotoInput) {
    mascotaFotoInput.addEventListener('change', () => {
      if (mascotaFotoInput.files[0]) {
        fotoNombre.textContent = mascotaFotoInput.files[0].name;
        btnQuitarFoto.style.display = 'flex';
      }
    });

    btnQuitarFoto.addEventListener('click', () => {
      mascotaFotoInput.value = '';
      fotoNombre.textContent = '';
      btnQuitarFoto.style.display = 'none';
    });
  }

  mascotaForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const message = document.querySelector("#mascota-message");
    const formData = new FormData();

    formData.append("nombre", document.querySelector("#mascota-nombre").value);
    formData.append("raza", document.querySelector("#mascota-raza").value);
    formData.append("edad", document.querySelector("#mascota-edad").value);
    formData.append("notas", document.querySelector("#mascota-notas").value);

    const fotoInput = document.querySelector("#mascota-foto");
    const foto = fotoInput.files[0];
    if (foto) {
      formData.append("foto", foto);
    }

    try {
      message.textContent = `URL: ${BASE_URL} | Host: ${window.location.hostname}`;
      message.style.color = 'var(--gris)';

      await new Promise(resolve => setTimeout(resolve, 2000));

      message.textContent = 'Subiendo mascota...';
      message.style.color = 'var(--gris)';

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch(`${BASE_URL}/api/mascotas`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (response.ok) {
        message.textContent = data.message;
        message.style.color = "green";
        mascotaForm.reset();
        formularioMascota.style.display = "none";
        btnAgregar.textContent = "+ Agregar mascota";
        fotoInput.value = '';
        document.querySelector('#btn-quitar-foto').style.display = 'none';
        document.querySelector('#foto-nombre').textContent = '';
        cargarMascotas();
      } else {
        message.textContent = data.message;
        message.style.color = "red";
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        message.textContent = 'Timeout: el servidor tardó demasiado';
      } else {
        message.textContent = `Error: ${error.message} | Tipo: ${error.name}`;
      }
      message.style.color = "red";
    }
  });
}

// Reservas
const reservaForm = document.querySelector("#reserva-form");
const btnNuevaReserva = document.querySelector("#btn-nueva-reserva");
const formularioReserva = document.querySelector("#formulario-reserva");
const reservasLista = document.querySelector("#reservas-lista");
const reservasEmpty = document.querySelector("#reservas-empty");

if (reservaForm) {
  if (!token) {
    window.location.href = "login.html";
  }

  const fechaInput = document.querySelector("#reserva-fecha");
  const ahora = new Date();
  ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset());
  fechaInput.min = ahora.toISOString().slice(0, 16);

  btnNuevaReserva.addEventListener("click", () => {
    if (formularioReserva.style.display === "none") {
      formularioReserva.style.display = "block";
      btnNuevaReserva.textContent = "− Cancelar";
    } else {
      formularioReserva.style.display = "none";
      btnNuevaReserva.textContent = "+ Nueva reserva";
    }
  });

  const cargarMascotasSelect = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/mascotas`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const mascotas = await response.json();
      const select = document.querySelector("#reserva-mascota");

      if (mascotas.length === 0) {
        select.innerHTML =
          '<option value="">No tienes mascotas registradas</option>';
        return;
      }

      select.innerHTML = '<option value="">Selecciona una mascota</option>';
      mascotas.forEach((mascota) => {
        const option = document.createElement("option");
        option.value = mascota._id;
        option.textContent = `${mascota.nombre} (${mascota.raza})`;
        select.appendChild(option);
      });
    } catch (error) {
      console.error("Error al cargar mascotas:", error);
    }
  };

  cargarMascotasSelect();

  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString("es-CO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const cargarReservas = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/reservas`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const reservas = await response.json();

      if (reservas.length === 0) {
        reservasEmpty.style.display = "block";
        return;
      }

      reservasEmpty.style.display = "none";
      reservasLista.innerHTML = "";

      reservas.forEach((reserva) => {
        const card = document.createElement("div");
        card.classList.add("reserva-card");

        const badgeClase = `badge-estado badge-${reserva.estado}`;
        const mostrarCancelar = reserva.estado === "pendiente";

        card.innerHTML = `
          <div class="reserva-info">
            <h3>🐾 Paseo de ${reserva.mascota.nombre}</h3>
            <p>📅 ${formatearFecha(reserva.fecha)}</p>
            <p>📍 ${reserva.direccion}</p>
            ${reserva.notas ? `<p>📝 ${reserva.notas}</p>` : ""}
          </div>
          <div class="reserva-acciones">
            <span class="${badgeClase}">${reserva.estado}</span>
            ${
              mostrarCancelar
                ? `<button class="btn-cancelar" data-id="${reserva._id}">Cancelar</button>`
                : ""
            }
          </div>
        `;

        reservasLista.appendChild(card);
      });

      document.querySelectorAll(".btn-cancelar").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.dataset.id;

          try {
            const response = await fetch(
              `${BASE_URL}/api/reservas/${id}/cancelar`,
              {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            const data = await response.json();

            if (response.ok) {
              cargarReservas();
            } else {
              alert(data.message);
            }
          } catch (error) {
            alert("No se pudo cancelar la reserva");
          }
        });
      });
    } catch (error) {
      console.error("Error al cargar reservas:", error);
    }
  };

  cargarReservas();

  reservaForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const message = document.querySelector("#reserva-message");
    const mascota = document.querySelector("#reserva-mascota").value;
    const fecha = document.querySelector("#reserva-fecha").value;
    const direccion = document.querySelector("#reserva-direccion").value;
    const notas = document.querySelector("#reserva-notas").value;

    if (!mascota) {
      message.textContent = "Debes seleccionar una mascota";
      message.style.color = "red";
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/reservas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mascota, fecha, direccion, notas }),
      });

      const data = await response.json();

      if (response.ok) {
        message.textContent = data.message;
        message.style.color = "green";
        reservaForm.reset();
        formularioReserva.style.display = "none";
        btnNuevaReserva.textContent = "+ Nueva reserva";
        cargarReservas();
        setTimeout(() => {
          message.textContent = "";
        }, 3000);
      } else {
        message.textContent = data.message;
        message.style.color = "red";
      }
    } catch (error) {
      message.textContent = "No se pudo conectar con el servidor";
      message.style.color = "red";
    }
  });
}

// Admin
const adminLista = document.querySelector("#admin-lista");
const adminEmpty = document.querySelector("#admin-empty");
const rol = localStorage.getItem("rol");

if (adminLista) {
  if (!token || rol !== "admin") {
    window.location.href = "login.html";
  }

  if (nombreUsuario && token && nombre) {
    nombreUsuario.textContent = `👤 ${nombre}`;
  }

  let todasLasReservas = [];
  let filtroActual = "todas";

  const formatearFechaAdmin = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString("es-CO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderizarReservas = (reservas) => {
    adminLista.innerHTML = "";

    if (reservas.length === 0) {
      adminLista.innerHTML =
        '<p class="reservas-empty">No hay reservas en esta categoría.</p>';
      return;
    }

    reservas.forEach((reserva) => {
      const card = document.createElement("div");
      card.classList.add("admin-card");

      const badgeClase = `badge-estado badge-${reserva.estado}`;
      const esPendiente = reserva.estado === "pendiente";

      card.innerHTML = `
        <div class="admin-card-info">
          <h3>🐾 Paseo de ${reserva.mascota.nombre}</h3>
          <p>👤 Cliente: ${reserva.usuario.nombre} (${
        reserva.usuario.email
      })</p>
          <p>📅 ${formatearFechaAdmin(reserva.fecha)}</p>
          <p>📍 ${reserva.direccion}</p>
          ${reserva.notas ? `<p>📝 ${reserva.notas}</p>` : ""}
        </div>
        <div class="admin-card-acciones">
          <span class="${badgeClase}">${reserva.estado}</span>
          ${
            esPendiente
              ? `
            <button class="btn-confirmar" data-id="${reserva._id}" data-accion="confirmada">Confirmar</button>
            <button class="btn-cancelar-admin" data-id="${reserva._id}" data-accion="cancelada">Cancelar</button>
          `
              : ""
          }
        </div>
      `;

      adminLista.appendChild(card);
    });

    document
      .querySelectorAll(".btn-confirmar, .btn-cancelar-admin")
      .forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.dataset.id;
          const estado = btn.dataset.accion;

          try {
            const response = await fetch(
              `${BASE_URL}/api/reservas/admin/${id}/estado`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ estado }),
              }
            );

            const data = await response.json();

            if (response.ok) {
              cargarTodasLasReservas();
            } else {
              alert(data.message);
            }
          } catch (error) {
            alert("No se pudo actualizar la reserva");
          }
        });
      });
  };

  const cargarTodasLasReservas = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/reservas/admin/todas`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("nombre");
        localStorage.removeItem("rol");
        window.location.href = "login.html";
        return;
      }

      if (!response.ok) {
        adminLista.innerHTML =
          '<p class="reservas-empty">Error al cargar las reservas. Intenta de nuevo.</p>';
        return;
      }

      todasLasReservas = data;
      aplicarFiltro(filtroActual);
    } catch (error) {
      console.error("Error al cargar reservas:", error);
      adminLista.innerHTML =
        '<p class="reservas-empty">No se pudo conectar con el servidor.</p>';
    }
  };

  const aplicarFiltro = (filtro) => {
    filtroActual = filtro;
    const filtradas =
      filtro === "todas"
        ? todasLasReservas
        : todasLasReservas.filter((r) => r.estado === filtro);
    renderizarReservas(filtradas);
  };

  document.querySelectorAll(".filtro-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".filtro-btn")
        .forEach((b) => b.classList.remove("filtro-activo"));
      btn.classList.add("filtro-activo");
      aplicarFiltro(btn.dataset.filtro);
    });
  });

  cargarTodasLasReservas();
}