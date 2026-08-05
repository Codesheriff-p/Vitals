const pool = require('../config/db');

const BILL_CATEGORIES = ['consultation', 'lab', 'pharmacy', 'other'];

async function generateBillNumber() {
    const [[{ maxId }]] = await pool.execute('SELECT COALESCE(MAX(id), 0) AS maxId FROM bills');
    const next = maxId + 1;
    return 'BILL-' + String(next).padStart(4, '0');
}

async function getBillWithDetails(id) {
    const [[bill]] = await pool.execute(`
        SELECT b.*, p.first_name AS patient_first_name, p.last_name AS patient_last_name, p.patient_number,
               p.phone AS patient_phone, p.address AS patient_address, u.name AS created_by_name
        FROM bills b
        JOIN patients p ON p.id = b.patient_id
        LEFT JOIN users u ON u.id = b.created_by
        WHERE b.id = ?
    `, [id]);

    if (!bill) return null;

    const [items] = await pool.execute('SELECT * FROM bill_items WHERE bill_id = ?', [id]);
    const [payments] = await pool.execute(`
        SELECT pay.*, u.name AS received_by_name
        FROM payments pay
        LEFT JOIN users u ON u.id = pay.received_by
        WHERE pay.bill_id = ?
        ORDER BY pay.payment_date DESC
    `, [id]);

    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const balance = Number(bill.total) - totalPaid;

    return { bill, items, payments, totalPaid, balance };
}

exports.index = async (req, res) => {
    try {
        const status = req.query.status || '';
        let sql = `
            SELECT b.*, p.first_name AS patient_first_name, p.last_name AS patient_last_name, p.patient_number
            FROM bills b
            JOIN patients p ON p.id = b.patient_id
        `;
        const params = [];
        if (status) {
            sql += ' WHERE b.status = ?';
            params.push(status);
        }
        sql += ' ORDER BY b.created_at DESC';

        const [bills] = await pool.execute(sql, params);
        res.render('billing/index', { title: 'Billing', user: req.session.user, bills, status });
    } catch (err) {
        console.error('Billing index error:', err);
        req.flash('error', 'Unable to load bills.');
        res.render('billing/index', { title: 'Billing', user: req.session.user, bills: [], status: '' });
    }
};

exports.showAdd = async (req, res) => {
    try {
        const [patients] = await pool.execute('SELECT id, patient_number, first_name, last_name FROM patients ORDER BY first_name ASC');
        res.render('billing/add', {
            title: 'New Bill', user: req.session.user, patients, BILL_CATEGORIES,
            formData: {
                patient_id: req.query.patient_id || '',
                appointment_id: req.query.appointment_id || ''
            },
            errors: []
        });
    } catch (err) {
        console.error('Bill add form error:', err);
        req.flash('error', 'Unable to load form.');
        res.redirect('/billing');
    }
};

exports.create = async (req, res) => {
    const { patient_id, appointment_id, discount } = req.body;
    let { description, category, quantity, unit_price } = req.body;

    description = Array.isArray(description) ? description : (description ? [description] : []);
    category = Array.isArray(category) ? category : (category ? [category] : []);
    quantity = Array.isArray(quantity) ? quantity : (quantity ? [quantity] : []);
    unit_price = Array.isArray(unit_price) ? unit_price : (unit_price ? [unit_price] : []);

    const errors = [];
    if (!patient_id) errors.push('Please select a patient.');

    const items = [];
    for (let i = 0; i < description.length; i++) {
        if (!description[i] || !description[i].trim()) continue;
        const qty = Number(quantity[i]) || 1;
        const price = Number(unit_price[i]) || 0;
        items.push({
            description: description[i].trim(),
            category: BILL_CATEGORIES.includes(category[i]) ? category[i] : 'other',
            quantity: qty,
            unit_price: price,
            total: qty * price
        });
    }

    if (!items.length) errors.push('Please add at least one billable item.');

    const discountAmount = Number(discount) || 0;

    if (errors.length) {
        const [patients] = await pool.execute('SELECT id, patient_number, first_name, last_name FROM patients ORDER BY first_name ASC');
        return res.render('billing/add', {
            title: 'New Bill', user: req.session.user, patients, BILL_CATEGORIES, formData: req.body, errors
        });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const subtotal = items.reduce((sum, i) => sum + i.total, 0);
        const total = Math.max(subtotal - discountAmount, 0);
        const billNumber = await generateBillNumber();

        const [result] = await connection.execute(
            `INSERT INTO bills (bill_number, patient_id, appointment_id, subtotal, discount, total, status, created_by)
             VALUES (?, ?, ?, ?, ?, ?, 'unpaid', ?)`,
            [billNumber, patient_id, appointment_id || null, subtotal, discountAmount, total, req.session.user.id]
        );
        const billId = result.insertId;

        for (const item of items) {
            await connection.execute(
                'INSERT INTO bill_items (bill_id, description, category, quantity, unit_price, total) VALUES (?, ?, ?, ?, ?, ?)',
                [billId, item.description, item.category, item.quantity, item.unit_price, item.total]
            );
        }

        await connection.commit();
        req.flash('success', `Bill ${billNumber} created successfully.`);
        res.redirect(`/billing/${billId}`);
    } catch (err) {
        await connection.rollback();
        console.error('Bill create error:', err);
        req.flash('error', 'Something went wrong while creating the bill.');
        res.redirect('/billing/add');
    } finally {
        connection.release();
    }
};

