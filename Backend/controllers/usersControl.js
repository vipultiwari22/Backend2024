const User = require('../model/User.model')


exports.allUsers = async (req, res) => {
    try {
        const user = await User.find({}).select('-password')
        res.status(200).json({
            success: true,
            message: 'All Users',
            user
        })
    } catch (error) {
        res.status(400).json(({
            success: false,
            message: 'Error Somthing went worng',
            error: error.message
        }))

    }
}

exports.register = async (req, res) => {
    try {
        let { name, email, password } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({
                success: false,
                message: 'All fields are mendatory'
            })
        }

        const userExist = await User.findOne({ email })
        if (userExist) {
            res.status(200).json({
                success: true,
                message: 'user alredy exist!'
            })
        }

        let CreateUser = await User.create({
            name, email, password
        })
        if (!CreateUser) {
            res.status(400).json({
                success: false,
                message: 'Resgistration failed!'
            })
        }

        await CreateUser.save()
        CreateUser.password = undefined

        res.status(200).json({
            success: true,
            message: "User registration successfully",
            CreateUser,
        });

    } catch (error) {
        res.status(400).json(({
            success: false,
            message: 'Error Somthing went worng',
            error: error.message
        }))
    }
}