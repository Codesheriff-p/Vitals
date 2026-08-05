const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/', (req, res) => {
    res.redirect(req.session.user ? '/dashboard' : '/login');
});

router.get('/login', authController.showLogin);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

module.exports = router;