exports.view = async (req, res) => {
    try {
        const details = await getBillWithDetails(req.params.id);
        if (!details) {
            req.flash('error', 'Bill not found.');
            return res.redirect('/billing');
        }
        res.render('billing/view', { title: details.bill.bill_number, user: req.session.user, ...details });
    } catch (err) {
        console.error('Bill view error:', err);
        req.flash('error', 'Unable to load bill.');
        res.redirect('/billing');
    }
};

exports.invoice = async (req, res) => {
    try {
        const details = await getBillWithDetails(req.params.id);
        if (!details) {
            req.flash('error', 'Bill not found.');
            return res.redirect('/billing');
        }
        res.render('billing/invoice', { title: `Invoice ${details.bill.bill_number}`, user: req.session.user, ...details });
    } catch (err) {
        console.error('Invoice view error:', err);
        req.flash('error', 'Unable to load invoice.');
        res.redirect('/billing');
    }
};

exports.recordPayment = async (req, res) => {
    const { id } = req.params;
    const { amount, payment_method, payment_date, notes } = req.body;

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [[bill]] = await connection.execute('SELECT * FROM bills WHERE id = ? FOR UPDATE', [id]);
        if (!bill) {
            await connection.rollback();
            req.flash('error', 'Bill not found.');
            return res.redirect('/billing');
        }

        const paymentAmount = Number(amount);
        if (!paymentAmount || paymentAmount <= 0) {
            await connection.rollback();
            req.flash('error', 'Please enter a valid payment amount.');
            return res.redirect(`/billing/${id}`);
        }

        const [[{ totalPaid }]] = await connection.execute(
            'SELECT COALESCE(SUM(amount), 0) AS totalPaid FROM payments WHERE bill_id = ?', [id]
        );
        const currentBalance = Number(bill.total) - Number(totalPaid);

        if (paymentAmount > currentBalance) {
            await connection.rollback();
            req.flash('error', `Payment exceeds the outstanding balance of ₦${currentBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}.`);
            return res.redirect(`/billing/${id}`);
        }

        await connection.execute(
            'INSERT INTO payments (bill_id, amount, payment_method, payment_date, received_by, notes) VALUES (?, ?, ?, ?, ?, ?)',
            [id, paymentAmount, payment_method || 'cash', payment_date || new Date().toISOString().slice(0, 10), req.session.user.id, notes || null]
        );

        const newBalance = currentBalance - paymentAmount;
        const newStatus = newBalance <= 0 ? 'paid' : 'partial';
        await connection.execute('UPDATE bills SET status = ? WHERE id = ?', [newStatus, id]);

        await connection.commit();
        req.flash('success', 'Payment recorded successfully.');
        res.redirect(`/billing/${id}`);
    } catch (err) {
        await connection.rollback();
        console.error('Record payment error:', err);
        req.flash('error', 'Unable to record payment.');
        res.redirect(`/billing/${id}`);
    } finally {
        connection.release();
    }
};
