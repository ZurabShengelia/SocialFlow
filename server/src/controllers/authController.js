import { AuthService, UserService } from '../services/authService.js';
import { sendSuccess, sendError } from '../utils/helpers.js';
import { NotificationService } from '../services/notificationService.js';
import { getSocketInstance } from '../config/socketInstance.js';

export class AuthController {
  static async register(req, res) {
    try {
      const { username, email, password } = req.body;
      const result = await AuthService.register(username, email, password);
      sendSuccess(res, result, 'Registration successful. Please verify your email.', 201);
    } catch (error) {
      const statusCode = error.message.includes('already exists') ? 409 : 400;
      sendError(res, error.message, statusCode);
    }
  }

  static async verifyEmail(req, res) {
    try {
      const { userId, code } = req.body;
      if (!userId || !code) {
        return sendError(res, 'User ID and verification code required', 400);
      }
      const result = await AuthService.verifyEmail(userId, code);
      sendSuccess(res, result, 'Email verified successfully');
    } catch (error) {
      sendError(res, error.message, 400);
    }
  }

  static async resendVerificationCode(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return sendError(res, 'Email required', 400);
      }
      const result = await AuthService.resendVerificationCode(email);
      sendSuccess(res, result, 'Verification code sent');
    } catch (error) {
      sendError(res, error.message, 400);
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      sendSuccess(res, result, 'Login successful');
    } catch (error) {
      let statusCode = 400;
      if (error.message.includes('No account found')) {
        statusCode = 404;
      } else if (error.message.includes('Incorrect password')) {
        statusCode = 401;
      }
      sendError(res, error.message, statusCode);
    }
  }
}

