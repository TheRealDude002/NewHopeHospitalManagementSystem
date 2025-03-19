// Toggle visibility of payment method-specific fields
function togglePaymentFields() {
    const paymentMethod = document.getElementById("paymentMethod").value;

    const ccFields = document.querySelectorAll(".credit-card-fields");
    const checkFields = document.querySelectorAll(".check-fields");

    // Hide all fields
    ccFields.forEach(field => field.style.display = "none");
    checkFields.forEach(field => field.style.display = "none");

    // Show relevant fields based on selected payment method
    if (paymentMethod === "Credit Card") {
        ccFields.forEach(field => field.style.display = "block");
    } else if (paymentMethod === "Check") {
        checkFields.forEach(field => field.style.display = "block");
    }
}

// Form submission handler
function submitForm() {
    // Get input values
    const patientID = document.getElementById("patientID").value.trim();
    const paymentDate = document.getElementById("paymentDate").value.trim();
    const paymentMethod = document.getElementById("paymentMethod").value.trim();
    const ccNum = document.getElementById("ccNum")?.value?.trim() || "";
    const cardHolderName = document.getElementById("cardHolderName")?.value?.trim() || "";
    const checkNum = document.getElementById("checkNum")?.value?.trim() || "";
    const advancePayment = parseFloat(document.getElementById("advancePayment").value.trim());
    const finalPayment = parseFloat(document.getElementById("finalPayment").value.trim());
    const paymentStatus = document.getElementById("paymentStatus").value.trim();

    // Basic validation
    if (!patientID || !paymentDate || !paymentMethod || isNaN(advancePayment) || isNaN(finalPayment) || !paymentStatus) {
        alert("Please fill in all required fields and enter valid numbers for payments.");
        return;
    }

    // Validate patientID is a number
    if (!/^\d+$/.test(patientID)) {
        alert("Patient ID must be a valid number.");
        return;
    }

    // Validate advancePayment and finalPayment
    if (advancePayment < 0 || finalPayment < 0) {
        alert("Advance Payment and Final Payment must not be less than 0.");
        return;
    }

    // Validate Credit Card details if selected
    if (paymentMethod === "Credit Card") {
        if (!ccNum || !cardHolderName || !ccNum.match(/^[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}$/)) {
            alert("For Credit Card payments, please provide a valid Credit Card Number and Card Holder's Name.");
            return;
        }
    }

    // Validate Check Number if selected
    if (paymentMethod === "Check" && !checkNum) {
        alert("For Check payments, please provide a Check Number.");
        return;
    }

    // Enforce PaymentStatus rules
    if (advancePayment === 0 && paymentStatus !== "Pending") {
        alert("Payment Status must be 'Pending' when no advance payment is made.");
        return;
    }

    if (advancePayment > 0 && paymentStatus === "Pending") {
        alert("Payment Status cannot be 'Pending' when an advance payment has been made.");
        return;
    }

    // Display loading message
    document.getElementById("output").innerHTML = `<p>Sending data...</p>`;

    // Send data to the server
    fetch('/add-payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            patientID: patientID,
            paymentDate: paymentDate,
            paymentMethod: paymentMethod,
            ccNum: ccNum,
            cardHolderName: cardHolderName,
            checkNum: checkNum,
            advancePayment: advancePayment,
            finalPayment: finalPayment,
            paymentStatus: paymentStatus,
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById("output").innerHTML = `
                <h4>Success!</h4>
                <p>${data.message}</p>
            `;
        } else {
            document.getElementById("output").innerHTML = `
                <h4>Error!</h4>
                <p>${data.message}</p>
            `;
        }
    })
    .catch(error => {
        console.error("Error submitting data:", error);
        document.getElementById("output").innerHTML = `
            <h4>Error!</h4>
            <p>There was an error submitting your data. Please try again later.</p>
        `;
    });
}