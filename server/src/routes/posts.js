import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PostController } from '../controllers/postController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ts = Date.now();
    const rand = Math.round(Math.random() * 1e9);
    cb(null, `post-${ts}-${rand}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|mp4|mov|webm/;
  if (allowed.test(file.mimetype) || allowed.test(path.extname(file.originalname).toLowerCase())) {
    return cb(null, true);
  }
  cb(new Error('Invalid file type.'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } });

router.post('/', authMiddleware, upload.single('image'), PostController.createPost);
router.get('/feed', authMiddleware, PostController.getFeed);
router.get('/explore', authMiddleware, PostController.getExplore);
router.get('/saved', authMiddleware, PostController.getSavedPosts);

router.get('/trending-hashtags', authMiddleware, PostController.getTrendingHashtags);
router.get('/hashtag/:hashtag', authMiddleware, PostController.getPostsByHashtag);

router.get('/user/:userId', PostController.getUserPosts);

router.get('/:postId', PostController.getPost);
router.delete('/:postId', authMiddleware, PostController.deletePost);

router.post('/:postId/like', authMiddleware, PostController.likePost);
router.post('/:postId/unlike', authMiddleware, PostController.unlikePost);

router.post('/:postId/save', authMiddleware, PostController.savePost);
router.post('/:postId/unsave', authMiddleware, PostController.unsavePost);

export default router;
