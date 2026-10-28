exports.validatePost = (req, res, next) => {
    const { caption, videoUrl, imageUrl } = req.body;

    if (!req.file && !videoUrl && !imageUrl) {
        res.status(400);
        return next(new Error('Add a caption, a video or a picture'));
    }

    if (caption && caption.length > 300) {
        res.status(400);
        return next(new Error('Caption is too lond (max 300 characters)'));
    }

    next();
};