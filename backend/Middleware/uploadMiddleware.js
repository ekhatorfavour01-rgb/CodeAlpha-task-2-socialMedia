const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max

    fileFilter: (req, file, cb) => {
        // only upload videos and pictures
        if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/')) {
            cb(null, true);

        } else {
            const error = new Error('Only video or image files are allowed');

            error.statusCode = 400;
            cb(error);
        }
    },
});

module.exports = upload;