// Makes the logged-in user (if any) available to every view as `user`.
// Mounted globally in server.js, before routes are registered.
exports.loadUser = (req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
};

// Guards protected route groups — redirects to /login when no session exists.
exports.requireLogin = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
};
