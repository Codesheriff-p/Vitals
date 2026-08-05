const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const STAFF_ROLES = ['nurse', 'pharmacist', 'lab_technician', 'receptionist'];

exports.index = async (req, res) => {
    try {
        const roleFilter = STAFF_ROLES.includes(req.query.role) ? req.query.role : '';
        let sql = `
            SELECT s.*, u.name, u.email, u.role, u.status AS account_status, dept.name AS department_name
            FROM staff s
            JOIN users u ON u.id = s.user_id
            LEFT JOIN departments dept ON dept.id = s.department_id
        `;
        const params = [];
        if (roleFilter) {
            sql += ' WHERE u.role = ?';
            params.push(roleFilter);
        }
        sql += ' ORDER BY u.name ASC';

        const [staff] = await pool.execute(sql, params);

        res.render('staff/index', { title: 'Staff', user: req.session.user, staff, roleFilter, STAFF_ROLES });
    } catch (err) {
        console.error('Staff index error:', err);
        req.flash('error', 'Unable to load staff.');
        res.render('staff/index', { title: 'Staff', user: req.session.user, staff: [], roleFilter: '', STAFF_ROLES });
    }
};

exports.showAdd = async (req, res) => {
    try {
        const [departments] = await pool.execute('SELECT id, name FROM departments ORDER BY name ASC');
        res.render('staff/add', { title: 'Add Staff', user: req.session.user, departments, STAFF_ROLES, formData: {}, errors: [] });
    } catch (err) {
        console.error('Staff add form error:', err);
        req.flash('error', 'Unable to load form.');
        res.redirect('/staff');
    }
};

exports.create = async (req, res) => {
    const { name, email, password, role, department_id, role_title, phone } = req.body;

    const errors = [];
    if (!name || !name.trim()) errors.push('Full name is required.');
    if (!email || !email.trim()) errors.push('Email is required.');
    if (!password || password.length < 6) errors.push('Password must be at least 6 characters.');
    if (!STAFF_ROLES.includes(role)) errors.push('Please select a valid staff role.');

    if (errors.length) {
        const [departments] = await pool.execute('SELECT id, name FROM departments ORDER BY name ASC');
        return res.render('staff/add', { title: 'Add Staff', user: req.session.user, departments, STAFF_ROLES, formData: req.body, errors });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [existing] = await connection.execute('SELECT id FROM users WHERE email = ?', [email.trim()]);
        if (existing.length) {
            await connection.rollback();
            connection.release();
            const [departments] = await pool.execute('SELECT id, name FROM departments ORDER BY name ASC');
            return res.render('staff/add', {
                title: 'Add Staff', user: req.session.user, departments, STAFF_ROLES, formData: req.body,
                errors: ['A user with this email already exists.']
            });
        }

        const hashed = await bcrypt.hash(password, 10);
        const [userResult] = await connection.execute(
            'INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
            [name.trim(), email.trim(), hashed, role, 'active']
        );

        await connection.execute(
            `INSERT INTO staff (user_id, department_id, role_title, phone, status) VALUES (?, ?, ?, ?, 'active')`,
            [userResult.insertId, department_id || null, role_title || null, phone || null]
        );

        await connection.commit();
        req.flash('success', `${name.trim()} added to staff successfully.`);
        res.redirect('/staff');
    } catch (err) {
        await connection.rollback();
        console.error('Staff create error:', err);
        const [departments] = await pool.execute('SELECT id, name FROM departments ORDER BY name ASC');
        res.render('staff/add', {
            title: 'Add Staff', user: req.session.user, departments, STAFF_ROLES, formData: req.body,
            errors: ['Something went wrong while saving the staff member. Please try again.']
        });
    } finally {
        connection.release();
    }
};

exports.showEdit = async (req, res) => {
    try {
        const [[member]] = await pool.execute(`
            SELECT s.*, u.name, u.email, u.role, u.status AS account_status
            FROM staff s
            JOIN users u ON u.id = s.user_id
            WHERE s.id = ?
        `, [req.params.id]);

        if (!member) {
            req.flash('error', 'Staff member not found.');
            return res.redirect('/staff');
        }

        const [departments] = await pool.execute('SELECT id, name FROM departments ORDER BY name ASC');
        res.render('staff/edit', { title: 'Edit Staff', user: req.session.user, member, departments, STAFF_ROLES, errors: [] });
    } catch (err) {
        console.error('Staff edit form error:', err);
        req.flash('error', 'Unable to load staff member.');
        res.redirect('/staff');
    }
};

exports.update = async (req, res) => {
    const { id } = req.params;
    const { name, email, role, department_id, role_title, phone, status } = req.body;

    const errors = [];
    if (!name || !name.trim()) errors.push('Full name is required.');
    if (!email || !email.trim()) errors.push('Email is required.');
    if (!STAFF_ROLES.includes(role)) errors.push('Please select a valid staff role.');

    if (errors.length) {
        const [departments] = await pool.execute('SELECT id, name FROM departments ORDER BY name ASC');
        return res.render('staff/edit', {
            title: 'Edit Staff', user: req.session.user, departments, STAFF_ROLES, errors,
            member: { id, name, email, role, department_id, role_title, phone, account_status: status }
        });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [[staffRow]] = await connection.execute('SELECT user_id FROM staff WHERE id = ?', [id]);
        if (!staffRow) {
            await connection.rollback();
            connection.release();
            req.flash('error', 'Staff member not found.');
            return res.redirect('/staff');
        }

        await connection.execute('UPDATE users SET name = ?, email = ?, role = ?, status = ? WHERE id = ?', [
            name.trim(), email.trim(), role, status || 'active', staffRow.user_id
        ]);

        await connection.execute(
            `UPDATE staff SET department_id = ?, role_title = ?, phone = ?, status = ? WHERE id = ?`,
            [department_id || null, role_title || null, phone || null, status || 'active', id]
        );

        await connection.commit();
        req.flash('success', 'Staff details updated successfully.');
        res.redirect('/staff');
    } catch (err) {
        await connection.rollback();
        console.error('Staff update error:', err);
        req.flash('error', 'Unable to update staff member.');
        res.redirect(`/staff/${id}/edit`);
    } finally {
        connection.release();
    }
};

exports.delete = async (req, res) => {
    try {
        const [[staffRow]] = await pool.execute('SELECT user_id FROM staff WHERE id = ?', [req.params.id]);
        if (staffRow) {
            await pool.execute('DELETE FROM users WHERE id = ?', [staffRow.user_id]);
        }
        req.flash('success', 'Staff member removed successfully.');
    } catch (err) {
        console.error('Staff delete error:', err);
        req.flash('error', 'Unable to delete staff member. They may have linked records.');
    }
    res.redirect('/staff');
};
