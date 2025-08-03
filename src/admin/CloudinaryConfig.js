

export const cloudinaryConfig = {
    cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.REACT_APP_CLOUDINARY_API_KEY,
    apiSecret: process.env.REACT_APP_CLOUDINARY_API_SECRET, // Only needed for server-side operations
    uploadPreset: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET // For unsigned uploads
};