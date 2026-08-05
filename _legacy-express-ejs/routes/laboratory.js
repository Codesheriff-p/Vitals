const express = require('express');
const router = express.Router();
const laboratoryController = require('../controllers/laboratoryController');
const requireRole = require('../middleware/role');

router.use(requireRole('admin', 'lab_technician', 'doctor'));

// Test catalog
router.get('/', laboratoryController.index);
router.get('/add', requireRole('admin', 'lab_technician'), laboratoryController.showAdd);
router.post('/add', requireRole('admin', 'lab_technician'), laboratoryController.create);

// Lab requests
router.get('/requests', laboratoryController.requestsIndex);
router.get('/requests/add', requireRole('admin', 'doctor'), laboratoryController.showAddRequest);
router.post('/requests/add', requireRole('admin', 'doctor'), laboratoryController.createRequest);
router.get('/requests/:id', laboratoryController.viewRequest);
router.post('/requests/:id/results', requireRole('admin', 'lab_technician'), laboratoryController.submitResults);

// Test catalog (param routes last to avoid clashing with the paths above)
router.get('/:id/edit', requireRole('admin', 'lab_technician'), laboratoryController.showEdit);
router.post('/:id/edit', requireRole('admin', 'lab_technician'), laboratoryController.update);
router.post('/:id/delete', requireRole('admin', 'lab_technician'), laboratoryController.delete);

module.exports = router;
