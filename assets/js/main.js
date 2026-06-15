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

    registerForm.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', () => {
        message.textContent = '';
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

// Toggle editar perfil
const perfilEditarToggle = document.querySelector("#perfil-editar-toggle");
const perfilEditarForm = document.querySelector("#perfil-editar-form");
const perfilEditarArrow = document.querySelector(".perfil-editar-arrow");

if (perfilEditarToggle) {
  perfilEditarToggle.addEventListener("click", () => {
    const abierto = perfilEditarForm.style.display !== "none";
    perfilEditarForm.style.display = abierto ? "none" : "block";
    perfilEditarArrow.classList.toggle("abierto", !abierto);
  });
}

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
        if (nombreUsuario) nombreUsuario.textContent = `👤 ${data.nombre}`;
        if (data.email) {
          document.querySelector("#perfil-email").textContent = data.email;
        }
        editarPerfilForm.reset();
        nombreInput.value = data.nombre;
        perfilEditarForm.style.display = "none";
        perfilEditarArrow.classList.remove("abierto");
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

if (cerrarSesion) {
  cerrarSesion.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      await fetch(`${BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("nombre");
    localStorage.removeItem("rol");
    localStorage.removeItem("refreshToken");
    window.location.replace("login.html");
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

  if (nombreUsuario && token && nombre) {
    nombreUsuario.textContent = `👤 ${nombre}`;
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

      if (tab === "reservas") cargarTodasLasReservas();
      if (tab === "usuarios") cargarUsuarios();
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
