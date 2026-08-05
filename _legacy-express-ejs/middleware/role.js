// Restricts a route to a set of roles, e.g. requireRole('admin', 'doctor').
// Must run after requireLogin so req.session.user is guaranteed to exist.
module.exports = function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.session.user || !roles.includes(req.session.user.role)) {
            return res.status(403).render('errors/403', {
                title: 'Access Denied',
                user: req.session.user || null
            });
        }
        next();
    };
};
