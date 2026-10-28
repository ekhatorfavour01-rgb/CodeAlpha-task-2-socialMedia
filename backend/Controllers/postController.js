// Posts: create, read feeds, delete, like.

const Post = require('../Models/Post');
const Comment = require('../Models/Comment');
const asyncHandler = require('../Utils/asyncHandler');
const { uploadMedia } = require('../Services/mediaService');

// What we want to know about the author when we show a post
const AUTHOR_FIELDS = 'name username avatar';

// Turn a post from the database into what the frontend needs:
//  - likesCount (a number) instead of the whole list of ids
//  - liked (true/false) so the heart can be red or empty
const formatPost = (post, userId) => {
  const { likes, ...rest } = post; // take "likes" out, keep the rest
  return {
    ...rest,
    likesCount: likes.length,
    liked: userId ? likes.some((id) => id.toString() === userId.toString()) : false,
  };
};

// Reads ?page=1&limit=10 from the URL
const getPaging = (req) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 30);
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  return { limit, skip: (page - 1) * limit };
};

// Runs a search and answers with { posts: [...], hasMore: true/false }.
// Trick: we ask the database for ONE extra post. If it exists, we know there
// is another page to load (hasMore = true), and we do not send the extra one.
const sendPage = async (req, res, filter, viewerId) => {
  const { limit, skip } = getPaging(req);
  const found = await Post.find(filter)
    .sort({ createdAt: -1 }) // newest first
    .skip(skip)
    .limit(limit + 1)
    .populate('author', AUTHOR_FIELDS) // replace the author id with name/username/avatar
    .lean(); // lean = plain objects, faster

  const hasMore = found.length > limit;
  const posts = found.slice(0, limit).map((p) => formatPost(p, viewerId));
  res.json({ posts, hasMore });
};

// POST /api/posts   -> make a new post (login needed)
// The video can come as a FILE (field name "video") or as a link in "videoUrl".
exports.createPost = asyncHandler(async (req, res) => {
  const data = {
    author: req.user._id,
    caption: req.body.caption || '',
    videoUrl: req.body.videoUrl || '',
    imageUrl: req.body.imageUrl || '',
  };

  // If a file was sent, upload it to Cloudinary and keep the link
  if (req.file) {
    const uploaded = await uploadMedia(req.file.buffer, req.file.mimetype);
    if (uploaded.type === 'video') data.videoUrl = uploaded.url;
    else data.imageUrl = uploaded.url;
  }

  const post = await Post.create(data);
  const full = await Post.findById(post._id).populate('author', AUTHOR_FIELDS).lean();
  res.status(201).json(formatPost(full, req.user._id));
});

// GET /api/posts   -> the "For You" feed: everybody's posts, newest first
exports.getFeed = asyncHandler(async (req, res) => {
  await sendPage(req, res, {}, req.user && req.user._id);
});

// GET /api/posts/following   -> only posts from people I follow (login needed)
exports.getFollowingFeed = asyncHandler(async (req, res) => {
  // $in = "author is one of these ids"
  await sendPage(req, res, { author: { $in: req.user.following } }, req.user._id);
});

// GET /api/users/:id/posts   (or /api/posts/user/:id)  -> posts of one person
exports.getUserPosts = asyncHandler(async (req, res) => {
  const userId = req.params.userId || req.params.id;
  await sendPage(req, res, { author: userId }, req.user && req.user._id);
});

// GET /api/posts/:id   -> one post
exports.getPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate('author', AUTHOR_FIELDS).lean();
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  res.json(formatPost(post, req.user && req.user._id));
});

// DELETE /api/posts/:id   -> only the author can delete
exports.deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  if (post.author.toString() !== req.user._id.toString()) {
    res.status(403); // 403 = "I know who you are, but you may not do this"
    throw new Error('You can only delete your own posts');
  }
  await Comment.deleteMany({ post: post._id }); // remove its comments too
  await post.deleteOne();
  res.json({ message: 'Post deleted' });
});

// POST /api/posts/:id/like   -> like, or unlike if already liked
exports.toggleLike = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const myId = req.user._id;
  const alreadyLiked = post.likes.some((id) => id.toString() === myId.toString());

  const updated = await Post.findByIdAndUpdate(
    post._id,
    alreadyLiked ? { $pull: { likes: myId } } : { $addToSet: { likes: myId } },
    { returnDocument: 'after' } // give me the post AFTER the change
  );

  res.json({ liked: !alreadyLiked, likesCount: updated.likes.length });
});