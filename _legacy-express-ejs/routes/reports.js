const express = require('express');
const router = express.Router();

// TODO: replaced with full implementation when the reports module is built
router.get('/', (req, res) => {
    res.send('reports module coming soon');
});

module.exports = router;
