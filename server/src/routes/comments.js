import express from 'express';
import { CommentController } from '../controllers/commentController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateComment, handleValidationErrors } from '../utils/validators.js';

const router = express.Router();

router.post('/:postId/comments', authMiddleware, validateComment, handleValidationErrors, CommentController.createComment);
router.get('/:postId/comments', CommentController.getPostComments);
router.delete('/comment/:commentId', authMiddleware, CommentController.deleteComment);

router.post('/comment/:commentId/like', authMiddleware, CommentController.likeComment);
router.post('/comment/:commentId/unlike', authMiddleware, CommentController.unlikeComment);

export default router;

