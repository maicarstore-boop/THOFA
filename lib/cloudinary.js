import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  // Add timeout and secure options
  timeout: 60000,
  secure: true,
});

// Upload image to Cloudinary
export const uploadToCloudinary = async (file, folder = 'thofa_charity') => {
  try {
    // If file is a base64 string or URL
    if (typeof file === 'string') {
      const result = await cloudinary.uploader.upload(file, {
        folder: folder,
        resource_type: 'auto',
        timeout: 60000,
      });
      return result;
    }

    // If file is a File/Blob object
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto',
          timeout: 60000,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// Delete image from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

// Get image URL with transformations
export const getOptimizedImageUrl = (publicId, options = {}) => {
  const defaultOptions = {
    width: 800,
    height: 600,
    crop: 'fill',
    quality: 'auto',
    format: 'auto',
  };

  const opts = { ...defaultOptions, ...options };
  
  return cloudinary.url(publicId, {
    transformation: [
      { width: opts.width, height: opts.height, crop: opts.crop },
      { quality: opts.quality, fetch_format: opts.format },
    ],
  });
};

export default cloudinary;