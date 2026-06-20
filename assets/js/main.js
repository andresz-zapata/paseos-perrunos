console.log("JavaScript conectado correctamente 🚀");

// Toast notifications
const toastContainer = document.createElement("div");
toastContainer.classList.add("toast-container");
document.body.appendChild(toastContainer);

const showToast = (mensaje, tipo = "success", duracion = 3000) => {
  const toast = document.createElement("div");
  toast.classList.add("toast", `toast-${tipo}`);
  toast.textContent = mensaje;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast-saliendo");
    setTimeout(() => toast.remove(), 300);
  }, duracion);
};

// Refresh token automático
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    window.location.href = "login.html";
    return null;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      return data.token;
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("nombre");
      localStorage.removeItem("rol");
      localStorage.removeItem("refreshToken");
      window.location.href = "login.html";
      return null;
    }
  } catch (error) {
    console.error("Error al renovar token:", error);
    return null;
  }
};

const fetchConRefresh = async (url, opciones = {}) => {
  let tokenActual = localStorage.getItem("token");
  opciones.headers = opciones.headers || {};
  opciones.headers["Authorization"] = `Bearer ${tokenActual}`;

  let response = await fetch(url, opciones);

  if (response.status === 401) {
    const nuevoToken = await refreshAccessToken();
    if (!nuevoToken) return null;

    opciones.headers["Authorization"] = `Bearer ${nuevoToken}`;
    response = await fetch(url, opciones);
  }

  return response;
};

// Modal de confirmación
const showModal = ({
  emoji,
  titulo,
  texto,
  textoBtnConfirmar,
  onConfirmar,
}) => {
  const overlay = document.createElement("div");
  overlay.classList.add("modal-overlay");

  overlay.innerHTML = `
    <div class="modal-card">
      <div class="modal-emoji">${emoji}</div>
      <h3 class="modal-titulo">${titulo}</h3>
      <p class="modal-texto">${texto}</p>
      <div class="modal-botones">
        <button class="modal-btn-cancelar">Cancelar</button>
        <button class="modal-btn-eliminar">${textoBtnConfirmar}</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.querySelector(".modal-btn-cancelar").addEventListener("click", () => {
    overlay.remove();
  });

  overlay.querySelector(".modal-btn-eliminar").addEventListener("click", () => {
    overlay.remove();
    onConfirmar();
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });
};

// Modo oscuro
const aplicarModoOscuro = (activo) => {
  if (activo) {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
};

const modoGuardado = localStorage.getItem("darkMode") === "true";
aplicarModoOscuro(modoGuardado);

const toggleDarkMode = () => {
  const activo = document.body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", activo);
  document.querySelectorAll(".btn-dark-mode").forEach((btn) => {
    btn.textContent = activo ? "☀️" : "🌙";
  });
};

document.querySelectorAll(".btn-dark-mode").forEach((btn) => {
  btn.textContent = modoGuardado ? "☀️" : "🌙";
  btn.addEventListener("click", toggleDarkMode);
});

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
    loginPassword.type =
      loginPassword.type === "password" ? "text" : "password";
  });
}

const registerPassword = document.querySelector("#register-password");
const toggleRegisterPassword = document.querySelector(
  "#toggle-register-password"
);
if (registerPassword && toggleRegisterPassword) {
  toggleRegisterPassword.addEventListener("click", () => {
    registerPassword.type =
      registerPassword.type === "password" ? "text" : "password";
  });
}

const confirmPassword = document.querySelector("#confirm-password");
const toggleConfirmPassword = document.querySelector(
  "#toggle-confirm-password"
);
if (confirmPassword && toggleConfirmPassword) {
  toggleConfirmPassword.addEventListener("click", () => {
    confirmPassword.type =
      confirmPassword.type === "password" ? "text" : "password";
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

    message.textContent = "";

    if (password !== confirmPassword) {
      message.textContent = "Las contraseñas no coinciden";
      message.style.color = "red";
      return;
    }

    registerForm.querySelectorAll("input").forEach((input) => {
      input.addEventListener("input", () => {
        message.textContent = "";
      });
    });

    const btnRegistro = registerForm.querySelector('button[type="submit"]');
    btnRegistro.disabled = true;
    btnRegistro.textContent = "Creando cuenta...";

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombre, email, password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (response.ok) {
        showToast(data.message, "success");
        registerForm.reset();
      } else {
        showToast(data.message, "error");
      }
      btnRegistro.disabled = false;
      btnRegistro.textContent = "Crear cuenta";
    } catch (error) {
      if (error.name === "AbortError") {
        showToast(
          "El servidor tardó demasiado, pero tu cuenta puede haberse creado. Intenta iniciar sesión.",
          "info",
          6000
        );
      } else {
        showToast("No se pudo conectar con el servidor", "error");
      }
      btnRegistro.disabled = false;
      btnRegistro.textContent = "Crear cuenta";
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

    const btnLogin = loginForm.querySelector('button[type="submit"]');
    btnLogin.disabled = true;
    btnLogin.textContent = "Entrando...";

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
        showToast(data.message, "success");
        loginForm.reset();

        localStorage.setItem("token", data.token);
        localStorage.setItem("nombre", data.nombre);
        localStorage.setItem("rol", data.rol);
        localStorage.setItem("refreshToken", data.refreshToken);

        setTimeout(() => {
          if (data.rol === "admin") {
            window.location.replace("admin.html");
          } else {
            window.location.replace("perfil.html");
          }
        }, 1500);
      } else {
        showToast(data.message, "error");
        btnLogin.disabled = false;
        btnLogin.textContent = "Entrar";
      }
    } catch (error) {
      showToast("No se pudo conectar con el servidor", "error");
      btnLogin.disabled = false;
      btnLogin.textContent = "Entrar";
    }

    const form = document.querySelector(".auth-form");
    const existing = form.querySelector("p.login-msg");
    if (existing) existing.remove();
    message.classList.add("login-msg");
    form.appendChild(message);
  });
}

// Componente User Pill (reutilizable en todas las páginas)
const inicializarUserPill = () => {
  const zona = document.querySelector('#navbar-usuario-zona');
  const menuPrincipal = document.querySelector('#menu-principal');
  const pillBtn = document.querySelector('#user-pill-btn');
  const pillMenu = document.querySelector('#user-pill-menu');
  const pillFlecha = document.querySelector('.user-pill-flecha');
  const pillNombre = document.querySelector('#user-pill-nombre');
  const pillAvatar = document.querySelector('#user-pill-avatar');
  const pillLogout = document.querySelector('#user-pill-logout');

  if (!zona) return;

  const tok = localStorage.getItem('token');
  const nom = localStorage.getItem('nombre');

  const navbarSinSesion = document.querySelector('#navbar-sin-sesion');

  if (!tok || !nom) {
    if (navbarSinSesion) navbarSinSesion.style.display = 'flex';
    return;
  }

  if (navbarSinSesion) navbarSinSesion.style.display = 'none';

  zona.style.display = 'flex';
  if (menuPrincipal) menuPrincipal.style.display = 'none';

  pillNombre.textContent = nom;
  pillAvatar.textContent = nom.charAt(0).toUpperCase();

  fetch(`${BASE_URL}/api/auth/perfil`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${tok}` }
  })
    .then(res => res.json())
    .then(data => {
      if (data.foto) {
        pillAvatar.innerHTML = `<img src="${data.foto}" alt="${nom}" />`;
      }
    })
    .catch(() => {});

  pillBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const abierto = pillMenu.classList.contains('abierto');
    pillMenu.classList.toggle('abierto', !abierto);
    pillFlecha.classList.toggle('abierto', !abierto);
  });

  document.addEventListener('click', () => {
    pillMenu.classList.remove('abierto');
    pillFlecha.classList.remove('abierto');
  });

  if (pillLogout) {
    pillLogout.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await fetch(`${BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${tok}` }
        });
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
      }
      localStorage.removeItem('token');
      localStorage.removeItem('nombre');
      localStorage.removeItem('rol');
      localStorage.removeItem('refreshToken');
      window.location.replace('login.html');
    });
  }
};

