import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AuthController, UserController } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';
import {
  validateRegister,
  validateLogin,
  handleValidationErrors,
} from '../utils/validators.js';

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
    cb(null, `avatar-${ts}-${rand}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  if (allowed.test(file.mimetype) && allowed.test(path.extname(file.originalname).toLowerCase())) {
    return cb(null, true);
  }
  cb(new Error('Invalid file type. Only images are allowed.'));
};

const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, 
});

router.post('/register', validateRegister, handleValidationErrors, AuthController.register);
router.post('/verify-email', AuthController.verifyEmail);
router.post('/resend-verification', AuthController.resendVerificationCode);
router.post('/login', validateLogin, handleValidationErrors, AuthController.login);

router.get('/me', authMiddleware, UserController.getMe);
router.get('/user/:userId', UserController.getProfile);
router.put('/profile', authMiddleware, UserController.updateProfile);
router.post(
  '/upload-avatar',
  authMiddleware,
  uploadAvatar.single('avatar'),
  UserController.uploadAvatar
);

router.post('/request-code', authMiddleware, UserController.requestVerificationCode);
router.post('/verify-update', authMiddleware, UserController.verifyAndUpdate);

router.post('/follow/:userId', authMiddleware, UserController.follow);
router.post('/unfollow/:userId', authMiddleware, UserController.unfollow);

router.get('/follow-requests', authMiddleware, UserController.getFollowRequests);
router.post('/follow-requests/accept', authMiddleware, UserController.acceptFollowRequest);
router.post('/follow-requests/reject', authMiddleware, UserController.rejectFollowRequest);

router.post('/block/:userId', authMiddleware, UserController.blockUser);
router.post('/unblock/:userId', authMiddleware, UserController.unblockUser);
router.get('/blocked-users', authMiddleware, UserController.getBlockedUsers);

router.get('/search', UserController.searchUsers);

if (process.env.NODE_ENV !== 'production') {
  router.get('/debug/user/:userId', async (req, res) => {
    try {
      const User = (await import('../models/User.js')).default;
      const user = await User.findById(req.params.userId);
      if (!user) return res.json({ error: 'User not found' });
      res.json({
        userId: user._id.toString(),
        username: user.username,
        isPrivate: user.isPrivate,
        followers: user.followers.map(id => id.toString()),
        following: user.following.map(id => id.toString()),
        followRequests: user.followRequests.map(id => id.toString()),
      });
    } catch (error) {
      res.json({ error: error.message });
    }
  });

  router.post('/debug/clear-follow/:userId1/:userId2', async (req, res) => {
    try {
      const User = (await import('../models/User.js')).default;
      const [u1, u2] = await Promise.all([
        User.findById(req.params.userId1),
        User.findById(req.params.userId2),
      ]);
      if (!u1 || !u2) return res.json({ error: 'One or both users not found' });

      u1.following = u1.following.filter(id => id.toString() !== req.params.userId2);
      u2.followers = u2.followers.filter(id => id.toString() !== req.params.userId1);
      u2.following = u2.following.filter(id => id.toString() !== req.params.userId1);
      u1.followers = u1.followers.filter(id => id.toString() !== req.params.userId2);
      u1.followRequests = u1.followRequests.filter(id => id.toString() !== req.params.userId2);
      u2.followRequests = u2.followRequests.filter(id => id.toString() !== req.params.userId1);

      await Promise.all([u1.save(), u2.save()]);
      res.json({ success: true });
    } catch (error) {
      res.json({ error: error.message });
    }
  });
}

export default router;

