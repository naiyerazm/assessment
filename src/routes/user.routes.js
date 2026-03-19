const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');
const authenticateToken = require('../middleware/auth.middleware');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/', authenticateToken, userController.getUsers);
router.get('/me', authenticateToken, userController.getMe);

module.exports = router;