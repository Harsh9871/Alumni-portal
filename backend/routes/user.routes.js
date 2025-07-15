const express = require('express');
const router = express.Router();
const adminMiddleware = require("../middlewares/admin.auth.middleware")
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// IMPORTANT: Put specific routes BEFORE parameterized routes
router.get('/all', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', verifyToken, userController.createUser);
router.put('/', verifyToken, userController.updateUser);
router.delete('/', verifyToken, userController.deleteUser);
router.post('/admin/', adminMiddleware, userController.adminCreateUser);
router.put('/admin/:id', adminMiddleware, userController.adminUpdateUser);
router.delete('/admin/:id', adminMiddleware, userController.adminDeleteUser);

module.exports = router;