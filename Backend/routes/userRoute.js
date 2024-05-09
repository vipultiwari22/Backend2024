const express = require('express')
const { allUsers, register } = require('../controllers/usersControl')
const router = express.Router()

router.get('/GetAllUser', allUsers)
router.post('/register', register)

module.exports = router