import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/Cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'

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

    const { fullName, username, email, password } = req.body;

    if ([fullName, email, password, username].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new ApiError(409, 'User with email or username already exists!');
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, 'Avatar file is required');
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar || !coverImage) {
        throw new ApiError(400, 'Error uploading files to Cloudinary');
    }

    const newUser = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage.url,
        email,
        password,
        username: username.toLowerCase()
    });

    if (!newUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    const createdUser = await User.findById(newUser._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while fetching the registered user");
    }

    return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully!"));

})

const login = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: 'ok'
    })
})

export { registerUser, login }