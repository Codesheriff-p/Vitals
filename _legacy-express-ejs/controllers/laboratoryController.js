const pool = require('../config/db');

/* ------------------------------------------------------------
   Lab test catalog
   ------------------------------------------------------------ */

exports.index = async (req, res) => {
    try {
        const search = (req.query.search || '').trim();
        let sql = 'SELECT * FROM lab_tests';
        const params = [];

        if (search) {
            sql += ' WHERE test_name LIKE ?';
            params.push(`%${search}%`);
        }

        sql += ' ORDER BY test_name ASC';

        const [tests] = await pool.execute(sql, params);
        res.render('laboratory/index', { title: 'Laboratory Tests', user: req.session.user, tests, search });
    } catch (err) {
        console.error('Lab tests index error:', err);
        req.flash('error', 'Unable to load lab tests.');
        res.render('laboratory/index', { title: 'Laboratory Tests', user: req.session.user, tests: [], search: '' });
    }
};

exports.showAdd = (req, res) => {
    res.render('laboratory/add', { title: 'Add Lab Test', user: req.session.user, formData: {}, errors: [] });
};

exports.create = async (req, res) => {
    const { test_name, description, normal_range, unit, price } = req.body;

    const errors = [];
    if (!test_name || !test_name.trim()) errors.push('Test name is required.');
    if (!price || isNaN(price) || Number(price) < 0) errors.push('Price must be a valid non-negative number.');

    if (errors.length) {
        return res.render('laboratory/add', { title: 'Add Lab Test', user: req.session.user, formData: req.body, errors });
    }

    try {
        await pool.execute(
            'INSERT INTO lab_tests (test_name, description, normal_range, unit, price) VALUES (?, ?, ?, ?, ?)',
            [test_name.trim(), description || null, normal_range || null, unit || null, Number(price)]
        );
        req.flash('success', `${test_name.trim()} added to the test catalog.`);
        res.redirect('/laboratory');
    } catch (err) {
        console.error('Lab test create error:', err);
        res.render('laboratory/add', {
            title: 'Add Lab Test', user: req.session.user, formData: req.body,
            errors: ['Something went wrong while saving the test.']
        });
    }
};

exports.showEdit = async (req, res) => {
    try {
        const [[test]] = await pool.execute('SELECT * FROM lab_tests WHERE id = ?', [req.params.id]);
        if (!test) {
            req.flash('error', 'Lab test not found.');
            return res.redirect('/laboratory');
        }
        res.render('laboratory/edit', { title: 'Edit Lab Test', user: req.session.user, test, errors: [] });
    } catch (err) {
        console.error('Lab test edit form error:', err);
        req.flash('error', 'Unable to load lab test.');
        res.redirect('/laboratory');
    }
};

exports.update = async (req, res) => {
    const { id } = req.params;
    const { test_name, description, normal_range, unit, price } = req.body;

    const errors = [];
    if (!test_name || !test_name.trim()) errors.push('Test name is required.');
    if (!price || isNaN(price) || Number(price) < 0) errors.push('Price must be a valid non-negative number.');

    if (errors.length) {
        return res.render('laboratory/edit', {
            title: 'Edit Lab Test', user: req.session.user, errors,
            test: { id, test_name, description, normal_range, unit, price }
        });
    }

    try {
        await pool.execute(
            'UPDATE lab_tests SET test_name = ?, description = ?, normal_range = ?, unit = ?, price = ? WHERE id = ?',
            [test_name.trim(), description || null, normal_range || null, unit || null, Number(price), id]
        );
        req.flash('success', 'Lab test updated successfully.');
        res.redirect('/laboratory');
    } catch (err) {
        console.error('Lab test update error:', err);
        req.flash('error', 'Unable to update lab test.');
        res.redirect(`/laboratory/${id}/edit`);
    }
};

