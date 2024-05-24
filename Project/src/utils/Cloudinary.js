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

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        console.log(`file is uploaded: ${response.url}`);
        fs.unlinkSync(localFilePath); // Remove local file after upload
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        throw new Error('Cloudinary upload error');
    }
};

const deleteFromCloudinary = async (url) => {
    try {
        const publicId = url.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        throw new Error('Cloudinary delete error');
    }
};




export { uploadOnCloudinary, deleteFromCloudinary }
