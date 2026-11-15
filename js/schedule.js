// Schedule page + printable report page (both read one saved loan from the API)

(async function () {

    const user = await authReady;
    if (!user) return;

    const pageMessage = document.getElementById("pageMessage");
    const scheduleBody = document.getElementById("scheduleBody");
    const scheduleFoot = document.getElementById("scheduleFoot");
    const summary = document.getElementById("summary");
    const reportDetails = document.getElementById("reportDetails");

    const id = new URLSearchParams(window.location.search).get("id");

    if (!id) {
        window.location.replace("dashboard.html");
        return;
    }

    let data;

    try {
        data = await api("/loans/" + encodeURIComponent(id));
    } catch (err) {
        showMessage(pageMessage, err.message, "error");
        return;
    }

    const loan = data.loan;
    const schedule = data.schedule;

    // wire up report / schedule links and the CSV button
    document.querySelectorAll("[data-report-link]").forEach(function (a) {
        a.href = "report.html?id=" + encodeURIComponent(loan.id);
    });
    document.querySelectorAll("[data-schedule-link]").forEach(function (a) {
        a.href = "schedule.html?id=" + encodeURIComponent(loan.id);
    });
    document.querySelectorAll("[data-download-csv]").forEach(function (btn) {
        btn.addEventListener("click", function () {
            downloadCsv(loan, schedule);
        });
    });


    function summaryHtml() {

        const owner = loan.userId !== user.id
            ? "<p><strong>Customer:</strong> " + esc(loan.ownerName) + " (" + esc(loan.ownerEmail) + ")</p>"
            : "";

        return owner +
            "<p><strong>Principal:</strong> " + formatCurrency(loan.principal) + "</p>" +
            "<p><strong>Annual Interest Rate:</strong> " + esc(loan.interestRate) + "%</p>" +
            "<p><strong>Tenure:</strong> " + esc(loan.tenure) + " months</p>" +
            "<p><strong>Frequency:</strong> " + esc(capitalize(loan.frequency)) +
            " (" + esc(loan.numInstallments) + " installments)</p>" +
            "<p><strong>Start Date:</strong> " + formatDate(loan.startDate) + "</p>" +
            "<p><strong>" + esc(capitalize(loan.frequency)) + " Installment (EMI):</strong> " +
            formatCurrency(loan.installmentAmount) + "</p>" +
            "<p><strong>Total Payment:</strong> " + formatCurrency(loan.totalPayment) + "</p>" +
            "<p><strong>Total Interest:</strong> " + formatCurrency(loan.totalInterest) + "</p>";
    }

    function rowsHtml() {
        return schedule.map(function (row) {
            return "<tr>" +
                "<td>" + row.no + "</td>" +
                "<td>" + formatDate(row.dueDate) + "</td>" +
                "<td>" + formatCurrency(row.amount) + "</td>" +
                "<td>" + formatCurrency(row.principal) + "</td>" +
                "<td>" + formatCurrency(row.interest) + "</td>" +
                "<td>" + formatCurrency(row.balance) + "</td>" +
                "</tr>";
        }).join("");
    }

    function footHtml() {
        return "<tr>" +
            "<th colspan=\"2\">Total</th>" +
            "<th>" + formatCurrency(loan.totalPayment) + "</th>" +
            "<th>" + formatCurrency(loan.principal) + "</th>" +
            "<th>" + formatCurrency(loan.totalInterest) + "</th>" +
            "<th>" + formatCurrency(0) + "</th>" +
            "</tr>";
    }

    const HEAD = "<thead><tr><th>No.</th><th>Due Date</th><th>Installment</th>" +
        "<th>Principal</th><th>Interest</th><th>Balance</th></tr></thead>";


    // SCHEDULE PAGE
    if (scheduleBody) {
        if (summary) summary.innerHTML = summaryHtml();
        scheduleBody.innerHTML = rowsHtml();
        if (scheduleFoot) scheduleFoot.innerHTML = footHtml();
    }

    // REPORT PAGE
    if (reportDetails) {
        reportDetails.innerHTML =
            "<p class=\"report-meta\">Report No. " + esc(loan.id) +
            " &middot; Generated on " + formatDate(new Date().toISOString()) + "</p>" +
            "<div class=\"summary\">" + summaryHtml() + "</div>" +
            "<div class=\"table-container\"><table>" + HEAD +
            "<tbody>" + rowsHtml() + "</tbody>" +
            "<tfoot>" + footHtml() + "</tfoot></table></div>" +
            "<p class=\"report-note\">This schedule is for educational/project use and does not replace " +
            "official lender calculations.</p>";
    }

})();


function downloadCsv(loan, schedule) {

    const lines = ["Installment No,Due Date,Installment,Principal,Interest,Balance"];

    schedule.forEach(function (r) {
        lines.push([
            r.no,
            formatDate(r.dueDate),
            r.amount.toFixed(2),
            r.principal.toFixed(2),
            r.interest.toFixed(2),
            r.balance.toFixed(2)
        ].join(","));
    });

    const blob = new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "installment-schedule-" + loan.id + ".csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}
