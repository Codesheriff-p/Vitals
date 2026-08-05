const express = require('express');
const router = express.Router();

// TODO: replaced with full implementation when the users module is built
router.get('/', (req, res) => {
    res.send('users module coming soon');
});

module.exports = router;
