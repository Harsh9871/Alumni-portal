// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller.js');
const adminMiddleware = require('../middlewares/admin.auth.middleware.js');
const { generateToken } =    require('../utils/jwt');
router.post('/signup', adminMiddleware, authController.signup);
router.post('/login', authController.login);
router.post("/admin/login",(req,res)=>{
    if(!req.body.email || !req.body.password){
        return res.status(400).json({
            "MSG":"Email and password are required"
        })
    }
    if(req.body.email !== process.env.ADMIN_EMAIL || req.body.password !== process.env.ADMIN_PASSWORD){
        return res.status(401).json({
            "MSG":"Invalid credentials"
        })
    }
    const token = generateToken({
        email:req.body.email,
    })
    res.status(200).json({
        "MSG":"Sucess",
        token
    })
})
module.exports = router;
