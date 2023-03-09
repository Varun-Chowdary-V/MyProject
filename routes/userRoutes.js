const express = require('express')
const router = express.Router()
const UsersController = require('../controllers/usersController')
 
router.route('/')
    .get(UsersController.getAllUsers)
    .post(UsersController.createNewUser)
    .patch(UsersController.updateUser)
    .delete(UsersController.deleteUser)
module.exports= router