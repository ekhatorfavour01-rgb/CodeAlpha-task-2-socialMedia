const router = require('express').Router();
const { deleteComment } = require('../Controllers/commentController');
const { protect } = require('../Middleware/authMiddleware');

router.delete('/:id', protect, deleteComment);

module.exports = router;