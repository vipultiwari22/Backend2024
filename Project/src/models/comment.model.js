import mongoose, { Schema } from "mongoose";
import mongooseAggrigatePaginate from "mongoose-aggregate-paginate-v2"

const commentShcema = new Schema({
    content: {
        type: String,
        required: true
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true
})


commentShcema.plugin(mongooseAggrigatePaginate)

export const comment = mongoose.model("Comment", commentShcema)