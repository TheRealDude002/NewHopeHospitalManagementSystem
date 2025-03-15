function submitForm() {
    // Get input values
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const address = document.getElementById("address").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const employmentType = document.getElementById("employmentType").value.trim();
    const specialization = document.getElementById("specialization").value.trim();

    // Basic validation
    if (!firstName || !lastName || !address || !phone || !employmentType || !specialization) {
        alert("Please fill in all fields.");
        return;
    }

    // Display loading message
    const outputDiv = document.getElementById("output");
    outputDiv.innerHTML = `<p>Sending data...</p>`;

    // Send data to the server
    fetch('/add-doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, address, phone, employmentType, specialization }),
    })
    .then(response => response.json()) // Parse the JSON response
    .then(data => {
        if (data.success) {
            // Display success message with DoctorID
            outputDiv.innerHTML = `
                <h4>Success!</h4>
                <p>${data.message}</p>
            `;
        } else {
            // Display error message
            outputDiv.innerHTML = `
                <h4>Error!</h4>
                <p>${data.message}</p>
            `;
        }
    })
    .catch(error => {
        console.error("Error submitting data:", error);
        outputDiv.innerHTML = `
            <h4>Error!</h4>
            <p>There was an error submitting your data. Please try again later.</p>
        `;
    });
}