const express = require('express');
const router = express.Router();
const adminMiddleware = require("../middlewares/admin.auth.middleware")
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
router.get('/:id',userController.getUserById );
router.post('/all' ,adminMiddleware , userController.getAllUsers );
router.post('/' ,verifyToken ,  userController.createUser );
router.put('/',  verifyToken , userController.updateUser );
router.delete('/', verifyToken , userController.deleteUser );


module.exports = router;