inicializarUserPill();

const token = localStorage.getItem("token");
const nombre = localStorage.getItem("nombre");

// Navbar index.html
const miCuentaLink = document.querySelector(".menu a[href='login.html']");
if (miCuentaLink) {
  if (token && nombre) {
    const rolActual = localStorage.getItem("rol");
    miCuentaLink.href = rolActual === "admin" ? "admin.html" : "perfil.html";
    miCuentaLink.textContent = `👤 ${nombre}`;
  }
}

// Perfil y páginas protegidas
const perfilNombre = document.querySelector("#perfil-nombre");
const perfilEmail = document.querySelector("#perfil-email");

if (perfilNombre) {
  if (!token) {
    window.location.replace("login.html");
  } else {
    perfilNombre.textContent = nombre;

    fetchConRefresh(`${BASE_URL}/api/auth/perfil`, {
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.email) {
          perfilEmail.textContent = data.email;
          nombreUsuario.textContent = `👤 ${data.nombre}`;
        }
        if (data.foto) {
          const perfilFoto = document.querySelector("#perfil-foto");
          const perfilEmoji = document.querySelector("#perfil-emoji");
          perfilFoto.src = data.foto;
          perfilFoto.style.display = "block";
          perfilEmoji.style.display = "none";
        }
      })
      .catch(() => {
        perfilEmail.textContent = "No se pudo cargar el correo";
      });
  }

  const fotoPerfil = document.querySelector("#foto-perfil-input");
  const fotoPerfilMessage = document.querySelector("#foto-perfil-message");

  if (fotoPerfil) {
    fotoPerfil.addEventListener("change", async () => {
      const archivo = fotoPerfil.files[0];
      if (!archivo) return;

      const formData = new FormData();
      formData.append("foto", archivo);

      fotoPerfilMessage.textContent = "Subiendo foto...";
      fotoPerfilMessage.style.color = "var(--gris)";

      try {
        const response = await fetch(`${BASE_URL}/api/auth/foto`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          const perfilFoto = document.querySelector("#perfil-foto");
          const perfilEmoji = document.querySelector("#perfil-emoji");
          perfilFoto.src = data.foto;
          perfilFoto.style.display = "block";
          perfilEmoji.style.display = "none";
          showToast(data.message, "success");
        } else {
          showToast(data.message, "error");
        }
      } catch (error) {
        fotoPerfilMessage.textContent = "No se pudo conectar con el servidor";
        fotoPerfilMessage.style.color = "red";
      }
    });
  }
}

// Tabs de configuración de perfil
document.querySelectorAll('.config-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.config-tab-btn').forEach(b => b.classList.remove('config-tab-activo'));
    btn.classList.add('config-tab-activo');

    const tab = btn.dataset.configTab;
    document.querySelector('#config-panel-general').style.display = tab === 'general' ? 'block' : 'none';
    document.querySelector('#config-panel-seguridad').style.display = tab === 'seguridad' ? 'block' : 'none';
  });
});

// Toggle contraseñas editar perfil
const togglePasswordActual = document.querySelector("#toggle-password-actual");
const passwordActualInput = document.querySelector(
  "#editar-perfil-password-actual"
);
if (togglePasswordActual && passwordActualInput) {
  togglePasswordActual.addEventListener("click", () => {
    passwordActualInput.type =
      passwordActualInput.type === "password" ? "text" : "password";
  });
}

const togglePasswordNueva = document.querySelector("#toggle-password-nueva");
const passwordNuevaInput = document.querySelector(
  "#editar-perfil-password-nueva"
);
if (togglePasswordNueva && passwordNuevaInput) {
  togglePasswordNueva.addEventListener("click", () => {
    passwordNuevaInput.type =
      passwordNuevaInput.type === "password" ? "text" : "password";
  });
}

