const cloudinary = require('cloudinary');

const uploadMedia = (buffer, mimetype) => new Promise((resolve, reject) => {
    
    if (!process.env.CLOUDINARY_CLOUDE_NAME || !process.env.CLOUDINARY_API_KEY) {
        return reject(new Error('Cloudinary is not set up. Add the keys to .env, or paste a video link instead.'));
    }

    const resourceType = mimetype.startsWith('video/') ? 'video' : 'image';

    const stream = cloudinary.uploader.upload_stream({ folder: 'social-mvp', resource_type: resourceType },
        (error, result) => {
            if (error) return reject(new Error('Upload failed: ' + error.message));
            resolve({ url: result.secure_url, type: resourceType });
        }
    );

    stream.end(buffer);
});

module.exports = { uploadMedia };