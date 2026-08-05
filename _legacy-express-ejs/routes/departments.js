const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const requireRole = require('../middleware/role');

router.use(requireRole('admin'));

router.get('/', departmentController.index);
router.get('/add', departmentController.showAdd);
router.post('/add', departmentController.create);
router.get('/:id/edit', departmentController.showEdit);
router.post('/:id/edit', departmentController.update);
router.post('/:id/delete', departmentController.delete);

module.exports = router;
