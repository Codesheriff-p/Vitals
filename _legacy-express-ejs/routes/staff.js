const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const requireRole = require('../middleware/role');

router.use(requireRole('admin'));

router.get('/', staffController.index);
router.get('/add', staffController.showAdd);
router.post('/add', staffController.create);
router.get('/:id/edit', staffController.showEdit);
router.post('/:id/edit', staffController.update);
router.post('/:id/delete', staffController.delete);

module.exports = router;