// Formulario editar perfil
const editarPerfilForm = document.querySelector("#editar-perfil-form");
if (editarPerfilForm) {
  const nombreInput = document.querySelector("#editar-perfil-nombre");
  const emailInput = document.querySelector("#editar-perfil-email");
  const passwordNuevaInput2 = document.querySelector(
    "#editar-perfil-password-nueva"
  );
  const campoPaswordActual = document.querySelector("#campo-password-actual");

  const mostrarPasswordActual = () => {
    const emailCambiado = emailInput.value.trim() !== "";
    const passwordNueva = passwordNuevaInput2.value.trim() !== "";
    if (emailCambiado || passwordNueva) {
      campoPaswordActual.style.display = "block";
    } else {
      campoPaswordActual.style.display = "none";
      document.querySelector("#editar-perfil-password-actual").value = "";
    }
  };

  if (emailInput) emailInput.addEventListener("input", mostrarPasswordActual);
  if (passwordNuevaInput2)
    passwordNuevaInput2.addEventListener("input", mostrarPasswordActual);

  fetch(`${BASE_URL}/api/auth/perfil`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.nombre) nombreInput.value = data.nombre;
    });

  editarPerfilForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.querySelector("#editar-perfil-nombre").value;
    const emailNuevo = document.querySelector("#editar-perfil-email").value;
    const passwordActual = document.querySelector(
      "#editar-perfil-password-actual"
    ).value;
    const passwordNueva = document.querySelector(
      "#editar-perfil-password-nueva"
    ).value;

    const btnGuardar = editarPerfilForm.querySelector('button[type="submit"]');
    btnGuardar.disabled = true;
    btnGuardar.textContent = "Guardando...";

    try {
      const response = await fetch(`${BASE_URL}/api/auth/perfil`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre,
          emailNuevo,
          passwordActual,
          passwordNueva,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(data.message, "success");
        localStorage.setItem("nombre", data.nombre);
        document.querySelector("#perfil-nombre").textContent = data.nombre;
        const pillNombre = document.querySelector('#user-pill-nombre');
        if (pillNombre) pillNombre.textContent = data.nombre;
        if (data.email) {
          document.querySelector("#perfil-email").textContent = data.email;
        }
        document.querySelector('#editar-perfil-password-actual').value = '';
        document.querySelector('#editar-perfil-password-nueva').value = '';
        document.querySelector('#campo-password-actual').style.display = 'none';
        nombreInput.value = data.nombre;
      } else {
        showToast(data.message, "error");
      }
    } catch (error) {
      showToast("No se pudo conectar con el servidor", "error");
    } finally {
      btnGuardar.disabled = false;
      btnGuardar.textContent = "Guardar cambios";
    }
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
    window.location.replace("login.html");
  }

  let todasLasMascotas = [];

  btnAgregar.addEventListener("click", () => {
    if (formularioMascota.style.display === "none") {
      formularioMascota.style.display = "block";
      btnAgregar.textContent = "− Cancelar";
    } else {
      formularioMascota.style.display = "none";
      btnAgregar.textContent = "+ Agregar mascota";
    }
  });

  const editarForm = document.querySelector("#editar-form");
  const formularioEditar = document.querySelector("#formulario-editar");
  const btnCancelarEditar = document.querySelector("#btn-cancelar-editar");
  const editarFotoInput = document.querySelector("#editar-foto");
  const btnQuitarFotoEditar = document.querySelector("#btn-quitar-foto-editar");
  const editarFotoNombre = document.querySelector("#editar-foto-nombre");

  if (editarFotoInput) {
    editarFotoInput.addEventListener("change", () => {
      if (editarFotoInput.files[0]) {
        editarFotoNombre.textContent = editarFotoInput.files[0].name;
        btnQuitarFotoEditar.style.display = "flex";
      }
    });

    btnQuitarFotoEditar.addEventListener("click", () => {
      editarFotoInput.value = "";
      editarFotoNombre.textContent = "";
      btnQuitarFotoEditar.style.display = "none";
    });
  }

  if (btnCancelarEditar) {
    btnCancelarEditar.addEventListener("click", () => {
      formularioEditar.style.display = "none";
      editarForm.reset();
    });
  }

  if (editarForm) {
    editarForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const id = document.querySelector("#editar-id").value;
      const formData = new FormData();

      formData.append("nombre", document.querySelector("#editar-nombre").value);
      formData.append("raza", document.querySelector("#editar-raza").value);
      formData.append("edad", document.querySelector("#editar-edad").value);
      formData.append("notas", document.querySelector("#editar-notas").value);

      const foto = editarFotoInput.files[0];
      if (foto) formData.append("foto", foto);

      try {
        const response = await fetch(`${BASE_URL}/api/mascotas/${id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          showToast(data.message, "success");
          formularioEditar.style.display = "none";
          editarForm.reset();
          cargarMascotas();
        } else {
          showToast(data.message, "error");
        }
      } catch (error) {
        showToast("No se pudo conectar con el servidor", "error");
      }
    });
  }

  // Renderizar mascotas filtradas
  const renderizarMascotas = (mascotas) => {
    mascotasLista.innerHTML = "";

    if (mascotas.length === 0) {
      mascotasLista.innerHTML =
        '<p class="mascotas-no-resultados">No se encontraron mascotas con ese criterio.</p>';
      return;
    }

    mascotasEmpty.style.display = "none";

    mascotas.forEach((mascota, index) => {
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
        <div class="mascota-acciones">
          <button class="btn-editar-mascota" data-id="${
            mascota._id
          }" data-nombre="${mascota.nombre}" data-raza="${
        mascota.raza
      }" data-edad="${mascota.edad}" data-notas="${
        mascota.notas || ""
      }">✏️ Editar</button>
          <button class="btn-eliminar-mascota" data-id="${
            mascota._id
          }" data-nombre="${mascota.nombre}">🗑️ Eliminar</button>
        </div>
      `;

      card.classList.add("animate-fadeInUp", "opacity-0");
      const delay = `animate-delay-${Math.min(index + 1, 5)}`;
      card.classList.add(delay);

      mascotasLista.appendChild(card);
    });

    document.querySelectorAll(".btn-editar-mascota").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const nombre = btn.dataset.nombre;
        const raza = btn.dataset.raza;
        const edad = btn.dataset.edad;
        const notas = btn.dataset.notas;

        document.querySelector("#editar-id").value = id;
        document.querySelector("#editar-nombre").value = nombre;
        document.querySelector("#editar-raza").value = raza;
        document.querySelector("#editar-edad").value = edad;
        document.querySelector("#editar-notas").value = notas;

        const formularioEditar = document.querySelector("#formulario-editar");
        formularioEditar.style.display = "block";
        formularioEditar.scrollIntoView({ behavior: "smooth" });

        formularioMascota.style.display = "none";
        btnAgregar.textContent = "+ Agregar mascota";
      });
    });

    document.querySelectorAll(".btn-eliminar-mascota").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const nombreMascota = btn.dataset.nombre;

        showModal({
          emoji: "🗑️",
          titulo: "¿Eliminar mascota?",
          texto: `¿Estás seguro de que quieres eliminar a ${nombreMascota}? Esta acción no se puede deshacer.`,
          textoBtnConfirmar: "Sí, eliminar",
          onConfirmar: async () => {
            try {
              const response = await fetch(`${BASE_URL}/api/mascotas/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              });

              const data = await response.json();

              if (response.ok) {
                showToast(data.message, "success");
                cargarMascotas();
              } else {
                showToast(data.message, "error");
              }
            } catch (error) {
              showToast("No se pudo conectar con el servidor", "error");
            }
          },
        });
      });
    });
  };

  // Aplicar filtros de búsqueda
  const aplicarFiltrosMascotas = () => {
    const busqueda =
      document.querySelector("#buscar-mascota")?.value.toLowerCase() || "";
    const razaFiltro = document.querySelector("#filtrar-raza")?.value || "";

    const filtradas = todasLasMascotas.filter((mascota) => {
      const coincideNombre = mascota.nombre.toLowerCase().includes(busqueda);
      const coincideRaza = razaFiltro === "" || mascota.raza === razaFiltro;
      return coincideNombre && coincideRaza;
    });

    renderizarMascotas(filtradas);
  };

  const cargarMascotas = async () => {
    try {
      mascotasLista.innerHTML = `
        ${[1, 2, 3]
          .map(
            () => `
          <div class="skeleton-card">
            <div class="skeleton skeleton-foto"></div>
            <div class="skeleton-info">
              <div class="skeleton skeleton-titulo"></div>
              <div class="skeleton skeleton-texto"></div>
              <div class="skeleton skeleton-texto-corto"></div>
            </div>
          </div>
        `
          )
          .join("")}
      `;
      mascotasEmpty.style.display = "none";

      const response = await fetchConRefresh(`${BASE_URL}/api/mascotas`, {
        method: "GET",
      });

      const mascotas = await response.json();

      if (mascotas.length === 0) {
        mascotasLista.innerHTML = "";
        mascotasEmpty.style.display = "block";
        const mascotas_filtros = document.querySelector("#mascotas-filtros");
        if (mascotas_filtros) mascotas_filtros.style.display = "none";
        return;
      }

      todasLasMascotas = mascotas;

      const mascotas_filtros = document.querySelector("#mascotas-filtros");
      if (mascotas_filtros) mascotas_filtros.style.display = "flex";

      const selectRaza = document.querySelector("#filtrar-raza");
      if (selectRaza) {
        const razas = [...new Set(mascotas.map((m) => m.raza))];
        const valorActual = selectRaza.value;
        selectRaza.innerHTML = '<option value="">Todas las razas</option>';
        razas.forEach((raza) => {
          const option = document.createElement("option");
          option.value = raza;
          option.textContent = raza;
          selectRaza.appendChild(option);
        });
        selectRaza.value = valorActual;
      }

      aplicarFiltrosMascotas();
    } catch (error) {
      console.error("Error al cargar mascotas:", error);
    }
  };

  const buscarInput = document.querySelector("#buscar-mascota");
  const filtrarSelect = document.querySelector("#filtrar-raza");

  if (buscarInput)
    buscarInput.addEventListener("input", aplicarFiltrosMascotas);
  if (filtrarSelect)
    filtrarSelect.addEventListener("change", aplicarFiltrosMascotas);

  cargarMascotas();

  const mascotaFotoInput = document.querySelector("#mascota-foto");
  const btnQuitarFoto = document.querySelector("#btn-quitar-foto");
  const fotoNombre = document.querySelector("#foto-nombre");

  if (mascotaFotoInput) {
    mascotaFotoInput.addEventListener("change", () => {
      if (mascotaFotoInput.files[0]) {
        fotoNombre.textContent = mascotaFotoInput.files[0].name;
        btnQuitarFoto.style.display = "flex";
      }
    });

    btnQuitarFoto.addEventListener("click", () => {
      mascotaFotoInput.value = "";
      fotoNombre.textContent = "";
      btnQuitarFoto.style.display = "none";
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
      message.textContent = "Subiendo mascota...";
      message.style.color = "var(--gris)";

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch(`${BASE_URL}/api/mascotas`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (response.ok) {
        showToast(data.message, "success");
        mascotaForm.reset();
        formularioMascota.style.display = "none";
        btnAgregar.textContent = "+ Agregar mascota";
        fotoInput.value = "";
        document.querySelector("#btn-quitar-foto").style.display = "none";
        document.querySelector("#foto-nombre").textContent = "";
        cargarMascotas();
      } else {
        showToast(data.message, "error");
      }
    } catch (error) {
      if (error.name === "AbortError") {
        message.textContent = "El servidor tardó demasiado, intenta de nuevo";
      } else {
        message.textContent = "No se pudo conectar con el servidor";
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
    window.location.replace("login.html");
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
      const response = await fetchConRefresh(`${BASE_URL}/api/mascotas`, {
        method: "GET",
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
      reservasLista.innerHTML = `
        ${[1, 2]
          .map(
            () => `
          <div class="skeleton-reserva">
            <div class="skeleton-reserva-info">
              <div class="skeleton skeleton-titulo"></div>
              <div class="skeleton skeleton-texto"></div>
              <div class="skeleton skeleton-texto"></div>
            </div>
            <div class="skeleton skeleton-badge"></div>
          </div>
        `
          )
          .join("")}
      `;
      reservasEmpty.style.display = "none";

      const response = await fetchConRefresh(`${BASE_URL}/api/reservas`, {
        method: "GET",
      });

      const reservas = await response.json();

      const ahora = new Date();
      const proximas = reservas.filter(
        (r) =>
          (r.estado === "pendiente" || r.estado === "confirmada") &&
          new Date(r.fecha) >= ahora
      );
      const historial = reservas.filter(
        (r) => r.estado === "cancelada" || new Date(r.fecha) < ahora
      );

      const historialLista = document.querySelector("#historial-lista");
      const historialEmpty = document.querySelector("#historial-empty");

      const renderLista = (lista, contenedor, empty) => {
        contenedor.innerHTML = "";
        if (lista.length === 0) {
          empty.style.display = "block";
          return;
        }
        empty.style.display = "none";

        lista.forEach((reserva, index) => {
          const card = document.createElement("div");
          card.classList.add("reserva-card", "animate-fadeInUp", "opacity-0");
          const delay = `animate-delay-${Math.min(index + 1, 5)}`;
          card.classList.add(delay);

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

          contenedor.appendChild(card);
        });

        contenedor.querySelectorAll(".btn-cancelar").forEach((btn) => {
          btn.addEventListener("click", async () => {
            const id = btn.dataset.id;
            showModal({
              emoji: "❌",
              titulo: "¿Cancelar reserva?",
              texto: "¿Estás seguro de que quieres cancelar esta reserva?",
              textoBtnConfirmar: "Sí, cancelar",
              onConfirmar: async () => {
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
                    showToast(data.message, "success");
                    cargarReservas();
                  } else {
                    showToast(data.message, "error");
                  }
                } catch (error) {
                  showToast("No se pudo cancelar la reserva", "error");
                }
              },
            });
          });
        });
      };

      renderLista(proximas, reservasLista, reservasEmpty);
      renderLista(historial, historialLista, historialEmpty);
    } catch (error) {
      console.error("Error al cargar reservas:", error);
    }
  };

  cargarReservas();

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.remove("tab-activo"));
      btn.classList.add("tab-activo");

      const tab = btn.dataset.tab;
      document.querySelector("#tab-proximas").style.display =
        tab === "proximas" ? "block" : "none";
      document.querySelector("#tab-historial").style.display =
        tab === "historial" ? "block" : "none";
    });
  });

  reservaForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const btnReserva = reservaForm.querySelector('button[type="submit"]');
    btnReserva.disabled = true;
    btnReserva.textContent = "Creando reserva...";

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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch(`${BASE_URL}/api/reservas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mascota, fecha, direccion, notas }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (response.ok) {
        showToast(data.message, "success");
        reservaForm.reset();
        formularioReserva.style.display = "none";
        btnNuevaReserva.textContent = "+ Nueva reserva";
        cargarReservas();
      } else {
        showToast(data.message, "error");
      }
      btnReserva.disabled = false;
      btnReserva.textContent = "Crear reserva";
    } catch (error) {
      if (error.name === "AbortError") {
        showToast(
          "El servidor tardó demasiado, pero tu reserva puede haberse creado. Verifica en tu lista.",
          "info",
          6000
        );
        cargarReservas();
      } else {
        showToast("No se pudo conectar con el servidor", "error");
      }
      btnReserva.disabled = false;
      btnReserva.textContent = "Crear reserva";
    }
  });
}

