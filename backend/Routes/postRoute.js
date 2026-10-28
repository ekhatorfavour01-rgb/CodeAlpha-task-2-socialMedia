const router = require('express').Router();
const post = require('../Controllers/postController');
const comment = require('../Controllers/commentController');
const { protect, optionalAuth } = require('../Middleware/authMiddleware');
const upload = require('../Middleware/uploadMiddleware');
const { validatePost } = require('../Validations/postValidation');
const { uploadLimiter } = require('../Middleware/rateLimiter');

router.get('/', optionalAuth, post.getFeed);
router.get('/following', protect, post.getFollowingFeed);
router.get('/user/:userId', optionalAuth, post.getUserPosts);

router.post('/', protect, uploadLimiter, upload.single('video'), validatePost, post.createPost);

router.get('/:id', optionalAuth, post.getPost);
router.delete('/:id', protect, post.deletePost);
router.post('/:id/like', protect, post.toggleLike);

// comment live under a post
router.get('/:id/comments', optionalAuth, comment.getComments);
router.post('/:id/comments', protect, comment.addComment);

module.exports = router;