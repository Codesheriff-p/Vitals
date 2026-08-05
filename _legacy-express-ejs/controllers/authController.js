const bcrypt = require('bcryptjs');
const pool = require('../config/db');

exports.showLogin = (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.render('auth/login', { title: 'Login', user: null });
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        req.flash('error', 'Please enter both email and password.');
        return res.redirect('/login');
    }

    try {
        const [rows] = await pool.execute(
            'SELECT id, name, email, password, role, status FROM users WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/login');
        }

        const account = rows[0];

        if (account.status !== 'active') {
            req.flash('error', 'This account has been deactivated. Contact an administrator.');
            return res.redirect('/login');
        }

        const match = await bcrypt.compare(password, account.password);
        if (!match) {
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/login');
        }

        req.session.user = {
            id: account.id,
            name: account.name,
            email: account.email,
            role: account.role
        };

        await pool.execute(
            'INSERT INTO audit_log (user_id, action, module, record_id, ip_address) VALUES (?, ?, ?, ?, ?)',
            [account.id, 'LOGIN', 'auth', null, req.ip]
        );

        req.flash('success', `Welcome back, ${account.name}.`);
        res.redirect('/dashboard');
    } catch (err) {
        console.error('Login error:', err);
        req.flash('error', 'Something went wrong. Please try again.');
        res.redirect('/login');
    }
};

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
};
