import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { StoryController } from '../controllers/storyController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `story-${timestamp}-${random}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {

  const isImage = file.mimetype && /^image\/(jpeg|png|gif|webp)$/.test(file.mimetype);
  const isVideo = file.mimetype && /^video\/(mp4|webm|quicktime)$/.test(file.mimetype);

  const ext = path.extname(file.originalname).toLowerCase();
  const allowedImageExts = /\.(jpeg|jpg|png|gif|webp)$/;
  const allowedVideoExts = /\.(mp4|webm|mov)$/;

  const hasValidImageExt = allowedImageExts.test(ext);
  const hasValidVideoExt = allowedVideoExts.test(ext);

  if ((isImage && hasValidImageExt) || (isVideo && hasValidVideoExt)) {
    return cb(null, true);
  } else {
    console.error(`File rejected - MIME: ${file.mimetype}, Ext: ${ext}`);
    cb(new Error('Invalid file type. Only images (JPEG, PNG, GIF, WebP) and videos (MP4, WebM, MOV) are allowed.'));
  }
};

const uploadStory = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024 
  }
});

router.post('/', authMiddleware, uploadStory.single('image'), StoryController.createStory);
router.get('/user/:userId', StoryController.getUserStories);
router.get('/following', authMiddleware, StoryController.getFollowingStories);
router.post('/:storyId/view', authMiddleware, StoryController.viewStory);
router.post('/:storyId/like', authMiddleware, StoryController.likeStory);
router.post('/:storyId/unlike', authMiddleware, StoryController.unlikeStory);
router.post('/:storyId/react', authMiddleware, StoryController.reactToStory);
router.post('/:storyId/unreact', authMiddleware, StoryController.removeReaction);
router.post('/:storyId/reply', authMiddleware, StoryController.replyToStory);
router.delete('/:storyId', authMiddleware, StoryController.deleteStory);

export default router;

