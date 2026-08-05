const express = require('express');
const router = express.Router();
const pharmacyController = require('../controllers/pharmacyController');
const requireRole = require('../middleware/role');

router.use(requireRole('admin', 'pharmacist', 'doctor'));

// Drug inventory
router.get('/', pharmacyController.index);
router.get('/add', requireRole('admin', 'pharmacist'), pharmacyController.showAdd);
router.post('/add', requireRole('admin', 'pharmacist'), pharmacyController.create);

// Prescriptions
router.get('/prescriptions', pharmacyController.prescriptionsIndex);
router.get('/prescriptions/add', requireRole('admin', 'doctor'), pharmacyController.showAddPrescription);
router.post('/prescriptions/add', requireRole('admin', 'doctor'), pharmacyController.createPrescription);
router.get('/prescriptions/:id', pharmacyController.viewPrescription);
router.post('/prescriptions/:id/dispense', requireRole('admin', 'pharmacist'), pharmacyController.dispensePrescription);

// Drug inventory (param routes last to avoid clashing with the paths above)
router.get('/:id/edit', requireRole('admin', 'pharmacist'), pharmacyController.showEdit);
router.post('/:id/edit', requireRole('admin', 'pharmacist'), pharmacyController.update);
router.post('/:id/delete', requireRole('admin', 'pharmacist'), pharmacyController.delete);

module.exports = router;
