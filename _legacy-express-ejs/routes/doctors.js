const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const requireRole = require('../middleware/role');

router.get('/', doctorController.index);
router.get('/add', requireRole('admin'), doctorController.showAdd);
router.post('/add', requireRole('admin'), doctorController.create);
router.get('/:id', doctorController.view);
router.get('/:id/edit', requireRole('admin'), doctorController.showEdit);
router.post('/:id/edit', requireRole('admin'), doctorController.update);
router.post('/:id/delete', requireRole('admin'), doctorController.delete);

module.exports = router;
