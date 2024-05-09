const mongoose = require('mongoose')

const USerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "name is required"],
    },
    password: {
        type: String,
        requird: true,
    },
    email: {
        type: String,
        required: true,
        lowecase: true,
        minLength: 10,
        unique: true,
    },

}, {
    timestamps: true,
})

const models = mongoose.model("Users", USerSchema);
module.exports = models;