export class UserController {
  static async getProfile(req, res) {
    try {
      const user = await UserService.getUserById(req.params.userId);
      if (!user) {
        return sendError(res, 'User not found', 404);
      }
      sendSuccess(res, user, 'User profile retrieved');
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  static async updateProfile(req, res) {
    try {
      const {
        bio, website, location, backgroundImage, avatar,
        isPrivate, privacySettings, notificationSettings
      } = req.body;

      const user = await UserService.updateUserProfile(req.userId, {
        bio, website, location, backgroundImage, avatar,
        isPrivate, privacySettings, notificationSettings
      });
      sendSuccess(res, user, 'Profile updated');
    } catch (error) {
      sendError(res, error.message, 400);
    }
  }

  static async uploadAvatar(req, res) {
    try {
      if (!req.file) {
        return sendError(res, 'No file uploaded', 400);
      }
      const avatarUrl = `/uploads/${req.file.filename}`;
      const user = await UserService.updateUserProfile(req.userId, { avatar: avatarUrl });
      sendSuccess(res, user, 'Avatar uploaded successfully');
    } catch (error) {
      sendError(res, error.message, 400);
    }
  }

  static async follow(req, res) {
    try {
      const { userId } = req.params;

      if (!userId || userId.length !== 24) {
        return sendError(res, 'Invalid user ID', 400);
      }

      if (req.userId.toString() === userId.toString()) {
        return sendError(res, 'You cannot follow yourself', 400);
      }

      const result = await UserService.followUser(req.userId, userId);

      if (
        result.status === 'following' && result.message === 'User followed successfully' ||
        result.status === 'requested' && result.message === 'Follow request sent'
      ) {
        const targetUser = result.following;
        const isPushEnabled = targetUser?.notificationSettings?.push ?? true;

        if (isPushEnabled) {
          const notifText =
            result.status === 'following'
              ? 'started following you'
              : 'sent you a follow request';

          const notifType = result.status === 'following' ? 'follow' : 'follow_request';
          try {
            const notification = await NotificationService.createNotification(
              userId, req.userId, notifType, null, null, notifText
            );
            if (notification) {
              const io = getSocketInstance();
              const notifObj = notification.toObject ? notification.toObject() : notification;
              io.to(`user_${userId}`).emit('notification', notifObj);
            }
          } catch (notifErr) {
            console.warn('Notification error (non-fatal):', notifErr.message);
          }
        }
      }

      sendSuccess(res, result, result.message);
    } catch (error) {
      console.error('Follow error:', error.message);

      const statusCode = error.message.includes('not found') ? 404 : 400;
      sendError(res, error.message, statusCode);
    }
  }

  static async unfollow(req, res) {
    try {
      const { userId } = req.params;

      if (!userId || userId.length !== 24) {
        return sendError(res, 'Invalid user ID', 400);
      }

      if (req.userId.toString() === userId.toString()) {
        return sendError(res, 'You cannot unfollow yourself', 400);
      }

      const result = await UserService.unfollowUser(req.userId, userId);
      sendSuccess(res, result, 'User unfollowed');
    } catch (error) {
      console.error('Unfollow error:', error.message);
      sendError(res, error.message, 400);
    }
  }

  static async acceptFollowRequest(req, res) {
    try {
      const { requesterId } = req.body;
      if (!requesterId) {
        return sendError(res, 'Requester ID is required', 400);
      }
      const result = await UserService.acceptFollowRequest(req.userId, requesterId);

      try {
        const notification = await NotificationService.createNotification(
          requesterId, req.userId, 'follow_accept', null, null, 'accepted your follow request'
        );
        if (notification) {
          const io = getSocketInstance();
          const notifObj = notification.toObject ? notification.toObject() : notification;
          io.to(`user_${requesterId}`).emit('notification', notifObj);
        }
      } catch (notifErr) {
        console.warn('Notification error (non-fatal):', notifErr.message);
      }

      sendSuccess(res, result, 'Follow request accepted');
    } catch (error) {
      sendError(res, error.message, 400);
    }
  }

  static async rejectFollowRequest(req, res) {
    try {
      const { requesterId } = req.body;
      if (!requesterId) {
        return sendError(res, 'Requester ID is required', 400);
      }
      const result = await UserService.rejectFollowRequest(req.userId, requesterId);
      sendSuccess(res, result, 'Follow request rejected');
    } catch (error) {
      sendError(res, error.message, 400);
    }
  }

  static async getFollowRequests(req, res) {
    try {
      const followRequests = await UserService.getFollowRequests(req.userId);
      sendSuccess(res, followRequests, 'Follow requests retrieved');
    } catch (error) {
      sendError(res, error.message, 400);
    }
  }

  static async blockUser(req, res) {
    try {
      const { userId } = req.params;
      if (!userId || userId.length !== 24) {
        return sendError(res, 'Invalid user ID', 400);
      }
      if (req.userId.toString() === userId.toString()) {
        return sendError(res, 'You cannot block yourself', 400);
      }
      const result = await UserService.blockUser(req.userId, userId);
      sendSuccess(res, result, 'User blocked');
    } catch (error) {
      sendError(res, error.message, 400);
    }
  }

  static async unblockUser(req, res) {
    try {
      const { userId } = req.params;
      if (!userId || userId.length !== 24) {
        return sendError(res, 'Invalid user ID', 400);
      }
      const result = await UserService.unblockUser(req.userId, userId);
      sendSuccess(res, result, 'User unblocked');
    } catch (error) {
      sendError(res, error.message, 400);
    }
  }

  static async getBlockedUsers(req, res) {
    try {
      const blockedUsers = await UserService.getBlockedUsers(req.userId);
      sendSuccess(res, blockedUsers, 'Blocked users retrieved');
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  static async searchUsers(req, res) {
    try {
      const { q } = req.query;
      if (!q || q.trim().length < 1) {
        return res.status(400).json({ message: 'Search query must be at least 1 character' });
      }
      const users = await UserService.searchUsers(q.trim());
      sendSuccess(res, users, 'Users found');
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  static async getMe(req, res) {
    try {
      const user = await UserService.getUserById(req.userId);
      sendSuccess(res, user, 'User data retrieved');
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  static async requestVerificationCode(req, res) {
    try {
      const { type, email } = req.body;
      if (!type || !['password', 'email'].includes(type)) {
        return sendError(res, 'Invalid verification type. Must be "password" or "email"', 400);
      }

      if (type === 'email' && !email) {
        return sendError(res, 'Email address is required for email change verification', 400);
      }
      const result = await UserService.requestVerificationCode(req.userId, type, email);
      sendSuccess(res, result, 'Verification code sent');
    } catch (error) {

      const statusCode = error.message.includes('email') ? 500 : 400;
      sendError(res, error.message, statusCode);
    }
  }

  static async verifyAndUpdate(req, res) {
    try {
      const { type, code, payload } = req.body;

      console.log('🔐 [AUTH] Verify and Update Request:', {
        userId: req.userId,
        type,
        code: code ? '***' : 'missing',
        payload: payload ? Object.keys(payload) : 'missing'
      });

      if (!type || !code || !payload) {
        const missing = [];
        if (!type) missing.push('type');
        if (!code) missing.push('code');
        if (!payload) missing.push('payload');
        const msg = `Missing required fields: ${missing.join(', ')}`;
        console.error('❌ [AUTH] Validation error:', msg);
        return sendError(res, msg, 400);
      }

      if (type !== 'password' && type !== 'email') {
        const msg = `Invalid type: ${type}. Must be "password" or "email"`;
        console.error('❌ [AUTH]', msg);
        return sendError(res, msg, 400);
      }

      if (type === 'password' && !payload.password) {
        const msg = 'Password is required for password change';
        console.error('❌ [AUTH]', msg);
        return sendError(res, msg, 400);
      }

      if (type === 'email' && !payload.email) {
        const msg = 'Email is required for email change';
        console.error('❌ [AUTH]', msg);
        return sendError(res, msg, 400);
      }

      const updatedUser = await UserService.verifyAndUpdate(req.userId, code, type, payload);
      console.log('✅ [AUTH] Verification and update successful for user:', req.userId);
      sendSuccess(res, updatedUser, 'Profile updated successfully');
    } catch (error) {
      console.error('❌ [AUTH] Verify and update error:', error.message);

      let statusCode = 400;
      if (error.message.includes('not found')) statusCode = 404;
      if (error.message.includes('expired')) statusCode = 401;
      if (error.message.includes('already in use')) statusCode = 409;

      sendError(res, error.message, statusCode);
    }
  }
}

