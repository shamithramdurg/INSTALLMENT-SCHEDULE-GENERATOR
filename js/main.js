// ========================================
// INSTALLMENT SCHEDULE GENERATOR
// Shared helpers: API calls, session check, formatting
// ========================================

// ---------- API ----------

async function api(path, options) {
    const opts = options || {};
    let response;

    try {
        response = await fetch((window.API_BASE || "") + "/api" + path, {
            method: opts.method || "GET",
            headers: opts.body ? { "Content-Type": "application/json" } : {},
            body: opts.body ? JSON.stringify(opts.body) : undefined,
            credentials: "include"
        });
    } catch (networkError) {
        const err = new Error("Cannot reach the server. Please check that it is running.");
        err.status = 0;
        throw err;
    }

    let data = null;
    try {
        data = await response.json();
    } catch (e) {
        data = null;
    }

    if (!response.ok) {
        const err = new Error((data && data.error) || "Request failed (" + response.status + ")");
        err.status = response.status;
        err.details = data && data.details;
        throw err;
    }

    return data;
}

// ---------- FORMATTING ----------

function esc(value) {
    return String(value == null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Number(amount));
}

// Accepts "YYYY-MM-DD" (or an ISO timestamp) and returns DD/MM/YYYY without timezone shifts
function formatDate(value) {
    if (!value) return "";
    const text = String(value);
    const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) return match[3] + "/" + match[2] + "/" + match[1];

    const d = new Date(text);
    if (isNaN(d)) return text;
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function capitalize(text) {
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
}

// ---------- MESSAGES ----------

function showMessage(element, message, type) {
    if (!element) return;
    element.textContent = message;
    element.className = "msg msg-" + (type || "error");
    element.hidden = !message;
}

function confirmAction(message) {
    return confirm(message);
}

// ---------- SESSION ----------

// Resolves to the logged-in user, or null. Protected pages redirect to login.
const authReady = (async function () {

    const body = document.body;
    const isProtected = body.dataset.protected === "true";
    const isAdminPage = body.dataset.admin === "true";
    const isGuestPage = body.dataset.guest === "true";

    let user = null;

    try {
        const result = await api("/auth/session");
        user = result.user;
    } catch (err) {
        user = null;
    }

    if (isProtected && !user) {
        window.location.replace("login.html");
        return null;
    }

    if (isAdminPage && user && user.role !== "admin") {
        window.location.replace("dashboard.html");
        return null;
    }

    if (isGuestPage && user) {
        window.location.replace("dashboard.html");
        return null;
    }

    if (user) {
        const nameElement = document.getElementById("userName");
        if (nameElement) nameElement.textContent = user.name;

        document.querySelectorAll("[data-admin-only]").forEach(function (el) {
            el.hidden = user.role !== "admin";
        });
    }

    // Home page navigation: swap Login/Register for Dashboard when logged in
    document.querySelectorAll("[data-guest-only]").forEach(function (el) {
        el.hidden = !!user;
    });
    document.querySelectorAll("[data-user-only]").forEach(function (el) {
        el.hidden = !user;
    });

    return user;
})();

// ---------- LOGOUT ----------

document.addEventListener("click", async function (event) {
    const link = event.target.closest("[data-logout]");
    if (!link) return;

    event.preventDefault();

    try {
        await api("/auth/logout", { method: "POST" });
    } catch (err) {
        // ignore - we leave the page anyway
    }

    window.location.href = "index.html";
});

// ---------- PRINT ----------

document.addEventListener("click", function (event) {
    if (event.target.closest("[data-print]")) {
        window.print();
    }
});
