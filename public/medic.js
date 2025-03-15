function submitForm() {
    // Get input values
    const patientID = document.getElementById("patientID").value.trim();
    const doctorID = document.getElementById("doctorID").value.trim();
    const disease = document.getElementById("disease").value.trim();
    const originalWard = document.getElementById("originalWard").value.trim();
    const dischargeWard = document.getElementById("dischargeWard").value.trim();

    // Basic validation
    if (!patientID || !doctorID || !disease || !originalWard) {
        alert("Please fill in all required fields.");
        return;
    }

    // Convert inputs to numbers
    const patientIDNum = parseInt(patientID, 10);
    const doctorIDNum = parseInt(doctorID, 10);
    const originalWardNum = parseInt(originalWard, 10);
    const dischargeWardNum = dischargeWard ? parseInt(dischargeWard, 10) : null;

    // Validate patientID and doctorID
    if (isNaN(patientIDNum)) {
        alert("Patient ID must be a valid integer.");
        return;
    }
    if (isNaN(doctorIDNum)) {
        alert("Doctor ID must be a valid integer.");
        return;
    }

    // Validate ward numbers
    if (isNaN(originalWardNum) || originalWardNum < 125 || originalWardNum > 140) {
        alert("Original Ward must be a number between 125 and 140.");
        return;
    }
    if (dischargeWard && (isNaN(dischargeWardNum) || dischargeWardNum < 125 || dischargeWardNum > 140)) {
        alert("Discharge Ward must be a number between 125 and 140.");
        return;
    }

    // Display loading message
    document.getElementById("output").innerHTML = `<p>Sending data...</p>`;

    // Send data to the server
    fetch('/add-medic', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            patientID: patientIDNum, // Send as number
            doctorID: doctorIDNum,  // Send as number
            disease,
            originalWard: originalWardNum, // Send as number
            dischargeWard: dischargeWardNum, // Send as number or null
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