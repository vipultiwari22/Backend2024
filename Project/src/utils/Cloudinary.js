import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLUOD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        //upload file

        const response = await cloudinary.uploader.upload(localFilePath, {
            resorce_type: "auto"
        })

        // file has been uploaded successfully!

        console.log(`file is uploaded: ${response.url}`);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath)
    }
}


export { uploadOnCloudinary }
