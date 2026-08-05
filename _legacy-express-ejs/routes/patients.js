const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

router.get('/', patientController.index);
router.get('/add', patientController.showAdd);
router.post('/add', patientController.create);
router.get('/:id', patientController.view);
router.get('/:id/edit', patientController.showEdit);
router.post('/:id/edit', patientController.update);
router.post('/:id/delete', patientController.delete);

module.exports = router;
