const Post = require('../Models/Post');
const Comment = require('../Models/Comment');
const asyncHandler = require('../Utils/asyncHandler');

// GET /api/posts/:id/comments   -> all comments of a post, newest first
exports.getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ post: req.params.id })
    .sort({ createdAt: -1 })
    .populate('author', 'name username avatar');
  res.json(comments);
});

// POST /api/posts/:id/comments   -> write a comment (login needed)
exports.addComment = asyncHandler(async (req, res) => {
  const text = (req.body.text || '').trim();
  if (!text) {
    res.status(400);
    throw new Error('Comment cannot be empty');
  }
  if (text.length > 300) {
    res.status(400);
    throw new Error('Comment is too long (max 300 characters)');
  }

  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const comment = await Comment.create({ post: post._id, author: req.user._id, text });
  await Post.findByIdAndUpdate(post._id, { $inc: { commentsCount: 1 } }); // +1 on the counter

  const full = await comment.populate('author', 'name username avatar');
  res.status(201).json(full);
});

// DELETE /api/comments/:id   -> the comment's author OR the post's author can delete
exports.deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  const post = await Post.findById(comment.post);
  const me = req.user._id.toString();
  const isCommentOwner = comment.author.toString() === me;
  const isPostOwner = post && post.author.toString() === me;

  if (!isCommentOwner && !isPostOwner) {
    res.status(403);
    throw new Error('You cannot delete this comment');
  }

  await comment.deleteOne();
  if (post) await Post.findByIdAndUpdate(post._id, { $inc: { commentsCount: -1 } });
  res.json({ message: 'Comment deleted' });
});