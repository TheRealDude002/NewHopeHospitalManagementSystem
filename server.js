const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect('mongodb+srv://GroupMembers:Groupd@cluster0.vljud.mongodb.net/NewHope?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// ------------------------- MODELS ------------------------- //
const medicalHistorySchema = new mongoose.Schema({
    RecordID: String,
    PatientID: Number,
    DoctorID: Number,
    Disease: String,
    OriginalWard: Number,
    DischargeWard: Number,
});
const MedicalHistory = mongoose.model('MedicalHistory', medicalHistorySchema, 'MedicalHistory');

const patientSchema = new mongoose.Schema({
    PatientID: Number,
    FirstName: String,
    LastName: String,
    Address: String,
    Age: Number,
    Height: Number,
    Weight: Number,
    Blood_Grp: String,
    Admit_Date: String,
    Discharge_Date: String,
    Treatment_Type: String,
    DoctorID: Number,
    Ward_Id: Number,
    Phone_Num: String,
});
const Patient = mongoose.model('Patient', patientSchema, 'PatientDetails');

const doctorSchema = new mongoose.Schema({
    DoctorID: Number,
    FirstName: String,
    LastName: String,
    Address: String,
    Phone_Num: String,
    Employment_Type: String,
    Ward_Id: Number,
    Specialization: String,
});
const Doctor = mongoose.model('Doctor', doctorSchema, 'DoctorDetails');

const paymentDetailsSchema = new mongoose.Schema({
    PaymentID: String,
    PatientID: Number,
    PaymentDate: String,
    PaymentMethod: String,
    CC_Num: String,
    CardHoldersName: String,
    Check_Num: String,
    AdvancePayment: Number,
    FinalPayment: Number,
    TotalBill: Number, // Add TotalBill
    PaymentStatus: String,
});

const PaymentDetails = mongoose.model('PaymentDetails', paymentDetailsSchema, 'PaymentDetails');
const wardSchema = new mongoose.Schema({
    WardID: Number,
    WardName: String,
    Total_Beds: Number,
    Avail_Beds: Number,
    Ward_Charge: Number,
});
const Ward = mongoose.model('Ward', wardSchema, 'WardDetails');

// ------------------------- ROUTES ------------------------- //

// Medical History Routes
app.get('/medic', async (req, res) => {
    try {
        const { RecordID, PatientID, DoctorID, Disease, OriginalWard, DischargeWard } = req.query;
        const filter = {};
        if (RecordID) filter.RecordID = RecordID;
        if (PatientID) filter.PatientID = Number(PatientID);
        if (DoctorID) filter.DoctorID = Number(DoctorID);
        if (Disease) filter.Disease = { $regex: Disease, $options: 'i' };
        if (OriginalWard) filter.OriginalWard = Number(OriginalWard);
        if (DischargeWard) filter.DischargeWard = Number(DischargeWard);

        const records = await MedicalHistory.find(filter);
        res.render('medic', { records, query: req.query });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/delete-record', async (req, res) => {
    try {
        const { recordId } = req.body;
        if (!recordId || typeof recordId !== 'string') {
            return res.status(400).send('Invalid RecordID');
        }
        const result = await MedicalHistory.deleteOne({ RecordID: recordId });
        res.redirect('/medic');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Patient Routes
app.get('/patients', async (req, res) => {
    try {
        const { PatientID, FirstName, LastName, Address, Blood_Grp, Ward_Id } = req.query;
        const filter = {};
        if (PatientID) filter.PatientID = Number(PatientID);
        if (FirstName) filter.FirstName = { $regex: FirstName, $options: 'i' };
        if (LastName) filter.LastName = { $regex: LastName, $options: 'i' };
        if (Address) filter.Address = { $regex: Address, $options: 'i' };
        if (Blood_Grp) filter.Blood_Grp = { $regex: Blood_Grp, $options: 'i' };
        if (Ward_Id) filter.Ward_Id = Number(Ward_Id);

        const patients = await Patient.find(filter);
        res.render('patients', { patients, query: req.query });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/delete-patient', async (req, res) => {
    try {
        const { patientId } = req.body;
        const numericPatientId = Number(patientId);
        if (isNaN(numericPatientId)) {
            return res.status(400).send('Invalid PatientID');
        }
        const result = await Patient.deleteOne({ PatientID: numericPatientId });
        res.redirect('/patients');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Doctor Routes
app.get('/doctors', async (req, res) => {
    try {
        const { DoctorID, FirstName, LastName, Address, Ward_Id } = req.query;
        const filter = {};
        if (DoctorID) filter.DoctorID = Number(DoctorID);
        if (FirstName) filter.FirstName = { $regex: FirstName, $options: 'i' };
        if (LastName) filter.LastName = { $regex: LastName, $options: 'i' };
        if (Address) filter.Address = { $regex: Address, $options: 'i' };
        if (Ward_Id) filter.Ward_Id = Number(Ward_Id);

        const doctors = await Doctor.find(filter);
        res.render('doctors', { doctors, query: req.query });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/delete-doctor', async (req, res) => {
    try {
        const { DoctorID } = req.body; // Use DoctorID (case-sensitive)

        // Convert DoctorID to a number
        const numericDoctorID = Number(DoctorID);

        // Check if the conversion was successful
        if (isNaN(numericDoctorID)) {
            return res.status(400).json({ success: false, message: 'Invalid DoctorID. It must be a number.' });
        }

        // Delete the doctor from the database
        const result = await Doctor.deleteOne({ DoctorID: numericDoctorID });

        // Check if a doctor was deleted
        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: 'No doctor found with the provided DoctorID.' });
        }

        // Redirect to the same page with query parameters preserved
        const refererUrl = req.headers.referer || '/doctors'; // Get the referring URL
        const url = new URL(refererUrl, `http://${req.headers.host}`);
        const queryParams = url.searchParams.toString(); // Preserve query parameters
        res.redirect(`/doctors?${queryParams}`);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Ward Routes
app.get('/ward-details', async (req, res) => {
    try {
        const { WardID, WardName } = req.query;

        // Build a filter for the query
        const filter = {};
        if (WardID) filter.WardID = Number(WardID);
        if (WardName) filter.WardName = { $regex: WardName, $options: 'i' };

        // Fetch filtered wards from the database
        const wards = await Ward.find(filter);

        // Render the 'ward-Details' view with the fetched data and query parameters
        res.render('ward-Details', { wards, query: req.query, editing: req.query.editing ? Number(req.query.editing) : null });; // Pass editing as null
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});
// Route to handle ward updates
app.post('/update-ward', async (req, res) => {
    const { WardID, WardName, Total_Beds, Avail_Beds, Ward_Charge } = req.body;

    try {
        // Find the ward by WardID and update the fields
        const updatedWard = await Ward.findOneAndUpdate(
            { WardID: WardID },
            {
                WardName: WardName,
                Total_Beds: Total_Beds,
                Avail_Beds: Avail_Beds,
                Ward_Charge: Ward_Charge,
            },
            { new: true } // Return the updated document
        );

        if (!updatedWard) {
            return res.status(404).send('Ward not found');
        }

        res.redirect('/ward-details'); // Redirect back to the ward details page
    } catch (error) {
        console.error('Error updating ward:', error);
        res.status(500).send('Internal Server Error');
    }
});


// Payment Routes
app.get('/payment', async (req, res) => {
    try {
        // Extract query parameters for advanced search
        const { PaymentID, PatientID, PaymentDate, PaymentMethod, CC_Num, CardHoldersName, Check_Num } = req.query;

        // Build a MongoDB filter object dynamically for advanced search
        const filter = {};
        if (PaymentID) filter.PaymentID = PaymentID;
        if (PatientID) filter.PatientID = Number(PatientID);
        if (PaymentDate) filter.PaymentDate = PaymentDate;
        if (PaymentMethod) filter.PaymentMethod = { $regex: PaymentMethod, $options: 'i' };
        if (CC_Num) filter.CC_Num = CC_Num;
        if (CardHoldersName) filter.CardHoldersName = { $regex: CardHoldersName, $options: 'i' };
        if (Check_Num) filter.Check_Num = Check_Num;

        // Fetch filtered payments from the PaymentDetails collection
        const payments = await PaymentDetails.find(filter);

        // Render the 'payment' view with the fetched data and query parameters
        res.render('payment', { payments, query: req.query });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});





// ------------------------- ADD ROUTES ------------------------- //

// Add Doctor
app.post('/add-doctor', async (req, res) => {
    try {
        const { firstName, lastName, address, phone, employmentType, specialization } = req.body;

        // Generate a unique DoctorID
        let doctorID;
        let isUnique = false;

        while (!isUnique) {
            doctorID = Math.floor(Math.random() * 10000); // Random DoctorID between 0 and 9999
            const existingDoctor = await Doctor.findOne({ DoctorID: doctorID });
            if (!existingDoctor) {
                isUnique = true; // DoctorID is unique
            }
        }

        // Assign a valid Ward_Id (between 125 and 140)
        const wardId = Math.floor(Math.random() * (140 - 125 + 1)) + 125;

        // Create a new doctor
        const newDoctor = new Doctor({
            DoctorID: doctorID, // Unique DoctorID
            FirstName: firstName,
            LastName: lastName,
            Address: address,
            Phone_Num: phone,
            Employment_Type: employmentType,
            Ward_Id: wardId, // Valid Ward_Id
            Specialization: specialization,
        });

        // Save the new doctor to the database
        await newDoctor.save();

        // Construct success message
        const successMessage = `Your DoctorID is ${doctorID}, and you've been assigned to Ward ${wardId}.`;

        // Send success response
        res.json({ success: true, message: successMessage });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
// Add Patient
app.post('/add-patient', async (req, res) => {
    try {
        const { firstName, lastName, address, phone, age, height, weight, bloodGroup, admitDate, dischargeDate, treatmentType } = req.body;

        // Fetch all doctors from the database
        const doctors = await Doctor.find({}, { DoctorID: 1, Ward_Id: 1 });

        // Check if there are any doctors in the database
        if (doctors.length === 0) {
            return res.status(400).json({ success: false, message: 'No doctors available in the system.' });
        }

        // Randomly select a doctor
        const randomIndex = Math.floor(Math.random() * doctors.length);
        const { DoctorID, Ward_Id } = doctors[randomIndex];

        // Create a new patient with the assigned DoctorID and Ward_Id
        const newPatient = new Patient({
            PatientID: Math.floor(Math.random() * 10000), // Random PatientID
            FirstName: firstName,
            LastName: lastName,
            Address: address,
            Age: age,
            Height: height,
            Weight: weight,
            Blood_Grp: bloodGroup,
            Admit_Date: admitDate,
            Discharge_Date: dischargeDate,
            Treatment_Type: treatmentType,
            DoctorID: DoctorID, // Assign the DoctorID of the selected doctor
            Ward_Id: Ward_Id,   // Assign the Ward_Id of the selected doctor
            Phone_Num: phone,
        });

        // Save the new patient to the database
        await newPatient.save();

        // Construct success message
        const successMessage = `Your PatientID is ${newPatient.PatientID}. You've been assigned to DoctorID ${DoctorID} in Ward ${Ward_Id}.`;

        // Send success response
        res.json({ success: true, message: successMessage });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Add Medical Record
app.post('/add-medic', async (req, res) => {
    try {
        const { patientID, doctorID, disease, originalWard, dischargeWard } = req.body;

        // Generate a unique RecordID
        const recordID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });

        // Create a new medical record
        const newMedicalRecord = new MedicalHistory({
            RecordID: recordID,
            PatientID: patientID,
            DoctorID: doctorID,
            Disease: disease,
            OriginalWard: originalWard,
            DischargeWard: dischargeWard,
        });

        // Save the new medical record to the database
        await newMedicalRecord.save();

        // Construct success message with RecordID
        const successMessage = `Data submitted successfully. The RecordID for this session is ${recordID}.`;

        // Send success response
        res.json({ success: true, message: successMessage });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

app.post('/add-payment', async (req, res) => {
    try {
        const { patientID, paymentDate, paymentMethod, ccNum, cardHolderName, checkNum, advancePayment, finalPayment, paymentStatus } = req.body;

        // Calculate TotalBill
        const totalBill = parseFloat(advancePayment) + parseFloat(finalPayment);

        // Generate a PaymentID
        const paymentID = 'PAY' + Math.floor(Math.random() * 10000); // Random PaymentID

        // Create a new payment
        const newPayment = new PaymentDetails({
            PaymentID: paymentID,
            PatientID: patientID,
            PaymentDate: paymentDate,
            PaymentMethod: paymentMethod,
            CC_Num: ccNum,
            CardHoldersName: cardHolderName,
            Check_Num: checkNum,
            AdvancePayment: advancePayment,
            FinalPayment: finalPayment,
            TotalBill: totalBill, // Add TotalBill
            PaymentStatus: paymentStatus,
        });

        // Save the new payment to the PaymentDetails collection
        await newPayment.save();

        // Construct success message with PaymentID
        const successMessage = `Payment made successfully. PaymentID: ${paymentID}.`;

        // Send success response
        res.json({ success: true, message: successMessage });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
// Add Ward


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});