import mongoose, { Schema, mongo } from "mongoose";

const tweetSchema = new Schema(
    {

        content: {
            type: String,
            required: true
        },

        owner: {
            typeo: Schema.Types.ObjectId,
            ref: "User"
        }


    }, { timestamps: true })

export const tweet = mongoose.model("Tweet", tweetSchema)