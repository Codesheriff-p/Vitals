const pool = require('../config/db');

async function generatePatientNumber() {
    const [[{ maxId }]] = await pool.execute('SELECT COALESCE(MAX(id), 0) AS maxId FROM patients');
    const next = maxId + 1;
    return 'PAT-' + String(next).padStart(4, '0');
}

exports.index = async (req, res) => {
    try {
        const search = (req.query.search || '').trim();
        let sql = 'SELECT * FROM patients';
        const params = [];

        if (search) {
            sql += ' WHERE first_name LIKE ? OR last_name LIKE ? OR patient_number LIKE ? OR phone LIKE ?';
            const like = `%${search}%`;
            params.push(like, like, like, like);
        }

        sql += ' ORDER BY created_at DESC';

        const [patients] = await pool.execute(sql, params);

        res.render('patients/index', {
            title: 'Patients',
            user: req.session.user,
            patients,
            search
        });
    } catch (err) {
        console.error('Patients index error:', err);
        req.flash('error', 'Unable to load patients.');
        res.render('patients/index', { title: 'Patients', user: req.session.user, patients: [], search: '' });
    }
};

exports.showAdd = (req, res) => {
    res.render('patients/add', { title: 'Add Patient', user: req.session.user, formData: {}, errors: [] });
};

exports.create = async (req, res) => {
    const {
        first_name, last_name, dob, gender, blood_group,
        phone, email, address, next_of_kin, next_of_kin_phone
    } = req.body;

    const errors = [];
    if (!first_name || !first_name.trim()) errors.push('First name is required.');
    if (!last_name || !last_name.trim()) errors.push('Last name is required.');
    if (!phone || !phone.trim()) errors.push('Phone number is required.');
    if (!gender) errors.push('Gender is required.');

    if (errors.length) {
        return res.render('patients/add', { title: 'Add Patient', user: req.session.user, formData: req.body, errors });
    }

    try {
        const patientNumber = await generatePatientNumber();

        await pool.execute(
            `INSERT INTO patients
                (patient_number, first_name, last_name, dob, gender, blood_group, phone, email, address, next_of_kin, next_of_kin_phone, registered_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                patientNumber, first_name.trim(), last_name.trim(), dob || null, gender,
                blood_group || null, phone.trim(), email || null, address || null,
                next_of_kin || null, next_of_kin_phone || null, req.session.user.id
            ]
        );

        req.flash('success', `Patient ${patientNumber} registered successfully.`);
        res.redirect('/patients');
    } catch (err) {
        console.error('Patient create error:', err);
        res.render('patients/add', {
            title: 'Add Patient',
            user: req.session.user,
            formData: req.body,
            errors: ['Something went wrong while saving the patient. Please try again.']
        });
    }
};

exports.view = async (req, res) => {
    try {
        const [[patient]] = await pool.execute('SELECT * FROM patients WHERE id = ?', [req.params.id]);
        if (!patient) {
            req.flash('error', 'Patient not found.');
            return res.redirect('/patients');
        }

        const [appointments] = await pool.execute(`
            SELECT a.*, u.name AS doctor_name
            FROM appointments a
            JOIN doctors d ON d.id = a.doctor_id
            JOIN users u ON u.id = d.user_id
            WHERE a.patient_id = ?
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
        `, [patient.id]);

        const [medicalRecords] = await pool.execute(`
            SELECT mr.*, u.name AS doctor_name
            FROM medical_records mr
            JOIN doctors d ON d.id = mr.doctor_id
            JOIN users u ON u.id = d.user_id
            WHERE mr.patient_id = ?
            ORDER BY mr.created_at DESC
        `, [patient.id]);

        const [bills] = await pool.execute(
            'SELECT * FROM bills WHERE patient_id = ? ORDER BY created_at DESC',
            [patient.id]
        );

        res.render('patients/view', {
            title: `${patient.first_name} ${patient.last_name}`,
            user: req.session.user,
            patient, appointments, medicalRecords, bills
        });
    } catch (err) {
        console.error('Patient view error:', err);
        req.flash('error', 'Unable to load patient details.');
        res.redirect('/patients');
    }
};

exports.showEdit = async (req, res) => {
    try {
        const [[patient]] = await pool.execute('SELECT * FROM patients WHERE id = ?', [req.params.id]);
        if (!patient) {
            req.flash('error', 'Patient not found.');
            return res.redirect('/patients');
        }
        res.render('patients/edit', { title: 'Edit Patient', user: req.session.user, patient, errors: [] });
    } catch (err) {
        console.error('Patient edit form error:', err);
        req.flash('error', 'Unable to load patient.');
        res.redirect('/patients');
    }
};

exports.update = async (req, res) => {
    const { id } = req.params;
    const {
        first_name, last_name, dob, gender, blood_group,
        phone, email, address, next_of_kin, next_of_kin_phone
    } = req.body;

    const errors = [];
    if (!first_name || !first_name.trim()) errors.push('First name is required.');
    if (!last_name || !last_name.trim()) errors.push('Last name is required.');
    if (!phone || !phone.trim()) errors.push('Phone number is required.');
    if (!gender) errors.push('Gender is required.');

    if (errors.length) {
        return res.render('patients/edit', {
            title: 'Edit Patient',
            user: req.session.user,
            patient: { id, first_name, last_name, dob, gender, blood_group, phone, email, address, next_of_kin, next_of_kin_phone },
            errors
        });
    }

    try {
        await pool.execute(
            `UPDATE patients SET
                first_name = ?, last_name = ?, dob = ?, gender = ?, blood_group = ?,
                phone = ?, email = ?, address = ?, next_of_kin = ?, next_of_kin_phone = ?
             WHERE id = ?`,
            [
                first_name.trim(), last_name.trim(), dob || null, gender, blood_group || null,
                phone.trim(), email || null, address || null, next_of_kin || null, next_of_kin_phone || null,
                id
            ]
        );

        req.flash('success', 'Patient details updated successfully.');
        res.redirect(`/patients/${id}`);
    } catch (err) {
        console.error('Patient update error:', err);
        req.flash('error', 'Unable to update patient.');
        res.redirect(`/patients/${id}/edit`);
    }
};

exports.delete = async (req, res) => {
    try {
        await pool.execute('DELETE FROM patients WHERE id = ?', [req.params.id]);
        req.flash('success', 'Patient record deleted.');
    } catch (err) {
        console.error('Patient delete error:', err);
        req.flash('error', 'Unable to delete patient. They may have linked records (appointments, bills, etc).');
    }
    res.redirect('/patients');
};
