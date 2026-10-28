const router = require('express').Router();
const user = require('../Controllers/userController');
const post = require('../Controllers/postController');
const { protect, optionalAuth } = require('../Middleware/authMiddleware');

router.get('/', user.searchUsers);
router.put('/profile', protect, user.updateProfile);

router.get('/:id', optionalAuth, user.getProfile);
router.get('/:id/posts', optionalAuth, post.getUserPosts);
router.get('/:id/followers', user.getFollowers);
router.get('/:id/following', user.getFollowing);
router.post('/:id/follow', protect, user.toggleFollow);


module.exports = router;