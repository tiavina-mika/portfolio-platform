import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

// it's just temporary, after it uploaded to the cloud (cloudinary), the local files will be deleted
export const multerConfig = multer({
  storage: multer.memoryStorage(),
});

export const initializeCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
};
