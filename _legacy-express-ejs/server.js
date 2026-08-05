require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');

const { loadUser, requireLogin } = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const patientRoutes = require('./routes/patients');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const staffRoutes = require('./routes/staff');
const departmentRoutes = require('./routes/departments');
const pharmacyRoutes = require('./routes/pharmacy');
const laboratoryRoutes = require('./routes/laboratory');
const billingRoutes = require('./routes/billing');
const reportRoutes = require('./routes/reports');
const userRoutes = require('./routes/users');

const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static assets
app.use(express.static(path.join(__dirname, 'public')));

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Allow HTML forms to submit PUT/DELETE via ?_method=
app.use(methodOverride('_method'));

// Sessions
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 8 // 8 hours
    }
}));

// Flash messages
app.use(flash());

// Make session user + flash messages available to every view
app.use(loadUser);
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentPath = req.path;
    next();
});

// Routes
app.use('/', authRoutes);
app.use('/dashboard', requireLogin, dashboardRoutes);
app.use('/patients', requireLogin, patientRoutes);
app.use('/doctors', requireLogin, doctorRoutes);
app.use('/appointments', requireLogin, appointmentRoutes);
app.use('/staff', requireLogin, staffRoutes);
app.use('/departments', requireLogin, departmentRoutes);
app.use('/pharmacy', requireLogin, pharmacyRoutes);
app.use('/laboratory', requireLogin, laboratoryRoutes);
app.use('/billing', requireLogin, billingRoutes);
app.use('/reports', requireLogin, reportRoutes);
app.use('/users', requireLogin, userRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).render('errors/404', {
        title: 'Page Not Found',
        user: req.session.user || null
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`HMS server running at http://localhost:${PORT}`);
});
