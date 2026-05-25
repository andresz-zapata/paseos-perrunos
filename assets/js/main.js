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
    registerForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const password = document.querySelector(
            "#register-password"
        ).value;
        const confirmPassword = document.querySelector(
            "#confirm-password"
        ).value;
        const message = document.querySelector(
            "#register-message"
        );
        if (password.length < 6) {
            message.textContent =
                "La contraseña debe tener mínimo 6 caracteres";
            message.style.color = "red";
            return;
        }
        if (password !== confirmPassword) {
            message.textContent =
                "Las contraseñas no coinciden";
            message.style.color = "red";
            return;
        }
        message.textContent =
            "Cuenta creada correctamente 🎉";
        message.style.color = "green";
        registerForm.reset();
    });
}