// Admin panel: manage users and stored loan records (FR12)

(async function () {

    const admin = await authReady;
    if (!admin) return;

    const message = document.getElementById("pageMessage");
    const usersBody = document.getElementById("usersBody");
    const loansBody = document.getElementById("loansBody");
    const loansEmpty = document.getElementById("loansEmpty");
    const stats = document.getElementById("stats");

    async function loadAll() {

        try {
            const results = await Promise.all([
                api("/admin/stats"),
                api("/admin/users"),
                api("/admin/loans")
            ]);

            const s = results[0];
            const users = results[1].users;
            const loans = results[2].loans;

            stats.innerHTML =
                "<p><strong>Registered users:</strong> " + s.users + "</p>" +
                "<p><strong>Saved schedules:</strong> " + s.loans + "</p>";

            usersBody.innerHTML = users.map(function (u) {

                const isSelf = u.id === admin.id;

                const roleCell = isSelf
                    ? "<span class=\"badge\">" + esc(u.role) + " (you)</span>"
                    : "<select data-role=\"" + u.id + "\" aria-label=\"Role for " + esc(u.name) + "\">" +
                      "<option value=\"user\"" + (u.role === "user" ? " selected" : "") + ">user</option>" +
                      "<option value=\"admin\"" + (u.role === "admin" ? " selected" : "") + ">admin</option>" +
                      "</select>";

                const deleteCell = isSelf
                    ? ""
                    : "<button type=\"button\" class=\"btn-small btn-danger\" data-delete-user=\"" + u.id + "\">Delete</button>";

                return "<tr>" +
                    "<td>" + u.id + "</td>" +
                    "<td>" + esc(u.name) + "</td>" +
                    "<td>" + esc(u.email) + "</td>" +
                    "<td>" + roleCell + "</td>" +
                    "<td>" + u.loanCount + "</td>" +
                    "<td>" + formatDate(u.createdAt) + "</td>" +
                    "<td class=\"actions\">" + deleteCell + "</td>" +
                    "</tr>";
            }).join("");

            loansEmpty.hidden = loans.length > 0;

            loansBody.innerHTML = loans.map(function (l) {
                return "<tr>" +
                    "<td>" + l.id + "</td>" +
                    "<td>" + esc(l.ownerName) + "<br><small>" + esc(l.ownerEmail) + "</small></td>" +
                    "<td>" + formatCurrency(l.principal) + "</td>" +
                    "<td>" + esc(l.interestRate) + "%</td>" +
                    "<td>" + esc(l.tenure) + " mo</td>" +
                    "<td>" + esc(capitalize(l.frequency)) + "</td>" +
                    "<td>" + formatCurrency(l.installmentAmount) + "</td>" +
                    "<td class=\"actions\">" +
                    "<a class=\"btn-small\" href=\"schedule.html?id=" + l.id + "\">View</a>" +
                    "<button type=\"button\" class=\"btn-small btn-danger\" data-delete-loan=\"" + l.id + "\">Delete</button>" +
                    "</td>" +
                    "</tr>";
            }).join("");

        } catch (err) {
            showMessage(message, err.message, "error");
        }
    }

    document.addEventListener("click", async function (event) {

        const userBtn = event.target.closest("[data-delete-user]");
        const loanBtn = event.target.closest("[data-delete-loan]");

        try {
            if (userBtn) {
                if (!confirmAction("Delete this user and all of their schedules?")) return;
                await api("/admin/users/" + userBtn.dataset.deleteUser, { method: "DELETE" });
                showMessage(message, "User deleted.", "success");
                await loadAll();
            } else if (loanBtn) {
                if (!confirmAction("Delete this schedule?")) return;
                await api("/loans/" + loanBtn.dataset.deleteLoan, { method: "DELETE" });
                showMessage(message, "Schedule deleted.", "success");
                await loadAll();
            }
        } catch (err) {
            showMessage(message, err.message, "error");
        }
    });

    document.addEventListener("change", async function (event) {

        const select = event.target.closest("[data-role]");
        if (!select) return;

        try {
            await api("/admin/users/" + select.dataset.role + "/role", {
                method: "PATCH",
                body: { role: select.value }
            });
            showMessage(message, "Role updated.", "success");
            await loadAll();
        } catch (err) {
            showMessage(message, err.message, "error");
            await loadAll();
        }
    });

    loadAll();

})();
