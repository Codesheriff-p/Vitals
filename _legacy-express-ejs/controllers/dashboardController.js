const pool = require('../config/db');

// Admin / general hospital-wide metrics
async function getAdminStats() {
    const [[{ totalPatients }]] = await pool.execute('SELECT COUNT(*) AS totalPatients FROM patients');
    const [[{ totalDoctors }]] = await pool.execute("SELECT COUNT(*) AS totalDoctors FROM doctors WHERE status = 'active'");
    const [[{ todayAppointments }]] = await pool.execute(
        'SELECT COUNT(*) AS todayAppointments FROM appointments WHERE appointment_date = CURDATE()'
    );
    const [[{ pendingLabRequests }]] = await pool.execute(
        "SELECT COUNT(*) AS pendingLabRequests FROM lab_requests WHERE status IN ('requested','processing')"
    );
    const [[{ lowStockCount }]] = await pool.execute(
        'SELECT COUNT(*) AS lowStockCount FROM pharmacy_drugs WHERE quantity_in_stock <= reorder_level'
    );
    const [[{ unpaidBillsCount, outstandingAmount }]] = await pool.execute(`
        SELECT
            COUNT(*) AS unpaidBillsCount,
            COALESCE(SUM(b.total - COALESCE(p.paid, 0)), 0) AS outstandingAmount
        FROM bills b
        LEFT JOIN (
            SELECT bill_id, SUM(amount) AS paid FROM payments GROUP BY bill_id
        ) p ON p.bill_id = b.id
        WHERE b.status IN ('unpaid', 'partial')
    `);

    const [recentAppointments] = await pool.execute(`
        SELECT a.id, a.appointment_number, a.appointment_date, a.appointment_time, a.status,
               p.first_name AS patient_first_name, p.last_name AS patient_last_name,
               u.name AS doctor_name
        FROM appointments a
        JOIN patients p ON p.id = a.patient_id
        JOIN doctors d ON d.id = a.doctor_id
        JOIN users u ON u.id = d.user_id
        ORDER BY a.created_at DESC
        LIMIT 8
    `);

    const [statusBreakdown] = await pool.execute(`
        SELECT status, COUNT(*) AS total
        FROM appointments
        GROUP BY status
    `);

    const [monthlyRevenue] = await pool.execute(`
        SELECT DATE_FORMAT(payment_date, '%b %Y') AS month, SUM(amount) AS total
        FROM payments
        WHERE payment_date >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
        GROUP BY DATE_FORMAT(payment_date, '%Y-%m'), DATE_FORMAT(payment_date, '%b %Y')
        ORDER BY DATE_FORMAT(payment_date, '%Y-%m') ASC
    `);

    return {
        totalPatients, totalDoctors, todayAppointments, pendingLabRequests,
        lowStockCount, unpaidBillsCount, outstandingAmount,
        recentAppointments, statusBreakdown, monthlyRevenue
    };
}

async function getDoctorStats(userId) {
    const [[doctorRow]] = await pool.execute('SELECT id FROM doctors WHERE user_id = ?', [userId]);
    if (!doctorRow) return { noDoctorProfile: true };

    const doctorId = doctorRow.id;

    const [[{ todayAppointments }]] = await pool.execute(
        "SELECT COUNT(*) AS todayAppointments FROM appointments WHERE doctor_id = ? AND appointment_date = CURDATE()",
        [doctorId]
    );
    const [[{ myPatients }]] = await pool.execute(
        'SELECT COUNT(DISTINCT patient_id) AS myPatients FROM appointments WHERE doctor_id = ?',
        [doctorId]
    );
    const [[{ pendingLabRequests }]] = await pool.execute(
        "SELECT COUNT(*) AS pendingLabRequests FROM lab_requests WHERE doctor_id = ? AND status IN ('requested','processing')",
        [doctorId]
    );

    const [todayList] = await pool.execute(`
        SELECT a.id, a.appointment_number, a.appointment_time, a.status, a.type,
               p.first_name AS patient_first_name, p.last_name AS patient_last_name, p.patient_number
        FROM appointments a
        JOIN patients p ON p.id = a.patient_id
        WHERE a.doctor_id = ? AND a.appointment_date = CURDATE()
        ORDER BY a.appointment_time ASC
    `, [doctorId]);

    return { todayAppointments, myPatients, pendingLabRequests, todayList };
}

async function getPharmacistStats() {
    const [[{ pendingPrescriptions }]] = await pool.execute(
        "SELECT COUNT(*) AS pendingPrescriptions FROM prescriptions WHERE status = 'pending'"
    );
    const [lowStockList] = await pool.execute(
        'SELECT id, drug_name, quantity_in_stock, reorder_level FROM pharmacy_drugs WHERE quantity_in_stock <= reorder_level ORDER BY quantity_in_stock ASC LIMIT 8'
    );
    return { pendingPrescriptions, lowStockList, lowStockCount: lowStockList.length };
}

async function getLabTechStats() {
    const [pendingList] = await pool.execute(`
        SELECT lr.id, lr.request_number, lr.status, lr.created_at,
               p.first_name AS patient_first_name, p.last_name AS patient_last_name
        FROM lab_requests lr
        JOIN patients p ON p.id = lr.patient_id
        WHERE lr.status IN ('requested','processing')
        ORDER BY lr.created_at ASC
        LIMIT 8
    `);
    const [[{ pendingLabRequests }]] = await pool.execute(
        "SELECT COUNT(*) AS pendingLabRequests FROM lab_requests WHERE status IN ('requested','processing')"
    );
    return { pendingList, pendingLabRequests };
}

async function getReceptionistStats() {
    const [[{ todayAppointments }]] = await pool.execute(
        'SELECT COUNT(*) AS todayAppointments FROM appointments WHERE appointment_date = CURDATE()'
    );
    const [[{ totalPatients }]] = await pool.execute('SELECT COUNT(*) AS totalPatients FROM patients');
    const [[{ unpaidBillsCount }]] = await pool.execute(
        "SELECT COUNT(*) AS unpaidBillsCount FROM bills WHERE status IN ('unpaid','partial')"
    );

    const [todayList] = await pool.execute(`
        SELECT a.id, a.appointment_number, a.appointment_time, a.status,
               p.first_name AS patient_first_name, p.last_name AS patient_last_name,
               u.name AS doctor_name
        FROM appointments a
        JOIN patients p ON p.id = a.patient_id
        JOIN doctors d ON d.id = a.doctor_id
        JOIN users u ON u.id = d.user_id
        WHERE a.appointment_date = CURDATE()
        ORDER BY a.appointment_time ASC
    `);

    return { todayAppointments, totalPatients, unpaidBillsCount, todayList };
}

exports.index = async (req, res) => {
    const { role, id } = req.session.user;

    try {
        let stats = {};

        if (role === 'admin') {
            stats = await getAdminStats();
        } else if (role === 'doctor') {
            stats = await getDoctorStats(id);
        } else if (role === 'pharmacist') {
            stats = await getPharmacistStats();
        } else if (role === 'lab_technician') {
            stats = await getLabTechStats();
        } else if (role === 'receptionist' || role === 'nurse') {
            stats = await getReceptionistStats();
        }

        res.render('dashboard/index', {
            title: 'Dashboard',
            user: req.session.user,
            role,
            stats
        });
    } catch (err) {
        console.error('Dashboard error:', err);
        req.flash('error', 'Unable to load dashboard data.');
        res.render('dashboard/index', {
            title: 'Dashboard',
            user: req.session.user,
            role,
            stats: {}
        });
    }
};
