import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { deleteFromCloudinary, uploadOnCloudinary } from '../utils/Cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'
import { response } from 'express'


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
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
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

const changeCurrentPassword = asyncHandler(async (req, res, next) => {
    const { oldPassword, newPassword } = req.body


    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Inavlid old password!")
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password Changed Successfully!"))
})

const getCurrentUser = asyncHandler(async (req, res, next) => {

    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "User fetched successfully!"))

})

const updateAccountDetails = asyncHandler(async (req, res, next) => {

    const { fullName, email } = req.body;

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id, {
        $set: {
            fullName,
            email: email
        }

    },
        {
            new: true
        }
    ).select("-password")

    return res
        .status(200)
        .json(200, user, "Account details update Successfullhy!")

})

const updateUserAvatar = asyncHandler(async (req, res, next) => {

    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing!");
    }

    const user = await User.findById(req.user._id);
    if (user.avatar) {
        await deleteFromCloudinary(user.avatar);
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading avatar");
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { avatar: avatar.url },
        { new: true }
    ).select('-password');

    return res.status(200).json({
        status: 200,
        data: updatedUser,
        message: 'Avatar image updated successfully!'
    });
});

const updateUserCoverImage = asyncHandler(async (req, res, next) => {

    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing")
    }

    const user = await User.findById(req.user?._id)

    if (user.coverImage) {
        await deleteFromCloudinary(user.coverImage)
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading coverImage!")
    }

    const updatedCoverImage = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Cover image updated successfully")
        )
})

const getUserChanelProfile = asyncHandler(async (req, res, next) => {

    const { username } = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "username is Missing!")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {

            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscriberTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelSubscribeToCount: {
                    $size: "$subscriberTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelSubscribeToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exist!")
    }

    console.log(channel);

    return res
        .status(200)
        .json(new ApiResponse(200, channel[0], "User channel fetched Successfully!"))
})

export {
    registerUser,
    login,
    logOutUser,
    RefreshaccsessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChanelProfile
}