exports.delete = async (req, res) => {
    try {
        await pool.execute('DELETE FROM lab_tests WHERE id = ?', [req.params.id]);
        req.flash('success', 'Lab test removed from catalog.');
    } catch (err) {
        console.error('Lab test delete error:', err);
        req.flash('error', 'Unable to delete test. It may be referenced in existing lab requests.');
    }
    res.redirect('/laboratory');
};

/* ------------------------------------------------------------
   Lab requests
   ------------------------------------------------------------ */

async function generateRequestNumber() {
    const [[{ maxId }]] = await pool.execute('SELECT COALESCE(MAX(id), 0) AS maxId FROM lab_requests');
    const next = maxId + 1;
    return 'LAB-' + String(next).padStart(4, '0');
}

exports.requestsIndex = async (req, res) => {
    try {
        const status = req.query.status || '';
        let sql = `
            SELECT lr.*, p.first_name AS patient_first_name, p.last_name AS patient_last_name, p.patient_number,
                   u.name AS doctor_name
            FROM lab_requests lr
            JOIN patients p ON p.id = lr.patient_id
            JOIN doctors d ON d.id = lr.doctor_id
            JOIN users u ON u.id = d.user_id
        `;
        const params = [];
        if (status) {
            sql += ' WHERE lr.status = ?';
            params.push(status);
        }
        sql += ' ORDER BY lr.created_at DESC';

        const [requests] = await pool.execute(sql, params);
        res.render('laboratory/requests/index', { title: 'Lab Requests', user: req.session.user, requests, status });
    } catch (err) {
        console.error('Lab requests index error:', err);
        req.flash('error', 'Unable to load lab requests.');
        res.render('laboratory/requests/index', { title: 'Lab Requests', user: req.session.user, requests: [], status: '' });
    }
};

exports.showAddRequest = async (req, res) => {
    try {
        const [patients] = await pool.execute('SELECT id, patient_number, first_name, last_name FROM patients ORDER BY first_name ASC');
        const [doctors] = await pool.execute(`SELECT d.id, u.name FROM doctors d JOIN users u ON u.id = d.user_id ORDER BY u.name ASC`);
        const [tests] = await pool.execute('SELECT id, test_name, price FROM lab_tests ORDER BY test_name ASC');

        let doctorId = '';
        if (req.session.user.role === 'doctor') {
            const [[row]] = await pool.execute('SELECT id FROM doctors WHERE user_id = ?', [req.session.user.id]);
            if (row) doctorId = row.id;
        }

        res.render('laboratory/requests/add', {
            title: 'New Lab Request', user: req.session.user, patients, doctors, tests,
            formData: {
                patient_id: req.query.patient_id || '',
                doctor_id: doctorId || '',
                appointment_id: req.query.appointment_id || ''
            },
            errors: []
        });
    } catch (err) {
        console.error('Lab request add form error:', err);
        req.flash('error', 'Unable to load form.');
        res.redirect('/laboratory/requests');
    }
};

