// REGISTER

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const message = document.getElementById("formMessage");
        const button = registerForm.querySelector("button[type=submit]");

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (password !== confirmPassword) {
            showMessage(message, "Passwords do not match.", "error");
            return;
        }

        button.disabled = true;

        try {
            await api("/auth/register", {
                method: "POST",
                body: { name: name, email: email, password: password }
            });

            showMessage(message, "Registration successful! Redirecting to login...", "success");

            setTimeout(function () {
                window.location.href = "login.html";
            }, 1000);

        } catch (err) {
            showMessage(message, err.message, "error");
            button.disabled = false;
        }
    });
}


// LOGIN

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const message = document.getElementById("loginMessage");
        const button = loginForm.querySelector("button[type=submit]");

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        button.disabled = true;

        try {
            await api("/auth/login", {
                method: "POST",
                body: { email: email, password: password }
            });

            window.location.href = "dashboard.html";

        } catch (err) {
            showMessage(message, err.message, "error");
            button.disabled = false;
        }
    });
}
