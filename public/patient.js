function submitForm() {
    // Get input values
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const address = document.getElementById("address").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const age = document.getElementById("age").value.trim();
    const weight = document.getElementById("weight").value.trim();
    const height = document.getElementById("height").value.trim();
    const bloodGroup = document.getElementById("bloodGroup").value.trim();
    const admitDate = document.getElementById("admitDate").value.trim();
    const dischargeDate = document.getElementById("dischargeDate").value.trim();
    const treatmentType = document.getElementById("treatmentType").value.trim();

    // Basic validation
    if (!firstName || !lastName || !address || !phone || !age || !weight || !height || !bloodGroup || !admitDate || !treatmentType) {
        alert("Fill in all fields");
        return;
    }

    // Display loading message
    document.getElementById("output").innerHTML = `<p>Sending data...</p>`;

    // Send data to the server
    fetch('/add-patient', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            firstName: firstName,
            lastName: lastName,
            address: address,
            phone: phone,
            age: age,
            weight: weight,
            height: height,
            bloodGroup: bloodGroup,
            admitDate: admitDate,
            dischargeDate: dischargeDate,
            treatmentType: treatmentType
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