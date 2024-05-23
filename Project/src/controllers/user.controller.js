import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/Cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'


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

    const { email, password } = req.body

    if (!email) {
        throw new ApiError(400, "email or password is required! ")
    }

    const user = await User.findOne({
        $or: [{ email }]
    })

    if (!user) {
        throw new ApiError(404, "user does not exist!")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credential!")
    }

    const accessToken = await user.generateAccessToken();

    // Generate refresh token
    const refreshToken = await user.generateRefreshToken();

    // Save refresh token to user document
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // Send access and refresh tokens in cookies
    const options = {
        httpOnly: true,
        secure: true
    }


    res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, {
            user: loggedInUser
        },
            "User loggedIn successfully!"
        ))
})

const logOutUser = asyncHandler(async (req, res, next) => {
    console.log("req", req);
    await User.findByIdAndUpdate(
        req.user._id, {
        $set: {
            refreshToken: undefined
        }
    }, {
        new: true
    }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accsessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiError(200, {}, "User loggedOut Successfully!"))
})

const RefreshaccsessToken = asyncHandler(async (req, res, next) => {
    try {
        const incommingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

        if (incommingRefreshToken) {
            throw new ApiError(401, "Unathorized Request!")
        }

        const decodedToken = jwt.verify(
            incommingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refersh Token!")
        }

        if (incommingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "RefreshToken is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const RefreshToken = await user.generateRefreshToken()
        const accsessToken = await user.generateAccessToken()

        return res
            .status(200)
            .cookie("Accsess Token", accsessToken, options)
            .cookie("Refresh Token", RefreshToken, options)
            .json(
                new ApiResponse(200, { accsessToken, refreshToken: RefreshToken }, "Accsess Toekn Successfully!")
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid RefreshToken")
    }
})


export { registerUser, login, logOutUser, RefreshaccsessToken }