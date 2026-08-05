const pool = require('../config/db');

/* ------------------------------------------------------------
   Drug inventory
   ------------------------------------------------------------ */

exports.index = async (req, res) => {
    try {
        const search = (req.query.search || '').trim();
        let sql = 'SELECT * FROM pharmacy_drugs';
        const params = [];

        if (search) {
            sql += ' WHERE drug_name LIKE ? OR category LIKE ?';
            const like = `%${search}%`;
            params.push(like, like);
        }

        sql += ' ORDER BY drug_name ASC';

        const [drugs] = await pool.execute(sql, params);

        res.render('pharmacy/index', { title: 'Pharmacy Inventory', user: req.session.user, drugs, search });
    } catch (err) {
        console.error('Pharmacy index error:', err);
        req.flash('error', 'Unable to load drug inventory.');
        res.render('pharmacy/index', { title: 'Pharmacy Inventory', user: req.session.user, drugs: [], search: '' });
    }
};

exports.showAdd = (req, res) => {
    res.render('pharmacy/add', { title: 'Add Drug', user: req.session.user, formData: {}, errors: [] });
};

exports.create = async (req, res) => {
    const { drug_name, category, description, unit, unit_price, quantity_in_stock, reorder_level } = req.body;

    const errors = [];
    if (!drug_name || !drug_name.trim()) errors.push('Drug name is required.');
    if (!unit_price || isNaN(unit_price) || Number(unit_price) < 0) errors.push('Unit price must be a valid non-negative number.');
    if (quantity_in_stock === undefined || isNaN(quantity_in_stock) || Number(quantity_in_stock) < 0) errors.push('Quantity in stock must be a valid non-negative number.');

    if (errors.length) {
        return res.render('pharmacy/add', { title: 'Add Drug', user: req.session.user, formData: req.body, errors });
    }

    try {
        await pool.execute(
            `INSERT INTO pharmacy_drugs (drug_name, category, description, unit, unit_price, quantity_in_stock, reorder_level)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                drug_name.trim(), category || null, description || null, unit || null,
                Number(unit_price), Number(quantity_in_stock), Number(reorder_level) || 10
            ]
        );
        req.flash('success', `${drug_name.trim()} added to inventory.`);
        res.redirect('/pharmacy');
    } catch (err) {
        console.error('Drug create error:', err);
        res.render('pharmacy/add', {
            title: 'Add Drug', user: req.session.user, formData: req.body,
            errors: ['Something went wrong while saving the drug.']
        });
    }
};

exports.showEdit = async (req, res) => {
    try {
        const [[drug]] = await pool.execute('SELECT * FROM pharmacy_drugs WHERE id = ?', [req.params.id]);
        if (!drug) {
            req.flash('error', 'Drug not found.');
            return res.redirect('/pharmacy');
        }
        res.render('pharmacy/edit', { title: 'Edit Drug', user: req.session.user, drug, errors: [] });
    } catch (err) {
        console.error('Drug edit form error:', err);
        req.flash('error', 'Unable to load drug.');
        res.redirect('/pharmacy');
    }
};

exports.update = async (req, res) => {
    const { id } = req.params;
    const { drug_name, category, description, unit, unit_price, quantity_in_stock, reorder_level } = req.body;

    const errors = [];
    if (!drug_name || !drug_name.trim()) errors.push('Drug name is required.');
    if (!unit_price || isNaN(unit_price) || Number(unit_price) < 0) errors.push('Unit price must be a valid non-negative number.');
    if (quantity_in_stock === undefined || isNaN(quantity_in_stock) || Number(quantity_in_stock) < 0) errors.push('Quantity in stock must be a valid non-negative number.');

    if (errors.length) {
        return res.render('pharmacy/edit', {
            title: 'Edit Drug', user: req.session.user, errors,
            drug: { id, drug_name, category, description, unit, unit_price, quantity_in_stock, reorder_level }
        });
    }

    try {
        await pool.execute(
            `UPDATE pharmacy_drugs SET drug_name = ?, category = ?, description = ?, unit = ?, unit_price = ?, quantity_in_stock = ?, reorder_level = ?
             WHERE id = ?`,
            [
                drug_name.trim(), category || null, description || null, unit || null,
                Number(unit_price), Number(quantity_in_stock), Number(reorder_level) || 10, id
            ]
        );
        req.flash('success', 'Drug details updated successfully.');
        res.redirect('/pharmacy');
    } catch (err) {
        console.error('Drug update error:', err);
        req.flash('error', 'Unable to update drug.');
        res.redirect(`/pharmacy/${id}/edit`);
    }
};

exports.delete = async (req, res) => {
    try {
        await pool.execute('DELETE FROM pharmacy_drugs WHERE id = ?', [req.params.id]);
        req.flash('success', 'Drug removed from inventory.');
    } catch (err) {
        console.error('Drug delete error:', err);
        req.flash('error', 'Unable to delete drug. It may be referenced in existing prescriptions.');
    }
    res.redirect('/pharmacy');
};

/* ------------------------------------------------------------
   Prescriptions
   ------------------------------------------------------------ */

exports.prescriptionsIndex = async (req, res) => {
    try {
        const status = req.query.status || '';
        let sql = `
            SELECT pr.*, p.first_name AS patient_first_name, p.last_name AS patient_last_name, p.patient_number,
                   u.name AS doctor_name
            FROM prescriptions pr
            JOIN patients p ON p.id = pr.patient_id
            JOIN doctors d ON d.id = pr.doctor_id
            JOIN users u ON u.id = d.user_id
        `;
        const params = [];
        if (status) {
            sql += ' WHERE pr.status = ?';
            params.push(status);
        }
        sql += ' ORDER BY pr.created_at DESC';

        const [prescriptions] = await pool.execute(sql, params);

        res.render('pharmacy/prescriptions/index', { title: 'Prescriptions', user: req.session.user, prescriptions, status });
    } catch (err) {
        console.error('Prescriptions index error:', err);
        req.flash('error', 'Unable to load prescriptions.');
        res.render('pharmacy/prescriptions/index', { title: 'Prescriptions', user: req.session.user, prescriptions: [], status: '' });
    }
};

exports.showAddPrescription = async (req, res) => {
    try {
        const [patients] = await pool.execute('SELECT id, patient_number, first_name, last_name FROM patients ORDER BY first_name ASC');
        const [doctors] = await pool.execute(`SELECT d.id, u.name FROM doctors d JOIN users u ON u.id = d.user_id ORDER BY u.name ASC`);
        const [drugs] = await pool.execute('SELECT id, drug_name, unit, quantity_in_stock FROM pharmacy_drugs ORDER BY drug_name ASC');

        let doctorId = '';
        if (req.session.user.role === 'doctor') {
            const [[row]] = await pool.execute('SELECT id FROM doctors WHERE user_id = ?', [req.session.user.id]);
            if (row) doctorId = row.id;
        }

        res.render('pharmacy/prescriptions/add', {
            title: 'New Prescription', user: req.session.user, patients, doctors, drugs,
            formData: {
                patient_id: req.query.patient_id || '',
                doctor_id: doctorId || '',
                appointment_id: req.query.appointment_id || ''
            },
            errors: []
        });
    } catch (err) {
        console.error('Prescription add form error:', err);
        req.flash('error', 'Unable to load form.');
        res.redirect('/pharmacy/prescriptions');
    }
};

exports.createPrescription = async (req, res) => {
    const { patient_id, doctor_id, appointment_id } = req.body;
    let { drug_id, dosage, quantity, instructions } = req.body;

    drug_id = Array.isArray(drug_id) ? drug_id : (drug_id ? [drug_id] : []);
    dosage = Array.isArray(dosage) ? dosage : (dosage ? [dosage] : []);
    quantity = Array.isArray(quantity) ? quantity : (quantity ? [quantity] : []);
    instructions = Array.isArray(instructions) ? instructions : (instructions ? [instructions] : []);

    const errors = [];
    if (!patient_id) errors.push('Please select a patient.');
    if (!doctor_id) errors.push('Please select a doctor.');
    if (!drug_id.length || drug_id.every(d => !d)) errors.push('Please add at least one drug to the prescription.');

    if (errors.length) {
        const [patients] = await pool.execute('SELECT id, patient_number, first_name, last_name FROM patients ORDER BY first_name ASC');
        const [doctors] = await pool.execute(`SELECT d.id, u.name FROM doctors d JOIN users u ON u.id = d.user_id ORDER BY u.name ASC`);
        const [drugs] = await pool.execute('SELECT id, drug_name, unit, quantity_in_stock FROM pharmacy_drugs ORDER BY drug_name ASC');
        return res.render('pharmacy/prescriptions/add', {
            title: 'New Prescription', user: req.session.user, patients, doctors, drugs, formData: req.body, errors
        });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.execute(
            `INSERT INTO prescriptions (patient_id, doctor_id, appointment_id, status) VALUES (?, ?, ?, 'pending')`,
            [patient_id, doctor_id, appointment_id || null]
        );
        const prescriptionId = result.insertId;

        for (let i = 0; i < drug_id.length; i++) {
            if (!drug_id[i]) continue;
            await connection.execute(
                `INSERT INTO prescription_items (prescription_id, drug_id, dosage, quantity, instructions) VALUES (?, ?, ?, ?, ?)`,
                [prescriptionId, drug_id[i], dosage[i] || null, Number(quantity[i]) || 1, instructions[i] || null]
            );
        }

        await connection.commit();
        req.flash('success', 'Prescription created successfully.');
        res.redirect(`/pharmacy/prescriptions/${prescriptionId}`);
    } catch (err) {
        await connection.rollback();
        console.error('Prescription create error:', err);
        req.flash('error', 'Something went wrong while creating the prescription.');
        res.redirect('/pharmacy/prescriptions/add');
    } finally {
        connection.release();
    }
};

exports.viewPrescription = async (req, res) => {
    try {
        const [[prescription]] = await pool.execute(`
            SELECT pr.*, p.first_name AS patient_first_name, p.last_name AS patient_last_name, p.patient_number,
                   u.name AS doctor_name
            FROM prescriptions pr
            JOIN patients p ON p.id = pr.patient_id
            JOIN doctors d ON d.id = pr.doctor_id
            JOIN users u ON u.id = d.user_id
            WHERE pr.id = ?
        `, [req.params.id]);

        if (!prescription) {
            req.flash('error', 'Prescription not found.');
            return res.redirect('/pharmacy/prescriptions');
        }

        const [items] = await pool.execute(`
            SELECT pi.*, d.drug_name, d.unit, d.unit_price, d.quantity_in_stock
            FROM prescription_items pi
            JOIN pharmacy_drugs d ON d.id = pi.drug_id
            WHERE pi.prescription_id = ?
        `, [prescription.id]);

        res.render('pharmacy/prescriptions/view', { title: 'Prescription Details', user: req.session.user, prescription, items });
    } catch (err) {
        console.error('Prescription view error:', err);
        req.flash('error', 'Unable to load prescription.');
        res.redirect('/pharmacy/prescriptions');
    }
};

exports.dispensePrescription = async (req, res) => {
    const { id } = req.params;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [[prescription]] = await connection.execute('SELECT * FROM prescriptions WHERE id = ? FOR UPDATE', [id]);
        if (!prescription) {
            await connection.rollback();
            req.flash('error', 'Prescription not found.');
            return res.redirect('/pharmacy/prescriptions');
        }
        if (prescription.status === 'dispensed') {
            await connection.rollback();
            req.flash('error', 'This prescription has already been dispensed.');
            return res.redirect(`/pharmacy/prescriptions/${id}`);
        }

        const [items] = await connection.execute(`
            SELECT pi.*, d.drug_name, d.quantity_in_stock
            FROM prescription_items pi
            JOIN pharmacy_drugs d ON d.id = pi.drug_id
            WHERE pi.prescription_id = ?
            FOR UPDATE
        `, [id]);

        const shortages = items.filter(i => i.quantity_in_stock < i.quantity);
        if (shortages.length) {
            await connection.rollback();
            req.flash('error', `Insufficient stock for: ${shortages.map(s => s.drug_name).join(', ')}.`);
            return res.redirect(`/pharmacy/prescriptions/${id}`);
        }

        for (const item of items) {
            await connection.execute(
                'UPDATE pharmacy_drugs SET quantity_in_stock = quantity_in_stock - ? WHERE id = ?',
                [item.quantity, item.drug_id]
            );
        }

        await connection.execute(`UPDATE prescriptions SET status = 'dispensed' WHERE id = ?`, [id]);

        await connection.commit();
        req.flash('success', 'Prescription dispensed and stock updated.');
        res.redirect(`/pharmacy/prescriptions/${id}`);
    } catch (err) {
        await connection.rollback();
        console.error('Dispense prescription error:', err);
        req.flash('error', 'Unable to dispense prescription.');
        res.redirect(`/pharmacy/prescriptions/${id}`);
    } finally {
        connection.release();
    }
};
