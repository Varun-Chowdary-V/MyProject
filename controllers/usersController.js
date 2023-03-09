const User = require('../models/User')
const Note = require('../models/Note')

const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

// @desc Get All Users
// @route GET /users
// @access Private

const getAllUsers = asyncHandler(async (req,res) => {
    const users= await User.find().select('-password').lean()
    
    if(!users?.length) {
        return res.status(400).json({message:"No users found"})
    }
    res.json(users)

})

// @desc Create a User
// @route POST /users
// @access Private

const createNewUser = asyncHandler(async(req,res) => {
    const { username , password , roles , active} =req.body

    if(!username || ! Array.isArray(roles) || !roles.length){
        return res.status(400).json({message: 'All fields are mandatory'})
    }

    const duplicate = await User.findOne({username}).lean().exec()

    if(duplicate){
        return res.status(409).json({message:'Duplicate Username'})
    }

    
    const hashedPassword = await bcrypt.hash(password,10)
    
    const userObject = { username,'password':hashedPassword, roles, active}

    const user= await User.create(userObject)

    if(user){
        res.status(201).json({message:`New user ${username} created`})
    } else {
        res.status(400).json({message:"Invalid user data recieved"})
    }
})
// @desc Update User
// @route PATCH /users
// @access Private

const updateUser = asyncHandler(async(req,res) => {
    const {id, username , password , roles , active } =req.body

    if(!id || !username || ! Array.isArray(roles) || !roles.length){
        return res.status(400).json({message: 'All fields are mandatory'})
    }
    const user = await User.findById(id).exec()

    if(!user) {
        return res.status(400).json({message:'User not found'})
    }

    const duplicate = await User.findOne({username}).lean().exec()

    if(duplicate && duplicate?._id.toString()!=id){
        return res.status(409).json({message:'Duplicate Username'})
    }

    user.username = username
    user.roles = roles
    user.active = active

    if(password){
        user.password = await bcrypt.hash(password,10)
    }

    const updatedUser = await user.save()

    res.json({message : `${updatedUser.username} updated`})
})
// @desc Delete a User
// @route DELETE /users
// @access Private

const deleteUser = asyncHandler(async(req,res) => {
    const {id}=req.body
    if(!id){
        return res.status(400).json({message:'UserID required'})
    }

    const notes= await Note.findOne({user:id}).lean().exec()

    if(notes?.length){
        return res.status(400).json({message:'User has assigned notes'})
    }

    const user = await User.findById(id).exec()

    if(!user){
        return res.status(400).json({message:"User not found"})
    }
    
    const result = user.deleteOne()

    const reply= `Username ${user.username} with id ${user._id} deleted`

    res.json(reply)
})

module.exports={getAllUsers,createNewUser,updateUser,deleteUser}