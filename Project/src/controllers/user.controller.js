import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/Cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'

const genrateAccsessRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accsessTokens = user.genrateAccsessToken();
        const refreshTokens = user.genrateRefreshToken();

        user.refreshTokens = refreshTokens
        await user.save({ validateBeforeSave: false })

        return { refreshTokens, accsessTokens }
    } catch (error) {
        throw new ApiError(500, "Somthig went wrong While genrating refresh An accsses token!")
    }
}

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
    // req.body => data
    // username or email
    // find user
    // check password
    // access and refresh token 
    // send cookie
    // res

    const { username, email } = req.body

    if (!username || !email) {
        throw new ApiError(400, "email or password is required! ")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "user does not exist!")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credential!")
    }

    const { accsessTokens, refreshTokens } = await genrateAccsessRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accsessToken", accsessTokens, options)
        .cookie("refreshToken", refreshTokens, options)
        .json(new ApiResponse(200, {
            user: loggedInUser, accsessTokens, refreshTokens
        },
            "User loggedIn successfully!"
        ))
})

const logOutUser = asyncHandler(async (req, res, next) => {
    User.findById()
})

export { registerUser, login, logOutUser }