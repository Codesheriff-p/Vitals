const pool = require('../config/db');

const APPOINTMENT_TYPES = ['Consultation', 'Follow-up', 'Emergency', 'Routine Checkup'];

async function generateAppointmentNumber() {
    const [[{ maxId }]] = await pool.execute('SELECT COALESCE(MAX(id), 0) AS maxId FROM appointments');
    const next = maxId + 1;
    return 'APT-' + String(next).padStart(4, '0');
}

async function getDoctorIdForUser(userId) {
    const [[row]] = await pool.execute('SELECT id FROM doctors WHERE user_id = ?', [userId]);
    return row ? row.id : null;
}

exports.index = async (req, res) => {
    try {
        const status = req.query.status || '';
        const date = req.query.date || '';

        let sql = `
            SELECT a.*, p.first_name AS patient_first_name, p.last_name AS patient_last_name, p.patient_number,
                   u.name AS doctor_name, dept.name AS department_name
            FROM appointments a
            JOIN patients p ON p.id = a.patient_id
            JOIN doctors d ON d.id = a.doctor_id
            JOIN users u ON u.id = d.user_id
            LEFT JOIN departments dept ON dept.id = a.department_id
            WHERE 1 = 1
        `;
        const params = [];

        if (req.session.user.role === 'doctor') {
            const doctorId = await getDoctorIdForUser(req.session.user.id);
            sql += ' AND a.doctor_id = ?';
            params.push(doctorId || 0);
        }

        if (status) {
            sql += ' AND a.status = ?';
            params.push(status);
        }
        if (date) {
            sql += ' AND a.appointment_date = ?';
            params.push(date);
        }

        sql += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';

        const [appointments] = await pool.execute(sql, params);

        res.render('appointments/index', {
            title: 'Appointments', user: req.session.user, appointments, status, date
        });
    } catch (err) {
        console.error('Appointments index error:', err);
        req.flash('error', 'Unable to load appointments.');
        res.render('appointments/index', { title: 'Appointments', user: req.session.user, appointments: [], status: '', date: '' });
    }
};

exports.showAdd = async (req, res) => {
    try {
        const [patients] = await pool.execute('SELECT id, patient_number, first_name, last_name FROM patients ORDER BY first_name ASC');
        const [doctors] = await pool.execute(`
            SELECT d.id, d.department_id, u.name, dept.name AS department_name
            FROM doctors d JOIN users u ON u.id = d.user_id
            LEFT JOIN departments dept ON dept.id = d.department_id
            WHERE d.status = 'active'
            ORDER BY u.name ASC
        `);

        res.render('appointments/add', {
            title: 'New Appointment', user: req.session.user, patients, doctors, APPOINTMENT_TYPES,
            formData: { patient_id: req.query.patient_id || '' }, errors: []
        });
    } catch (err) {
        console.error('Appointment add form error:', err);
        req.flash('error', 'Unable to load form.');
        res.redirect('/appointments');
    }
};

exports.create = async (req, res) => {
    const { patient_id, doctor_id, appointment_date, appointment_time, type, notes } = req.body;

    const errors = [];
    if (!patient_id) errors.push('Please select a patient.');
    if (!doctor_id) errors.push('Please select a doctor.');
    if (!appointment_date) errors.push('Appointment date is required.');
    if (!appointment_time) errors.push('Appointment time is required.');

    try {
        if (!errors.length) {
            const [conflicts] = await pool.execute(
                `SELECT id FROM appointments
                 WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND status = 'scheduled'`,
                [doctor_id, appointment_date, appointment_time]
            );
            if (conflicts.length) {
                errors.push('This doctor already has a scheduled appointment at that date and time.');
            }
        }

        if (errors.length) {
            const [patients] = await pool.execute('SELECT id, patient_number, first_name, last_name FROM patients ORDER BY first_name ASC');
            const [doctors] = await pool.execute(`
                SELECT d.id, d.department_id, u.name, dept.name AS department_name
                FROM doctors d JOIN users u ON u.id = d.user_id
                LEFT JOIN departments dept ON dept.id = d.department_id
                WHERE d.status = 'active'
                ORDER BY u.name ASC
            `);
            return res.render('appointments/add', {
                title: 'New Appointment', user: req.session.user, patients, doctors, APPOINTMENT_TYPES, formData: req.body, errors
            });
        }

        const [[doctorRow]] = await pool.execute('SELECT department_id FROM doctors WHERE id = ?', [doctor_id]);
        const appointmentNumber = await generateAppointmentNumber();

        await pool.execute(
            `INSERT INTO appointments
                (appointment_number, patient_id, doctor_id, department_id, appointment_date, appointment_time, type, status, notes, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled', ?, ?)`,
            [
                appointmentNumber, patient_id, doctor_id, doctorRow ? doctorRow.department_id : null,
                appointment_date, appointment_time, type || 'Consultation', notes || null, req.session.user.id
            ]
        );

        req.flash('success', `Appointment ${appointmentNumber} scheduled successfully.`);
        res.redirect('/appointments');
    } catch (err) {
        console.error('Appointment create error:', err);
        req.flash('error', 'Something went wrong while scheduling the appointment.');
        res.redirect('/appointments/add');
    }
};

