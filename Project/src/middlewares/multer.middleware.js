import multer from "multer"

const storage = multer.diskStorage({
    destinaion: function (req, file, cb) {
        cb(null, '../public/test')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

export const upload = multer({ storage })

