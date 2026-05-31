console.log("JavaScript conectado correctamente 🚀");

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
      const response = await fetch("http://localhost:3000/api/auth/register", {
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
      const response = await fetch("http://localhost:3000/api/auth/login", {
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

        setTimeout(() => {
          window.location.href = "perfil.html";
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
  miCuentaLink.href = "perfil.html";
}

// Perfil page
const perfilNombre = document.querySelector("#perfil-nombre");
const perfilEmail = document.querySelector("#perfil-email");
const nombreUsuario = document.querySelector("#nombre-usuario");
const cerrarSesion = document.querySelector("#cerrar-sesion");

if (perfilNombre) {
  if (!token) {
    window.location.href = "login.html";
  } else {
    perfilNombre.textContent = nombre;

    fetch("http://localhost:3000/api/auth/perfil", {
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
      })
      .catch(() => {
        perfilEmail.textContent = "No se pudo cargar el correo";
      });
  }
}

if (cerrarSesion) {
  cerrarSesion.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("nombre");
    window.location.href = "login.html";
  });
}