exports.view = async (req, res) => {
    try {
        const [[appointment]] = await pool.execute(`
            SELECT a.*, p.first_name AS patient_first_name, p.last_name AS patient_last_name, p.patient_number, p.phone AS patient_phone,
                   u.name AS doctor_name, dept.name AS department_name
            FROM appointments a
            JOIN patients p ON p.id = a.patient_id
            JOIN doctors d ON d.id = a.doctor_id
            JOIN users u ON u.id = d.user_id
            LEFT JOIN departments dept ON dept.id = a.department_id
            WHERE a.id = ?
        `, [req.params.id]);

        if (!appointment) {
            req.flash('error', 'Appointment not found.');
            return res.redirect('/appointments');
        }

        res.render('appointments/view', { title: appointment.appointment_number, user: req.session.user, appointment });
    } catch (err) {
        console.error('Appointment view error:', err);
        req.flash('error', 'Unable to load appointment.');
        res.redirect('/appointments');
    }
};

exports.showEdit = async (req, res) => {
    try {
        const [[appointment]] = await pool.execute('SELECT * FROM appointments WHERE id = ?', [req.params.id]);
        if (!appointment) {
            req.flash('error', 'Appointment not found.');
            return res.redirect('/appointments');
        }

        const [patients] = await pool.execute('SELECT id, patient_number, first_name, last_name FROM patients ORDER BY first_name ASC');
        const [doctors] = await pool.execute(`
            SELECT d.id, u.name FROM doctors d JOIN users u ON u.id = d.user_id ORDER BY u.name ASC
        `);

        res.render('appointments/edit', {
            title: 'Edit Appointment', user: req.session.user, appointment, patients, doctors, APPOINTMENT_TYPES, errors: []
        });
    } catch (err) {
        console.error('Appointment edit form error:', err);
        req.flash('error', 'Unable to load appointment.');
        res.redirect('/appointments');
    }
};

exports.update = async (req, res) => {
    const { id } = req.params;
    const { patient_id, doctor_id, appointment_date, appointment_time, type, status, notes } = req.body;

    const errors = [];
    if (!patient_id) errors.push('Please select a patient.');
    if (!doctor_id) errors.push('Please select a doctor.');
    if (!appointment_date) errors.push('Appointment date is required.');
    if (!appointment_time) errors.push('Appointment time is required.');

    if (errors.length) {
        const [patients] = await pool.execute('SELECT id, patient_number, first_name, last_name FROM patients ORDER BY first_name ASC');
        const [doctors] = await pool.execute(`SELECT d.id, u.name FROM doctors d JOIN users u ON u.id = d.user_id ORDER BY u.name ASC`);
        return res.render('appointments/edit', {
            title: 'Edit Appointment', user: req.session.user, patients, doctors, APPOINTMENT_TYPES, errors,
            appointment: { id, patient_id, doctor_id, appointment_date, appointment_time, type, status, notes }
        });
    }

    try {
        const [[doctorRow]] = await pool.execute('SELECT department_id FROM doctors WHERE id = ?', [doctor_id]);

        await pool.execute(
            `UPDATE appointments SET
                patient_id = ?, doctor_id = ?, department_id = ?, appointment_date = ?, appointment_time = ?,
                type = ?, status = ?, notes = ?
             WHERE id = ?`,
            [
                patient_id, doctor_id, doctorRow ? doctorRow.department_id : null, appointment_date, appointment_time,
                type || 'Consultation', status || 'scheduled', notes || null, id
            ]
        );

        req.flash('success', 'Appointment updated successfully.');
        res.redirect(`/appointments/${id}`);
    } catch (err) {
        console.error('Appointment update error:', err);
        req.flash('error', 'Unable to update appointment.');
        res.redirect(`/appointments/${id}/edit`);
    }
};

exports.delete = async (req, res) => {
    try {
        await pool.execute('DELETE FROM appointments WHERE id = ?', [req.params.id]);
        req.flash('success', 'Appointment deleted.');
    } catch (err) {
        console.error('Appointment delete error:', err);
        req.flash('error', 'Unable to delete appointment.');
    }
    res.redirect('/appointments');
};