// Admin
const adminLista = document.querySelector("#admin-lista");
const adminEmpty = document.querySelector("#admin-empty");
const rol = localStorage.getItem("rol");

if (adminLista) {
  if (!token || rol !== "admin") {
    window.location.replace("login.html");
  }

  // Tabs
  document.querySelectorAll(".admin-tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".admin-tab-btn")
        .forEach((b) => b.classList.remove("admin-tab-activo"));
      btn.classList.add("admin-tab-activo");

      const tab = btn.dataset.tab;
      document.querySelector("#tab-dashboard").style.display =
        tab === "dashboard" ? "block" : "none";
      document.querySelector("#tab-reservas").style.display =
        tab === "reservas" ? "block" : "none";
      document.querySelector("#tab-usuarios").style.display =
        tab === "usuarios" ? "block" : "none";
      document.querySelector("#tab-productos").style.display =
        tab === "productos" ? "block" : "none";

      if (tab === "reservas") cargarTodasLasReservas();
      if (tab === "usuarios") cargarUsuarios();
      if (tab === "productos") cargarProductosAdmin();
    });
  });

  // Dashboard stats
  const cargarStats = async () => {
    try {
      const [resAuth, resReservas] = await Promise.all([
        fetchConRefresh(`${BASE_URL}/api/auth/stats`, { method: "GET" }),
        fetchConRefresh(`${BASE_URL}/api/reservas/stats`, { method: "GET" }),
      ]);

      const authData = await resAuth.json();
      const reservasData = await resReservas.json();

      const statsGrid = document.querySelector("#stats-grid");
      statsGrid.innerHTML = `
        <div class="stat-card animate-fadeInUp opacity-0 animate-delay-1">
          <div class="stat-icono">👥</div>
          <div class="stat-valor">${authData.totalUsuarios}</div>
          <div class="stat-label">Usuarios registrados</div>
        </div>
        <div class="stat-card animate-fadeInUp opacity-0 animate-delay-2">
          <div class="stat-icono">🐾</div>
          <div class="stat-valor">${authData.totalMascotas}</div>
          <div class="stat-label">Mascotas registradas</div>
        </div>
        <div class="stat-card animate-fadeInUp opacity-0 animate-delay-3">
          <div class="stat-icono">📅</div>
          <div class="stat-valor">${reservasData.totalReservas}</div>
          <div class="stat-label">Total de reservas</div>
        </div>
        <div class="stat-card animate-fadeInUp opacity-0 animate-delay-4">
          <div class="stat-icono">⏳</div>
          <div class="stat-valor">${reservasData.pendientes}</div>
          <div class="stat-label">Reservas pendientes</div>
        </div>
        <div class="stat-card animate-fadeInUp opacity-0 animate-delay-5">
          <div class="stat-icono">✅</div>
          <div class="stat-valor">${reservasData.confirmadas}</div>
          <div class="stat-label">Reservas confirmadas</div>
        </div>
        <div class="stat-card stat-ingreso animate-fadeInUp opacity-0 animate-delay-5">
          <div class="stat-icono">💰</div>
          <div class="stat-valor">$${reservasData.ingresoEstimado.toLocaleString(
            "es-CO"
          )}</div>
          <div class="stat-label">Ingreso estimado COP</div>
        </div>
      `;
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    }
  };

  cargarStats();

  // Usuarios
  const cargarUsuarios = async () => {
    const usuariosLista = document.querySelector("#usuarios-lista");
    const usuariosEmpty = document.querySelector("#usuarios-empty");

    usuariosLista.innerHTML = `
      ${[1, 2, 3]
        .map(
          () => `
        <div class="skeleton-reserva">
          <div class="skeleton-reserva-info">
            <div class="skeleton skeleton-titulo"></div>
            <div class="skeleton skeleton-texto"></div>
          </div>
          <div class="skeleton skeleton-badge"></div>
        </div>
      `
        )
        .join("")}
    `;

    try {
      const response = await fetchConRefresh(`${BASE_URL}/api/auth/usuarios`, {
        method: "GET",
      });

      const usuarios = await response.json();

      if (usuarios.length === 0) {
        usuariosLista.innerHTML = "";
        usuariosEmpty.style.display = "block";
        return;
      }

      usuariosEmpty.style.display = "none";
      usuariosLista.innerHTML = "";

      usuarios.forEach((usuario, index) => {
        const card = document.createElement("div");
        card.classList.add("usuario-card", "animate-fadeInUp", "opacity-0");
        card.classList.add(`animate-delay-${Math.min(index + 1, 5)}`);

        const avatarHTML = usuario.foto
          ? `<img src="${usuario.foto}" alt="${usuario.nombre}" />`
          : "👤";

        card.innerHTML = `
          <div class="usuario-info">
            <div class="usuario-avatar">${avatarHTML}</div>
            <div class="usuario-datos">
              <h3>${usuario.nombre}</h3>
              <p>${usuario.email}</p>
              <p>Miembro desde ${new Date(usuario.createdAt).toLocaleDateString(
                "es-CO"
              )}</p>
            </div>
          </div>
          <div class="usuario-acciones">
            <span class="badge-estado badge-confirmada">${usuario.rol}</span>
            <button class="btn-hacer-admin" data-id="${
              usuario._id
            }" data-rol="${usuario.rol}">
              ${
                usuario.rol === "cliente"
                  ? "⬆️ Hacer admin"
                  : "⬇️ Hacer cliente"
              }
            </button>
          </div>
        `;

        usuariosLista.appendChild(card);
      });

      document.querySelectorAll(".btn-hacer-admin").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.id;
          const rolActual = btn.dataset.rol;
          const nuevoRol = rolActual === "cliente" ? "admin" : "cliente";

          showModal({
            emoji: "👥",
            titulo: `¿Cambiar rol a ${nuevoRol}?`,
            texto: `¿Estás seguro de que quieres cambiar el rol de este usuario a ${nuevoRol}?`,
            textoBtnConfirmar: "Sí, cambiar",
            onConfirmar: async () => {
              try {
                const response = await fetchConRefresh(
                  `${BASE_URL}/api/auth/usuarios/${id}/rol`,
                  {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ rol: nuevoRol }),
                  }
                );

                const data = await response.json();

                if (response.ok) {
                  showToast(data.message, "success");
                  cargarUsuarios();
                } else {
                  showToast(data.message, "error");
                }
              } catch (error) {
                showToast("No se pudo actualizar el rol", "error");
              }
            },
          });
        });
      });
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    }
  };

  // Reservas
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

    reservas.forEach((reserva, index) => {
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

      card.classList.add("animate-fadeInUp", "opacity-0");
      card.classList.add(`animate-delay-${Math.min(index + 1, 5)}`);
      adminLista.appendChild(card);
    });

    document
      .querySelectorAll(".btn-confirmar, .btn-cancelar-admin")
      .forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.dataset.id;
          const estado = btn.dataset.accion;

          try {
            const response = await fetchConRefresh(
              `${BASE_URL}/api/reservas/admin/${id}/estado`,
              {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ estado }),
              }
            );

            const data = await response.json();

            if (response.ok) {
              showToast(data.message, "success");
              cargarTodasLasReservas();
            } else {
              showToast(data.message, "error");
            }
          } catch (error) {
            showToast("No se pudo actualizar la reserva", "error");
          }
        });
      });
  };

  const cargarTodasLasReservas = async () => {
    try {
      adminLista.innerHTML = `
        ${[1, 2, 3]
          .map(
            () => `
          <div class="skeleton-reserva">
            <div class="skeleton-reserva-info">
              <div class="skeleton skeleton-titulo"></div>
              <div class="skeleton skeleton-texto"></div>
              <div class="skeleton skeleton-texto"></div>
              <div class="skeleton skeleton-texto-corto"></div>
            </div>
            <div class="skeleton skeleton-badge"></div>
          </div>
        `
          )
          .join("")}
      `;

      const response = await fetchConRefresh(
        `${BASE_URL}/api/reservas/admin/todas`,
        {
          method: "GET",
        }
      );

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

  // Productos - Admin
  const btnNuevoProducto = document.querySelector('#btn-nuevo-producto');
  const formularioProducto = document.querySelector('#formulario-producto');
  const productoForm = document.querySelector('#producto-form');
  const btnCancelarProducto = document.querySelector('#btn-cancelar-producto');
  const productosAdminLista = document.querySelector('#productos-admin-lista');
  const productosAdminEmpty = document.querySelector('#productos-admin-empty');

  const resetearFormularioProducto = () => {
    productoForm.reset();
    document.querySelector('#producto-id').value = '';
    document.querySelector('#producto-form-titulo').textContent = 'Nuevo producto';
    formularioProducto.style.display = 'none';
  };

  if (btnNuevoProducto) {
    btnNuevoProducto.addEventListener('click', () => {
      resetearFormularioProducto();
      formularioProducto.style.display = 'block';
      formularioProducto.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (btnCancelarProducto) {
    btnCancelarProducto.addEventListener('click', resetearFormularioProducto);
  }

  const cargarProductosAdmin = async () => {
    productosAdminLista.innerHTML = `
      ${[1, 2, 3].map(() => `
        <div class="skeleton-card">
          <div class="skeleton skeleton-foto"></div>
          <div class="skeleton-info">
            <div class="skeleton skeleton-titulo"></div>
            <div class="skeleton skeleton-texto"></div>
          </div>
        </div>
      `).join('')}
    `;

    try {
      const response = await fetchConRefresh(`${BASE_URL}/api/productos/admin/todos`, {
        method: 'GET'
      });

      const productos = await response.json();

      if (productos.length === 0) {
        productosAdminLista.innerHTML = '';
        productosAdminEmpty.style.display = 'block';
        return;
      }

      productosAdminEmpty.style.display = 'none';
      productosAdminLista.innerHTML = '';

      productos.forEach((producto, index) => {
        const card = document.createElement('div');
        card.classList.add('producto-admin-card', 'animate-fadeInUp', 'opacity-0');
        card.classList.add(`animate-delay-${Math.min(index + 1, 5)}`);
        if (!producto.activo) card.classList.add('inactivo');

        const fotoHTML = producto.foto
          ? `<div class="producto-admin-foto"><img src="${producto.foto}" alt="${producto.nombre}" /></div>`
          : `<div class="producto-admin-foto">📦</div>`;

        let stockClase = '';
        let stockTexto = `${producto.stock} unidades`;
        if (producto.stock === 0) {
          stockClase = 'agotado';
          stockTexto = 'Agotado';
        } else if (producto.stock <= 5) {
          stockClase = 'bajo';
          stockTexto = `${producto.stock} unidades (stock bajo)`;
        }

        card.innerHTML = `
          ${fotoHTML}
          <div class="producto-admin-info">
            <span class="producto-admin-categoria">${producto.categoria}</span>
            <h3>${producto.nombre}</h3>
            <p class="producto-admin-precio">$${producto.precio.toLocaleString('es-CO')}</p>
            <p class="producto-admin-stock ${stockClase}">${stockTexto}</p>
            <div class="producto-admin-acciones">
              <button class="btn-editar-producto" data-id="${producto._id}">✏️ Editar</button>
              <button class="btn-toggle-producto" data-id="${producto._id}">
                ${producto.activo ? '🚫 Desactivar' : '✅ Activar'}
              </button>
            </div>
          </div>
        `;

        productosAdminLista.appendChild(card);

        card.querySelector('.btn-editar-producto').addEventListener('click', () => {
          document.querySelector('#producto-id').value = producto._id;
          document.querySelector('#producto-nombre').value = producto.nombre;
          document.querySelector('#producto-descripcion').value = producto.descripcion;
          document.querySelector('#producto-precio').value = producto.precio;
          document.querySelector('#producto-stock').value = producto.stock;
          document.querySelector('#producto-categoria').value = producto.categoria;
          document.querySelector('#producto-form-titulo').textContent = 'Editar producto';
          formularioProducto.style.display = 'block';
          formularioProducto.scrollIntoView({ behavior: 'smooth' });
        });

        card.querySelector('.btn-toggle-producto').addEventListener('click', () => {
          showModal({
            emoji: producto.activo ? '🚫' : '✅',
            titulo: producto.activo ? '¿Desactivar producto?' : '¿Activar producto?',
            texto: producto.activo
              ? 'El producto dejará de aparecer en el catálogo público.'
              : 'El producto volverá a aparecer en el catálogo público.',
            textoBtnConfirmar: 'Confirmar',
            onConfirmar: async () => {
              try {
                const response = await fetchConRefresh(`${BASE_URL}/api/productos/${producto._id}/estado`, {
                  method: 'PATCH'
                });
                const data = await response.json();
                if (response.ok) {
                  showToast(data.message, 'success');
                  cargarProductosAdmin();
                } else {
                  showToast(data.message, 'error');
                }
              } catch (error) {
                showToast('No se pudo actualizar el producto', 'error');
              }
            }
          });
        });
      });

    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  if (productoForm) {
    productoForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const id = document.querySelector('#producto-id').value;
      const message = document.querySelector('#producto-message');
      const formData = new FormData();

      formData.append('nombre', document.querySelector('#producto-nombre').value);
      formData.append('descripcion', document.querySelector('#producto-descripcion').value);
      formData.append('precio', document.querySelector('#producto-precio').value);
      formData.append('stock', document.querySelector('#producto-stock').value);
      formData.append('categoria', document.querySelector('#producto-categoria').value);

      const foto = document.querySelector('#producto-foto').files[0];
      if (foto) formData.append('foto', foto);

      const btnGuardar = productoForm.querySelector('button[type="submit"]');
      btnGuardar.disabled = true;
      btnGuardar.textContent = 'Guardando...';

      try {
        const url = id ? `${BASE_URL}/api/productos/${id}` : `${BASE_URL}/api/productos`;
        const method = id ? 'PUT' : 'POST';

        const response = await fetchConRefresh(url, {
          method,
          body: formData
        });

        const data = await response.json();

        if (response.ok) {
          showToast(data.message, 'success');
          resetearFormularioProducto();
          cargarProductosAdmin();
        } else {
          showToast(data.message, 'error');
        }
      } catch (error) {
        showToast('No se pudo conectar con el servidor', 'error');
      } finally {
        btnGuardar.disabled = false;
        btnGuardar.textContent = 'Guardar producto';
      }
    });
  }
}

// Admin perfil
const adminPerfilNombre = document.querySelector("#perfil-nombre");
if (adminPerfilNombre && localStorage.getItem("rol") === "admin") {
  if (!token) {
    window.location.href = "login.html";
  }
}

// Botón paseos
document.querySelectorAll(".btn-paseos").forEach((btn) => {
  btn.addEventListener("click", () => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "login.html";
    } else {
      window.location.href = "reservas.html";
    }
  });
});

// Carrusel
const carruselTrack = document.querySelector("#carrusel-track");
const carruselDots = document.querySelector("#carrusel-dots");

if (carruselTrack) {
  const slides = carruselTrack.querySelectorAll(".carrusel-slide");
  const totalSlides = slides.length;
  let slideActual = 0;
  let intervalo;

  // Crear puntos
  slides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.classList.add("carrusel-dot");
    dot.setAttribute("aria-label", `Ir a slide ${index + 1}`);
    if (index === 0) dot.classList.add("activo");
    dot.addEventListener("click", () => {
      irASlide(index);
      reiniciarIntervalo();
    });
    carruselDots.appendChild(dot);
  });

  const actualizarDots = () => {
    document.querySelectorAll(".carrusel-dot").forEach((dot, index) => {
      dot.classList.toggle("activo", index === slideActual);
    });
  };

  const irASlide = (index) => {
    slideActual = (index + totalSlides) % totalSlides;
    carruselTrack.style.transform = `translateX(-${slideActual * 100}%)`;
    actualizarDots();
  };

  const siguiente = () => irASlide(slideActual + 1);
  const anterior = () => irASlide(slideActual - 1);

  document.querySelector(".carrusel-next").addEventListener("click", () => {
    siguiente();
    reiniciarIntervalo();
  });

  document.querySelector(".carrusel-prev").addEventListener("click", () => {
    anterior();
    reiniciarIntervalo();
  });

  const iniciarIntervalo = () => {
    intervalo = setInterval(siguiente, 4000);
  };

  const reiniciarIntervalo = () => {
    clearInterval(intervalo);
    iniciarIntervalo();
  };

  // Soporte táctil para móvil
  let touchStartX = 0;
  let touchEndX = 0;

  carruselTrack.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  carruselTrack.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        siguiente();
      } else {
        anterior();
      }
      reiniciarIntervalo();
    }
  });

  iniciarIntervalo();
}

