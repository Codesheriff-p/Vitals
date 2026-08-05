const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const requireRole = require('../middleware/role');

router.use(requireRole('admin', 'receptionist'));

router.get('/', billingController.index);
router.get('/add', billingController.showAdd);
router.post('/add', billingController.create);
router.get('/:id', billingController.view);
router.get('/:id/invoice', billingController.invoice);
router.post('/:id/payments', billingController.recordPayment);

module.exports = router;
