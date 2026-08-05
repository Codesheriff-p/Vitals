const bcrypt = require('bcryptjs');
const pool = require('../config/db');

exports.index = async (req, res) => {
    try {
        const departmentId = req.query.department_id || '';
        let sql = `
            SELECT d.*, u.name, u.email, u.status AS account_status, dept.name AS department_name
            FROM doctors d
            JOIN users u ON u.id = d.user_id
            LEFT JOIN departments dept ON dept.id = d.department_id
        `;
        const params = [];
        if (departmentId) {
            sql += ' WHERE d.department_id = ?';
            params.push(departmentId);
        }
        sql += ' ORDER BY u.name ASC';

        const [doctors] = await pool.execute(sql, params);
        const [departments] = await pool.execute('SELECT id, name FROM departments ORDER BY name ASC');

        res.render('doctors/index', {
            title: 'Doctors',
            user: req.session.user,
            doctors,
            departments,
            departmentId
        });
    } catch (err) {
        console.error('Doctors index error:', err);
        req.flash('error', 'Unable to load doctors.');
        res.render('doctors/index', { title: 'Doctors', user: req.session.user, doctors: [], departments: [], departmentId: '' });
    }
};

exports.showAdd = async (req, res) => {
    try {
        const [departments] = await pool.execute('SELECT id, name FROM departments ORDER BY name ASC');
        res.render('doctors/add', { title: 'Add Doctor', user: req.session.user, departments, formData: {}, errors: [] });
    } catch (err) {
        console.error('Doctor add form error:', err);
        req.flash('error', 'Unable to load form.');
        res.redirect('/doctors');
    }
};

exports.create = async (req, res) => {
    const {
        name, email, password, specialization, department_id, qualification, phone
    } = req.body;

    const errors = [];
    if (!name || !name.trim()) errors.push('Full name is required.');
    if (!email || !email.trim()) errors.push('Email is required.');
    if (!password || password.length < 6) errors.push('Password must be at least 6 characters.');
    if (!specialization || !specialization.trim()) errors.push('Specialization is required.');

    if (errors.length) {
        const [departments] = await pool.execute('SELECT id, name FROM departments ORDER BY name ASC');
        return res.render('doctors/add', { title: 'Add Doctor', user: req.session.user, departments, formData: req.body, errors });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [existing] = await connection.execute('SELECT id FROM users WHERE email = ?', [email.trim()]);
        if (existing.length) {
            await connection.rollback();
            connection.release();
            const [departments] = await pool.execute('SELECT id, name FROM departments ORDER BY name ASC');
            return res.render('doctors/add', {
                title: 'Add Doctor', user: req.session.user, departments, formData: req.body,
                errors: ['A user with this email already exists.']
            });
        }

        const hashed = await bcrypt.hash(password, 10);
        const [userResult] = await connection.execute(
            'INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
            [name.trim(), email.trim(), hashed, 'doctor', 'active']
        );

        await connection.execute(
            `INSERT INTO doctors (user_id, specialization, department_id, qualification, phone, status)
             VALUES (?, ?, ?, ?, ?, 'active')`,
            [userResult.insertId, specialization.trim(), department_id || null, qualification || null, phone || null]
        );

        await connection.commit();
        req.flash('success', `Dr. ${name.trim()} added successfully.`);
        res.redirect('/doctors');
    } catch (err) {
        await connection.rollback();
        console.error('Doctor create error:', err);
        const [departments] = await pool.execute('SELECT id, name FROM departments ORDER BY name ASC');
        res.render('doctors/add', {
            title: 'Add Doctor', user: req.session.user, departments, formData: req.body,
            errors: ['Something went wrong while saving the doctor. Please try again.']
        });
    } finally {
        connection.release();
    }
};

