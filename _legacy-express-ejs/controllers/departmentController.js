const pool = require('../config/db');

exports.index = async (req, res) => {
    try {
        const [departments] = await pool.execute(`
            SELECT dept.*, u.name AS head_doctor_name,
                   (SELECT COUNT(*) FROM doctors WHERE department_id = dept.id) AS doctor_count,
                   (SELECT COUNT(*) FROM staff WHERE department_id = dept.id) AS staff_count
            FROM departments dept
            LEFT JOIN doctors d ON d.id = dept.head_doctor_id
            LEFT JOIN users u ON u.id = d.user_id
            ORDER BY dept.name ASC
        `);

        res.render('departments/index', { title: 'Departments', user: req.session.user, departments });
    } catch (err) {
        console.error('Departments index error:', err);
        req.flash('error', 'Unable to load departments.');
        res.render('departments/index', { title: 'Departments', user: req.session.user, departments: [] });
    }
};

exports.showAdd = async (req, res) => {
    try {
        const [doctors] = await pool.execute(`
            SELECT d.id, u.name FROM doctors d JOIN users u ON u.id = d.user_id ORDER BY u.name ASC
        `);
        res.render('departments/add', { title: 'Add Department', user: req.session.user, doctors, formData: {}, errors: [] });
    } catch (err) {
        console.error('Department add form error:', err);
        req.flash('error', 'Unable to load form.');
        res.redirect('/departments');
    }
};

exports.create = async (req, res) => {
    const { name, description, head_doctor_id } = req.body;
    const errors = [];
    if (!name || !name.trim()) errors.push('Department name is required.');

    if (errors.length) {
        const [doctors] = await pool.execute(`SELECT d.id, u.name FROM doctors d JOIN users u ON u.id = d.user_id ORDER BY u.name ASC`);
        return res.render('departments/add', { title: 'Add Department', user: req.session.user, doctors, formData: req.body, errors });
    }

    try {
        await pool.execute(
            'INSERT INTO departments (name, description, head_doctor_id) VALUES (?, ?, ?)',
            [name.trim(), description || null, head_doctor_id || null]
        );
        req.flash('success', `Department "${name.trim()}" created successfully.`);
        res.redirect('/departments');
    } catch (err) {
        console.error('Department create error:', err);
        const [doctors] = await pool.execute(`SELECT d.id, u.name FROM doctors d JOIN users u ON u.id = d.user_id ORDER BY u.name ASC`);
        const errMsg = err.code === 'ER_DUP_ENTRY' ? 'A department with this name already exists.' : 'Something went wrong while saving the department.';
        res.render('departments/add', { title: 'Add Department', user: req.session.user, doctors, formData: req.body, errors: [errMsg] });
    }
};

exports.showEdit = async (req, res) => {
    try {
        const [[department]] = await pool.execute('SELECT * FROM departments WHERE id = ?', [req.params.id]);
        if (!department) {
            req.flash('error', 'Department not found.');
            return res.redirect('/departments');
        }
        const [doctors] = await pool.execute(`SELECT d.id, u.name FROM doctors d JOIN users u ON u.id = d.user_id ORDER BY u.name ASC`);
        res.render('departments/edit', { title: 'Edit Department', user: req.session.user, department, doctors, errors: [] });
    } catch (err) {
        console.error('Department edit form error:', err);
        req.flash('error', 'Unable to load department.');
        res.redirect('/departments');
    }
};

exports.update = async (req, res) => {
    const { id } = req.params;
    const { name, description, head_doctor_id } = req.body;
    const errors = [];
    if (!name || !name.trim()) errors.push('Department name is required.');

    if (errors.length) {
        const [doctors] = await pool.execute(`SELECT d.id, u.name FROM doctors d JOIN users u ON u.id = d.user_id ORDER BY u.name ASC`);
        return res.render('departments/edit', {
            title: 'Edit Department', user: req.session.user, doctors, errors,
            department: { id, name, description, head_doctor_id }
        });
    }

    try {
        await pool.execute(
            'UPDATE departments SET name = ?, description = ?, head_doctor_id = ? WHERE id = ?',
            [name.trim(), description || null, head_doctor_id || null, id]
        );
        req.flash('success', 'Department updated successfully.');
        res.redirect('/departments');
    } catch (err) {
        console.error('Department update error:', err);
        req.flash('error', 'Unable to update department.');
        res.redirect(`/departments/${id}/edit`);
    }
};

exports.delete = async (req, res) => {
    try {
        await pool.execute('DELETE FROM departments WHERE id = ?', [req.params.id]);
        req.flash('success', 'Department deleted.');
    } catch (err) {
        console.error('Department delete error:', err);
        req.flash('error', 'Unable to delete department. It may still be referenced by other records.');
    }
    res.redirect('/departments');
};
