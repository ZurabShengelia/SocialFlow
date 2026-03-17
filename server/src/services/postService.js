import Post from '../models/Post.js';
import User from '../models/User.js';

export class PostService {
  static async createPost(authorId, text, image = null) {
    const post = new Post({ author: authorId, text, image });
    await post.save();
    await User.findByIdAndUpdate(authorId, { $push: { posts: post._id } });
    return post.populate('author', 'username avatar');
  }

  static async getPost(postId) {
    return Post.findById(postId)
      .populate('author', 'username avatar')
      .populate({ path: 'comments', populate: { path: 'author', select: 'username avatar' } })
      .populate('likes', 'username avatar');
  }

  static async deletePost(postId, userId) {
    const post = await Post.findById(postId);
    if (!post) throw new Error('Post not found');
    if (post.author.toString() !== userId) throw new Error('Not authorized to delete this post');
    await User.findByIdAndUpdate(userId, { $pull: { posts: postId } });
    await Post.findByIdAndDelete(postId);
    return { message: 'Post deleted' };
  }

  static async likePost(postId, userId) {
    const post = await Post.findById(postId);
    if (!post) throw new Error('Post not found');
    const alreadyLiked = post.likes.some(id => id.toString() === userId.toString());
    if (alreadyLiked) throw new Error('Already liked this post');
    post.likes.push(userId);
    await post.save();
    return Post.findById(postId)
      .populate('author', 'username avatar bio')
      .populate('likes', '_id username avatar')
      .populate({ path: 'comments', populate: { path: 'author', select: 'username avatar' } });
  }

  static async unlikePost(postId, userId) {
    const post = await Post.findById(postId);
    if (!post) throw new Error('Post not found');
    post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    await post.save();
    return Post.findById(postId)
      .populate('author', 'username avatar bio')
      .populate('likes', '_id username avatar')
      .populate({ path: 'comments', populate: { path: 'author', select: 'username avatar' } });
  }

  static async getFeed(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const user = await User.findById(userId).select('following');
    const followingIds = user.following || [];

    const [followedPosts, ownPosts, randomPosts] = await Promise.all([
      Post.find({ author: { $in: followingIds } })
        .populate('author', 'username avatar bio')
        .populate('likes', '_id username avatar')
        .populate({ path: 'comments', options: { limit: 3 }, populate: { path: 'author', select: 'username avatar' } })
        .sort({ createdAt: -1 }).lean(),
      Post.find({ author: userId })
        .populate('author', 'username avatar bio')
        .populate('likes', '_id username avatar')
        .populate({ path: 'comments', options: { limit: 3 }, populate: { path: 'author', select: 'username avatar' } })
        .sort({ createdAt: -1 }).lean(),
      Post.find({ author: { $ne: userId, $nin: followingIds } })
        .populate('author', 'username avatar bio')
        .populate('likes', '_id username avatar')
        .populate({ path: 'comments', options: { limit: 3 }, populate: { path: 'author', select: 'username avatar' } })
        .sort({ createdAt: -1 }).lean(),
    ]);

    return [...ownPosts, ...followedPosts, ...randomPosts]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(skip, skip + limit);
  }

  static async getUserPosts(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return Post.find({ author: userId })
      .populate('author', 'username avatar')
      .populate('likes', '_id username avatar')
      .populate({ path: 'comments', options: { limit: 3 }, populate: { path: 'author', select: 'username avatar' } })
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit).lean();
  }

  static async getExplorePosts(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return Post.find({ author: { $ne: userId } })
      .populate('author', 'username avatar bio')
      .populate('likes', '_id username avatar')
      .populate({ path: 'comments', options: { limit: 2 }, populate: { path: 'author', select: 'username avatar' } })
      .sort({ 'likes': -1, 'createdAt': -1 })
      .skip(skip).limit(limit).lean();
  }

  static async getSuggestedUsers(userId, limit = 8) {
    const user = await User.findById(userId).select('following followers');
    const userFollowing = user.following || [];
    return User.find({ _id: { $ne: userId, $nin: userFollowing } })
      .select('username avatar bio followers posts')
      .sort({ 'followers': -1 })
      .limit(limit).lean();
  }

  static async getPostsByHashtag(hashtag, userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const tag = hashtag.replace(/^#+/, '').toLowerCase().trim();

    console.log(`🔍 getPostsByHashtag: searching for tag="${tag}"`);

    const totalPosts = await Post.countDocuments();
    console.log(`🔍 Total posts in DB: ${totalPosts}`);

    const query = {
      $or: [
        { hashtags: tag },
        { text: { $regex: `(^|\\s|[^\\w])#${tag}(\\s|$|[^\\w])`, $options: 'i' } },
        { text: { $regex: `#${tag}`, $options: 'i' } }
      ]
    };

    const totalMatches = await Post.countDocuments(query);
    console.log(`🔍 Posts matching #${tag}: ${totalMatches}`);

    const posts = await Post.find(query)
      .populate('author', 'username avatar bio')
      .populate('likes', '_id username avatar')
      .populate({ path: 'comments', options: { limit: 3 }, populate: { path: 'author', select: 'username avatar' } })
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit).lean();

    console.log(`🔍 Returning ${posts.length} posts for #${tag}`);
    return posts;
  }

  static async getTrendingHashtags(limit = 8) {
    const posts = await Post.find(
      { text: { $regex: '#\\w+', $options: 'i' } },
      { text: 1, _id: 0 }
    ).lean();

    const counts = {};
    const tagRegex = /#(\w+)/gi;

    for (const post of posts) {
      const seen = new Set();
      let match;

      tagRegex.lastIndex = 0;
      const text = post.text || '';
      while ((match = tagRegex.exec(text)) !== null) {
        const tag = match[1].toLowerCase();
        if (!seen.has(tag)) {
          seen.add(tag);
          counts[tag] = (counts[tag] || 0) + 1;
        }
      }
    }

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }));
  }
}

