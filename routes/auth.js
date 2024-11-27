const express = require('express');
const router = express.Router();
const authController = require('../controllers/authcontroller');
router.post('/loginuser', authController.loginUser);
router.post('/register', authController.register);
router.post('/registerad', authController.registeradmin);
router.post('/loginad', authController.loginAdmin);
module.exports = router;