// Contadores animados
const contadores = document.querySelectorAll(".contador-numero");

if (contadores.length > 0) {
  const animarContador = (elemento) => {
    const target = parseFloat(elemento.dataset.target);
    const esDecimal = elemento.dataset.decimal === "true";
    const duracion = 2000;
    const pasos = 60;
    const incremento = target / pasos;
    let actual = 0;
    let paso = 0;

    const intervalo = setInterval(() => {
      paso++;
      actual += incremento;

      if (paso >= pasos) {
        actual = target;
        clearInterval(intervalo);
      }

      elemento.textContent = esDecimal ? actual.toFixed(1) : Math.floor(actual);
    }, duracion / pasos);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animarContador(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  contadores.forEach((contador) => observer.observe(contador));
}

// Modal paseadores
const modalPaseador = document.querySelector("#modal-paseador");
const btnCerrarPaseador = document.querySelector("#modal-paseador-cerrar");

if (modalPaseador) {
  document.querySelectorAll(".btn-ver-paseador").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const card = btn.closest(".paseador-card");

      document.querySelector("#modal-paseador-emoji").textContent =
        card.dataset.emoji;
      document.querySelector("#modal-paseador-nombre").textContent =
        card.dataset.nombre;
      document.querySelector(
        "#modal-paseador-calificacion"
      ).textContent = `⭐ ${card.dataset.calificacion}`;
      document.querySelector(
        "#modal-paseador-paseos"
      ).textContent = `🐾 +${card.dataset.paseos} paseos`;
      document.querySelector(
        "#modal-paseador-experiencia"
      ).textContent = `⏱️ ${card.dataset.experiencia}`;
      document.querySelector("#modal-paseador-especialidad").textContent =
        card.dataset.especialidad;
      document.querySelector("#modal-paseador-descripcion").textContent =
        card.dataset.descripcion;

      modalPaseador.style.display = "flex";
      document.body.style.overflow = "hidden";
    });
  });

  const cerrarModal = () => {
    modalPaseador.style.display = "none";
    document.body.style.overflow = "";
  };

  btnCerrarPaseador.addEventListener("click", cerrarModal);

  modalPaseador.addEventListener("click", (e) => {
    if (e.target === modalPaseador) cerrarModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") cerrarModal();
  });

  document
    .querySelector(".modal-paseador-btn")
    .addEventListener("click", () => {
      cerrarModal();
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "login.html";
      } else {
        window.location.href = "reservas.html";
      }
    });
}