exports.view = async (req, res) => {
    try {
        const [[doctor]] = await pool.execute(`
            SELECT d.*, u.name, u.email, u.status AS account_status, dept.name AS department_name
            FROM doctors d
            JOIN users u ON u.id = d.user_id
            LEFT JOIN departments dept ON dept.id = d.department_id
            WHERE d.id = ?
        `, [req.params.id]);

        if (!doctor) {
            req.flash('error', 'Doctor not found.');
            return res.redirect('/doctors');
        }

        const [appointments] = await pool.execute(`
            SELECT a.*, p.first_name AS patient_first_name, p.last_name AS patient_last_name
            FROM appointments a
            JOIN patients p ON p.id = a.patient_id
            WHERE a.doctor_id = ?
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
            LIMIT 20
        `, [doctor.id]);

        res.render('doctors/view', { title: doctor.name, user: req.session.user, doctor, appointments });
    } catch (err) {
        console.error('Doctor view error:', err);
        req.flash('error', 'Unable to load doctor.');
        res.redirect('/doctors');
    }
};

exports.showEdit = async (req, res) => {
    try {
        const [[doctor]] = await pool.execute(`
            SELECT d.*, u.name, u.email, u.status AS account_status
            FROM doctors d
            JOIN users u ON u.id = d.user_id
            WHERE d.id = ?
        `, [req.params.id]);

        if (!doctor) {
            req.flash('error', 'Doctor not found.');
            return res.redirect('/doctors');
        }

        const [departments] = await pool.execute('SELECT id, name FROM departments ORDER BY name ASC');
        res.render('doctors/edit', { title: 'Edit Doctor', user: req.session.user, doctor, departments, errors: [] });
    } catch (err) {
        console.error('Doctor edit form error:', err);
        req.flash('error', 'Unable to load doctor.');
        res.redirect('/doctors');
    }
};

exports.update = async (req, res) => {
    const { id } = req.params;
    const { name, email, specialization, department_id, qualification, phone, status } = req.body;

    const errors = [];
    if (!name || !name.trim()) errors.push('Full name is required.');
    if (!email || !email.trim()) errors.push('Email is required.');
    if (!specialization || !specialization.trim()) errors.push('Specialization is required.');

    if (errors.length) {
        const [departments] = await pool.execute('SELECT id, name FROM departments ORDER BY name ASC');
        return res.render('doctors/edit', {
            title: 'Edit Doctor', user: req.session.user, departments, errors,
            doctor: { id, name, email, specialization, department_id, qualification, phone, account_status: status }
        });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [[doctorRow]] = await connection.execute('SELECT user_id FROM doctors WHERE id = ?', [id]);
        if (!doctorRow) {
            await connection.rollback();
            connection.release();
            req.flash('error', 'Doctor not found.');
            return res.redirect('/doctors');
        }

        await connection.execute('UPDATE users SET name = ?, email = ?, status = ? WHERE id = ?', [
            name.trim(), email.trim(), status || 'active', doctorRow.user_id
        ]);

        await connection.execute(
            `UPDATE doctors SET specialization = ?, department_id = ?, qualification = ?, phone = ?, status = ? WHERE id = ?`,
            [specialization.trim(), department_id || null, qualification || null, phone || null, status || 'active', id]
        );

        await connection.commit();
        req.flash('success', 'Doctor details updated successfully.');
        res.redirect(`/doctors/${id}`);
    } catch (err) {
        await connection.rollback();
        console.error('Doctor update error:', err);
        req.flash('error', 'Unable to update doctor.');
        res.redirect(`/doctors/${id}/edit`);
    } finally {
        connection.release();
    }
};

exports.delete = async (req, res) => {
    try {
        const [[doctorRow]] = await pool.execute('SELECT user_id FROM doctors WHERE id = ?', [req.params.id]);
        if (doctorRow) {
            await pool.execute('DELETE FROM users WHERE id = ?', [doctorRow.user_id]);
        }
        req.flash('success', 'Doctor removed successfully.');
    } catch (err) {
        console.error('Doctor delete error:', err);
        req.flash('error', 'Unable to delete doctor. They may have linked appointments or records.');
    }
    res.redirect('/doctors');
};