exports.createRequest = async (req, res) => {
    const { patient_id, doctor_id, appointment_id } = req.body;
    let { test_id } = req.body;
    test_id = Array.isArray(test_id) ? test_id : (test_id ? [test_id] : []);
    test_id = test_id.filter(Boolean);

    const errors = [];
    if (!patient_id) errors.push('Please select a patient.');
    if (!doctor_id) errors.push('Please select a doctor.');
    if (!test_id.length) errors.push('Please select at least one test.');

    if (errors.length) {
        const [patients] = await pool.execute('SELECT id, patient_number, first_name, last_name FROM patients ORDER BY first_name ASC');
        const [doctors] = await pool.execute(`SELECT d.id, u.name FROM doctors d JOIN users u ON u.id = d.user_id ORDER BY u.name ASC`);
        const [tests] = await pool.execute('SELECT id, test_name, price FROM lab_tests ORDER BY test_name ASC');
        return res.render('laboratory/requests/add', {
            title: 'New Lab Request', user: req.session.user, patients, doctors, tests, formData: req.body, errors
        });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const requestNumber = await generateRequestNumber();
        const [result] = await connection.execute(
            `INSERT INTO lab_requests (request_number, patient_id, doctor_id, appointment_id, status) VALUES (?, ?, ?, ?, 'requested')`,
            [requestNumber, patient_id, doctor_id, appointment_id || null]
        );
        const requestId = result.insertId;

        for (const t of test_id) {
            await connection.execute(
                'INSERT INTO lab_request_items (request_id, test_id, status) VALUES (?, ?, \'pending\')',
                [requestId, t]
            );
        }

        await connection.commit();
        req.flash('success', `Lab request ${requestNumber} created successfully.`);
        res.redirect(`/laboratory/requests/${requestId}`);
    } catch (err) {
        await connection.rollback();
        console.error('Lab request create error:', err);
        req.flash('error', 'Something went wrong while creating the lab request.');
        res.redirect('/laboratory/requests/add');
    } finally {
        connection.release();
    }
};

exports.viewRequest = async (req, res) => {
    try {
        const [[request]] = await pool.execute(`
            SELECT lr.*, p.first_name AS patient_first_name, p.last_name AS patient_last_name, p.patient_number,
                   u.name AS doctor_name
            FROM lab_requests lr
            JOIN patients p ON p.id = lr.patient_id
            JOIN doctors d ON d.id = lr.doctor_id
            JOIN users u ON u.id = d.user_id
            WHERE lr.id = ?
        `, [req.params.id]);

        if (!request) {
            req.flash('error', 'Lab request not found.');
            return res.redirect('/laboratory/requests');
        }

        const [items] = await pool.execute(`
            SELECT lri.*, t.test_name, t.normal_range, t.unit, t.price
            FROM lab_request_items lri
            JOIN lab_tests t ON t.id = lri.test_id
            WHERE lri.request_id = ?
        `, [request.id]);

        res.render('laboratory/requests/view', { title: request.request_number, user: req.session.user, request, items });
    } catch (err) {
        console.error('Lab request view error:', err);
        req.flash('error', 'Unable to load lab request.');
        res.redirect('/laboratory/requests');
    }
};

exports.submitResults = async (req, res) => {
    const { id } = req.params;
    const { item_id, result, result_notes } = req.body;

    const itemIds = Array.isArray(item_id) ? item_id : (item_id ? [item_id] : []);
    const results = Array.isArray(result) ? result : (result ? [result] : []);
    const notes = Array.isArray(result_notes) ? result_notes : (result_notes ? [result_notes] : []);

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        for (let i = 0; i < itemIds.length; i++) {
            if (results[i] && results[i].trim()) {
                await connection.execute(
                    `UPDATE lab_request_items SET result = ?, result_notes = ?, status = 'completed', processed_at = NOW() WHERE id = ?`,
                    [results[i].trim(), notes[i] || null, itemIds[i]]
                );
            }
        }

        const [[{ total, completed }]] = await connection.execute(
            `SELECT COUNT(*) AS total, SUM(status = 'completed') AS completed FROM lab_request_items WHERE request_id = ?`,
            [id]
        );

        let newStatus = 'requested';
        if (Number(completed) === Number(total) && Number(total) > 0) {
            newStatus = 'completed';
        } else if (Number(completed) > 0) {
            newStatus = 'processing';
        }

        await connection.execute('UPDATE lab_requests SET status = ? WHERE id = ?', [newStatus, id]);

        await connection.commit();
        req.flash('success', 'Lab results saved successfully.');
        res.redirect(`/laboratory/requests/${id}`);
    } catch (err) {
        await connection.rollback();
        console.error('Submit lab results error:', err);
        req.flash('error', 'Unable to save results.');
        res.redirect(`/laboratory/requests/${id}`);
    } finally {
        connection.release();
    }
};
