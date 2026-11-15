// Loan input form: validate, send to the server (which calculates and saves to MySQL)

const loanForm = document.getElementById("loanForm");
const loanMessage = document.getElementById("loanMessage");
const startDateInput = document.getElementById("startDate");
const frequencySelect = document.getElementById("frequency");
const frequencyHint = document.getElementById("frequencyHint");

const FREQUENCY_HINTS = {
    monthly: "One installment per month.",
    weekly: "About 52 installments per year, one every 7 days.",
    quarterly: "One installment every 3 months. Tenure must be a multiple of 3.",
    yearly: "One installment per year. Tenure must be a multiple of 12."
};

// Default the start date to today (local time)
if (startDateInput && !startDateInput.value) {
    const now = new Date();
    const pad = function (n) { return String(n).padStart(2, "0"); };
    startDateInput.value = now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate());
}

if (frequencySelect) {
    frequencySelect.addEventListener("change", function () {
        frequencyHint.textContent = FREQUENCY_HINTS[frequencySelect.value] || "";
    });
}

function validateLoanForm(values) {

    if (!isFinite(values.principal) || values.principal < 100 || values.principal > 1000000000) {
        return "Principal amount must be between 100 and 1,000,000,000.";
    }

    if (!isFinite(values.interestRate) || values.interestRate < 0 || values.interestRate > 100) {
        return "Interest rate must be between 0 and 100%.";
    }

    if (!Number.isInteger(values.tenure) || values.tenure < 1 || values.tenure > 600) {
        return "Tenure must be a whole number of months between 1 and 600.";
    }

    if (!values.frequency) {
        return "Please select an installment frequency.";
    }

    if (values.frequency === "quarterly" && values.tenure % 3 !== 0) {
        return "For quarterly installments the tenure must be a multiple of 3 months.";
    }

    if (values.frequency === "yearly" && values.tenure % 12 !== 0) {
        return "For yearly installments the tenure must be a multiple of 12 months.";
    }

    if (!values.startDate) {
        return "Please choose a starting date.";
    }

    return null;
}

if (loanForm) {

    loanForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const button = loanForm.querySelector("button[type=submit]");

        const values = {
            principal: parseFloat(document.getElementById("principal").value),
            interestRate: parseFloat(document.getElementById("interest").value),
            tenure: parseInt(document.getElementById("tenure").value, 10),
            frequency: frequencySelect.value,
            startDate: startDateInput.value
        };

        const problem = validateLoanForm(values);

        if (problem) {
            showMessage(loanMessage, problem, "error");
            return;
        }

        button.disabled = true;
        showMessage(loanMessage, "Calculating and saving...", "info");

        try {
            const result = await api("/loans", { method: "POST", body: values });
            window.location.href = "schedule.html?id=" + encodeURIComponent(result.id);

        } catch (err) {

            if (err.status === 401) {
                window.location.href = "login.html";
                return;
            }

            showMessage(loanMessage, err.message, "error");
            button.disabled = false;
        }
    });
}
