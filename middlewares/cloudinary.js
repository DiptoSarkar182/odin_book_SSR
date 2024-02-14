const cloudinary = require('cloudinary').v2; 
const dotenv = require("dotenv");

dotenv.config();


cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
}); 

exports.uploads = (file, folder) => {
    return new Promise(resolve => {
        cloudinary.uploader.upload(file, {
            resource_type: "auto", 
            folder: folder
        }, (error, result) => {
            if (error) {
                console.error('Upload to Cloudinary failed:', error);
                resolve(null);
            } else {
                resolve({
                    url: result.secure_url, 
                    id: result.public_id
                });
            }
        });
    });
}

exports.deleteImage = (publicId) => {
    return new Promise(resolve => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
            if (error) {
                console.error('Delete from Cloudinary failed:', error);
                resolve(null);
            } else {
                resolve(result);
            }
        });
    });
}