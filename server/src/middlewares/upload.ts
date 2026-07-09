import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'tiketing_proofs',
      allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
    };
  },
});

export const uploadProof = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2 MB
  }
});
