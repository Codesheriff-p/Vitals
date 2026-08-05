const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const requireRole = require('../middleware/role');

router.use(requireRole('admin', 'doctor', 'nurse', 'receptionist'));

router.get('/', appointmentController.index);
router.get('/add', requireRole('admin', 'nurse', 'receptionist'), appointmentController.showAdd);
router.post('/add', requireRole('admin', 'nurse', 'receptionist'), appointmentController.create);
router.get('/:id', appointmentController.view);
router.get('/:id/edit', requireRole('admin', 'doctor', 'nurse', 'receptionist'), appointmentController.showEdit);
router.post('/:id/edit', requireRole('admin', 'doctor', 'nurse', 'receptionist'), appointmentController.update);
router.post('/:id/delete', requireRole('admin', 'receptionist'), appointmentController.delete);

module.exports = router;