// Pet Shop - Catálogo público
const petshopGrid = document.querySelector('#petshop-grid');

if (petshopGrid) {
  let categoriaActual = '';
  let productoSeleccionado = null;
  let cantidadSeleccionada = 1;

  const formatearPrecio = (precio) => `$${precio.toLocaleString('es-CO')}`;

  const renderizarProductos = (productos) => {
    const empty = document.querySelector('#petshop-empty');

    if (productos.length === 0) {
      petshopGrid.innerHTML = '';
      empty.style.display = 'block';
      return;
    }

    empty.style.display = 'none';
    petshopGrid.innerHTML = '';

    productos.forEach((producto, index) => {
      const card = document.createElement('div');
      card.classList.add('producto-card', 'animate-fadeInUp', 'opacity-0');
      card.classList.add(`animate-delay-${Math.min((index % 5) + 1, 5)}`);

      const fotoHTML = producto.foto
        ? `<img src="${producto.foto}" alt="${producto.nombre}" />`
        : '📦';

      const stockBajoHTML = (producto.stock > 0 && producto.stock <= 5)
        ? `<p class="producto-card-stock-bajo">¡Solo quedan ${producto.stock}!</p>`
        : '';

      card.innerHTML = `
        <div class="producto-card-foto">${fotoHTML}</div>
        <div class="producto-card-info">
          <span class="producto-card-categoria">${producto.categoria}</span>
          <h3 class="producto-card-nombre">${producto.nombre}</h3>
          <p class="producto-card-precio">${formatearPrecio(producto.precio)}</p>
          ${stockBajoHTML}
        </div>
      `;

      card.addEventListener('click', () => abrirModalProducto(producto));
      petshopGrid.appendChild(card);
    });
  };

  const cargarProductos = async (categoria = '') => {
    try {
      const url = categoria
        ? `${BASE_URL}/api/productos?categoria=${encodeURIComponent(categoria)}`
        : `${BASE_URL}/api/productos`;

      const response = await fetch(url);
      const productos = await response.json();
      renderizarProductos(productos);

    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  document.querySelectorAll('.filtro-categoria').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filtro-categoria').forEach(b => b.classList.remove('activo'));
      btn.classList.add('activo');
      categoriaActual = btn.dataset.categoria;
      cargarProductos(categoriaActual);
    });
  });

  cargarProductos();

  // Modal de producto
  const modalProducto = document.querySelector('#modal-producto');
  const btnCerrarProducto = document.querySelector('#modal-producto-cerrar');
  const cantidadValor = document.querySelector('#cantidad-valor');
  const btnRestar = document.querySelector('#cantidad-restar');
  const btnSumar = document.querySelector('#cantidad-sumar');

  const actualizarBotonesCantidad = () => {
    btnRestar.disabled = cantidadSeleccionada <= 1;
    btnSumar.disabled = cantidadSeleccionada >= productoSeleccionado.stock;
  };

  const abrirModalProducto = (producto) => {
    productoSeleccionado = producto;
    cantidadSeleccionada = 1;
    cantidadValor.textContent = '1';

    document.querySelector('#modal-producto-foto').innerHTML = producto.foto
      ? `<img src="${producto.foto}" alt="${producto.nombre}" />`
      : '📦';
    document.querySelector('#modal-producto-categoria').textContent = producto.categoria;
    document.querySelector('#modal-producto-nombre').textContent = producto.nombre;
    document.querySelector('#modal-producto-descripcion').textContent = producto.descripcion;
    document.querySelector('#modal-producto-precio').textContent = formatearPrecio(producto.precio);

    const stockTexto = producto.stock === 0
      ? '❌ Sin stock disponible'
      : `✅ ${producto.stock} unidades disponibles`;
    document.querySelector('#modal-producto-stock').textContent = stockTexto;

    const btnAgregar = document.querySelector('#btn-agregar-carrito');
    btnAgregar.disabled = producto.stock === 0;
    btnAgregar.textContent = producto.stock === 0 ? 'Sin stock' : 'Agregar al carrito 🛒';

    actualizarBotonesCantidad();
    modalProducto.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };

  const cerrarModalProducto = () => {
    modalProducto.style.display = 'none';
    document.body.style.overflow = '';
  };

  btnCerrarProducto.addEventListener('click', cerrarModalProducto);
  modalProducto.addEventListener('click', (e) => {
    if (e.target === modalProducto) cerrarModalProducto();
  });

  btnRestar.addEventListener('click', () => {
    if (cantidadSeleccionada > 1) {
      cantidadSeleccionada--;
      cantidadValor.textContent = cantidadSeleccionada;
      actualizarBotonesCantidad();
    }
  });

  btnSumar.addEventListener('click', () => {
    if (cantidadSeleccionada < productoSeleccionado.stock) {
      cantidadSeleccionada++;
      cantidadValor.textContent = cantidadSeleccionada;
      actualizarBotonesCantidad();
    }
  });

  document.querySelector('#btn-agregar-carrito').addEventListener('click', async () => {
    const tok = localStorage.getItem('token');
    if (!tok) {
      window.location.href = 'login.html';
      return;
    }

    try {
      const response = await fetchConRefresh(`${BASE_URL}/api/carrito`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productoId: productoSeleccionado._id, cantidad: cantidadSeleccionada })
      });

      const data = await response.json();

      if (response.ok) {
        showToast(data.message, 'success');
        cerrarModalProducto();
        actualizarBadgeCarrito();
      } else {
        showToast(data.message, 'error');
      }
    } catch (error) {
      showToast('No se pudo agregar al carrito', 'error');
    }
  });
}

// Badge del carrito (visible en cualquier página con navbar de tienda)
const actualizarBadgeCarrito = async () => {
  const badge = document.querySelector('#carrito-badge');
  if (!badge) return;

  const tok = localStorage.getItem('token');
  if (!tok) return;

  try {
    const response = await fetchConRefresh(`${BASE_URL}/api/carrito`, { method: 'GET' });
    const items = await response.json();
    const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0);

    if (totalItems > 0) {
      badge.textContent = totalItems;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  } catch (error) {
    console.error('Error al cargar carrito:', error);
  }
};

if (document.querySelector('#carrito-badge')) {
  actualizarBadgeCarrito();
}
