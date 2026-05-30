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
const toggleLoginPassword = document.querySelector(
    "#toggle-login-password"
);
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

    const nombre = document.querySelector("input[placeholder='Nombre completo']").value;
    const email = document.querySelector("input[placeholder='Correo electrónico']").value;
    const password = document.querySelector("#register-password").value;
    const confirmPassword = document.querySelector("#confirm-password").value;
    const message = document.querySelector("#register-message");

    if (password.length < 6) {
      message.textContent = "La contraseña debe tener mínimo 6 caracteres";
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
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nombre, email, password })
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
