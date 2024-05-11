import { asyncHandler } from '../utils/asyncHandler.js'

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not emapty
    // check if user alredy exist
    // check for imeges, check for avatar - if avalible or not
    // upload them cloudinary,avatar
    // create user object - create entry in db
    // remove password and refreshToken field from response
    // check for user creation
    // return response


    
})

const login = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: 'ok'
    })
})

export { registerUser, login }