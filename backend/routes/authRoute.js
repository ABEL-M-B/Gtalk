const { login } = require("../controllers/authController");
const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController');

router.get('/user',authController.getCurrentUser)
router.get('/google',authController.login);
router.get('/google/callback',authController.callback)
router.post('/register',authController.register)
router.post('/login',authController.loginLocal)

module.exports = router;

