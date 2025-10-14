  // src/controllers/auth.controller.js
  const authService = require('../services/auth.service');

  exports.signup = async (req, res) => {
    try {
      const result = await authService.signup(req.body);
      res.status(201).json({ success: true, message: 'User registered', data: result });
    } catch (error) {
      console.error('Signup Error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  };

  exports.login = async (req, res) => {
    try {
      const result = await authService.login(req.body);
      res.json({
        success: true,
        message: 'Login successful',
        token: result.token,
        user: result.user
      });
    } catch (error) {
      console.error('Login Error:', error);
      res.status(401).json({ success: false, message: error.message });
    }
  };
