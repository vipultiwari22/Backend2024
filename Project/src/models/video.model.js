import mongoose, { Schema } from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'


const videoSchema = new Schema({
    videoFile: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        requierd: true
    },
    title: {
        type: String,
        requierd: true
    },
    description: {
        type: String,
        requierd: true
    },
    duration: {
        type: Number,
        requierd: true
    },
    views: {
        type: Number,
        defualt: 0
    },
    isPublished: {
        type: Boolean,
        defualt: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
},
    {
        timestamps: true
    }
)


videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model('Video', videoSchema)