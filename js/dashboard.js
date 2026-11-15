// Dashboard: list of the user's saved schedules (FR10)

(async function () {

    const user = await authReady;
    if (!user) return;

    const message = document.getElementById("pageMessage");
    const body = document.getElementById("savedBody");
    const empty = document.getElementById("savedEmpty");
    const tableWrap = document.getElementById("savedTable");

    async function load() {

        let result;

        try {
            result = await api("/loans");
        } catch (err) {
            showMessage(message, err.message, "error");
            return;
        }

        const loans = result.loans;

        empty.hidden = loans.length > 0;
        tableWrap.hidden = loans.length === 0;

        body.innerHTML = loans.map(function (l) {
            return "<tr>" +
                "<td>" + l.id + "</td>" +
                "<td>" + formatDate(l.createdAt) + "</td>" +
                "<td>" + formatCurrency(l.principal) + "</td>" +
                "<td>" + esc(l.interestRate) + "%</td>" +
                "<td>" + esc(l.tenure) + " mo</td>" +
                "<td>" + esc(capitalize(l.frequency)) + "</td>" +
                "<td>" + formatCurrency(l.installmentAmount) + "</td>" +
                "<td>" + formatCurrency(l.totalInterest) + "</td>" +
                "<td class=\"actions\">" +
                "<a class=\"btn-small\" href=\"schedule.html?id=" + l.id + "\">View</a>" +
                "<a class=\"btn-small\" href=\"report.html?id=" + l.id + "\">Report</a>" +
                "<button type=\"button\" class=\"btn-small btn-danger\" data-delete=\"" + l.id + "\">Delete</button>" +
                "</td>" +
                "</tr>";
        }).join("");
    }

    body.addEventListener("click", async function (event) {

        const button = event.target.closest("[data-delete]");
        if (!button) return;

        if (!confirmAction("Delete this saved schedule? This cannot be undone.")) return;

        try {
            await api("/loans/" + button.dataset.delete, { method: "DELETE" });
            showMessage(message, "Schedule deleted.", "success");
            await load();
        } catch (err) {
            showMessage(message, err.message, "error");
        }
    });

    load();

})();
