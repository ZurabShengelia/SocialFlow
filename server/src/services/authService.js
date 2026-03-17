import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import { generateToken } from '../utils/helpers.js';

const pendingRegistrations = new Map();

const PENDING_TTL_MS = 15 * 60 * 1000; 

function storePending(tempId, data) {
  pendingRegistrations.set(tempId, data);
  setTimeout(() => pendingRegistrations.delete(tempId), PENDING_TTL_MS);
}

const createTransporter = () => {
  if (process.env.EMAIL_SERVICE === 'outlook' || process.env.EMAIL_HOST) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export class AuthService {
  static generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async sendVerificationEmail(email, code, username) {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email - SocialFlow',
      html: `
        <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #1f2937; font-size: 28px; margin: 0;">Welcome to SocialFlow</h1>
          </div>

          <div style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 40%, #06b6d4 100%); border-radius: 16px; padding: 40px; color: white; text-align: center; margin-bottom: 30px;">
            <p style="margin: 0 0 20px 0; font-size: 16px;">Hi <strong>${username}</strong>,</p>
            <p style="margin: 0 0 20px 0; font-size: 16px;">Verify your email address to complete your registration</p>
            <div style="background: rgba(255,255,255,0.2); border-radius: 12px; padding: 20px; margin: 30px 0;">
              <p style="margin: 0; font-size: 14px; opacity: 0.9;">Your verification code is:</p>
              <p style="margin: 20px 0 0 0; font-size: 36px; font-weight: bold; letter-spacing: 4px;">${code}</p>
            </div>
            <p style="margin: 20px 0 0 0; font-size: 14px; opacity: 0.9;">This code will expire in 15 minutes</p>
          </div>

          <div style="text-align: center; color: #6b7280; font-size: 14px;">
            <p style="margin: 0;">If you didn't create this account, please ignore this email.</p>
          </div>
        </div>
      `
    };

    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) reject(error);
        else resolve(info);
      });
    });
  }

  static async register(username, email, password) {

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      throw new Error('An account with this email or username already exists. Please try another one.');
    }

    const verificationCode = this.generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + PENDING_TTL_MS);

    const tempId = new mongoose.Types.ObjectId().toString();

    storePending(tempId, {
      username,
      email,
      password,          
      verificationCode,
      verificationCodeExpires,
    });

    await this.sendVerificationEmail(email, verificationCode, username);

    return {
      message: 'Registration successful. Please check your email for the verification code.',
      email,
      userId: tempId,   
    };
  }

  static async verifyEmail(userId, code) {
    const pending = pendingRegistrations.get(userId);

    if (!pending) {
      throw new Error('Verification code has expired or is invalid. Please register again.');
    }

    if (pending.verificationCode !== code) {
      throw new Error('Invalid verification code');
    }

    if (pending.verificationCodeExpires < new Date()) {
      pendingRegistrations.delete(userId);
      throw new Error('Verification code has expired. Please register again.');
    }

    const existingUser = await User.findOne({
      $or: [{ email: pending.email }, { username: pending.username }]
    });
    if (existingUser) {
      pendingRegistrations.delete(userId);
      throw new Error('An account with this email or username already exists.');
    }

    const user = new User({
      username: pending.username,
      email: pending.email,
      password: pending.password,   
      emailVerified: true,
      verificationCode: null,
      verificationCodeExpires: null,
      verificationCodeType: null,
    });

    await user.save();

    pendingRegistrations.delete(userId);

    const token = generateToken(user._id);
    return { user: this.sanitizeUser(user), token };
  }

  static async resendVerificationCode(email) {

    let tempId = null;
    let pending = null;

    for (const [id, data] of pendingRegistrations.entries()) {
      if (data.email === email) {
        tempId = id;
        pending = data;
        break;
      }
    }

    if (!pending) {

      const user = await User.findOne({ email });
      if (!user) throw new Error('No pending registration found for this email. Please register again.');
      if (user.emailVerified) throw new Error('Email already verified');

      await User.deleteOne({ _id: user._id });
      throw new Error('Your session expired. Please register again.');
    }

    const newCode = this.generateVerificationCode();
    pending.verificationCode = newCode;
    pending.verificationCodeExpires = new Date(Date.now() + PENDING_TTL_MS);
    pendingRegistrations.set(tempId, pending);

    await this.sendVerificationEmail(email, newCode, pending.username);
    return { message: 'Verification code sent to your email', userId: tempId };
  }

  static async login(email, password) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) throw new Error('No account found with this email.');

    if (!user.emailVerified) throw new Error('Please verify your email before logging in');

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) throw new Error('Incorrect password. Please try again.');

    const token = generateToken(user._id);
    return { user: this.sanitizeUser(user), token };
  }

  static sanitizeUser(user) {
    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;
    delete userObj.verificationCode;
    delete userObj.verificationCodeExpires;
    delete userObj.verificationCodeType;
    return userObj;
  }
}

export class UserService {
  static async getUserById(userId) {
    return User.findById(userId)
      .populate('followers', 'username avatar')
      .populate('following', 'username avatar')
      .populate('followRequests', 'username avatar')
      .populate('blockedUsers', 'username avatar')
      .lean();
  }

  static async updateUserProfile(userId, data) {
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined)
    );
    const user = await User.findByIdAndUpdate(
      userId,
      { ...cleanData, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
      .populate('followers', 'username avatar')
      .populate('following', 'username avatar')
      .populate('blockedUsers', 'username avatar');
    return user;
  }

  static async followUser(followerId, followingId) {
    const followerIdStr = followerId.toString();
    const followingIdStr = followingId.toString();

    if (followerIdStr === followingIdStr) {
      throw new Error('Cannot follow yourself');
    }

    const [follower, following] = await Promise.all([
      User.findById(followerId),
      User.findById(followingId),
    ]);

    if (!follower) throw new Error('Current user not found');
    if (!following) throw new Error('User not found');

    const alreadyFollowing = following.followers.some(
      id => id.toString() === followerIdStr
    );
    if (alreadyFollowing) {
      await following.populate('followers', 'username avatar');
      await following.populate('following', 'username avatar');
      await follower.populate('following', 'username avatar');
      await follower.populate('followers', 'username avatar');
      return { follower, following, status: 'following', message: 'Already following this user' };
    }

    if (following.isPrivate) {
      const alreadyRequested = following.followRequests.some(
        id => id.toString() === followerIdStr
      );
      if (alreadyRequested) {
        await following.populate('followRequests', 'username avatar');
        return { follower, following, status: 'requested', message: 'Follow request already sent' };
      }

      following.followRequests.push(followerId);
      await following.save();
      await following.populate('followRequests', 'username avatar');
      return { follower, following, status: 'requested', message: 'Follow request sent' };
    }

    following.followers.push(followerId);
    follower.following.push(followingId);

    await Promise.all([following.save(), follower.save()]);

    await following.populate('followers', 'username avatar');
    await following.populate('following', 'username avatar');
    await follower.populate('following', 'username avatar');
    await follower.populate('followers', 'username avatar');

    return { follower, following, status: 'following', message: 'User followed successfully' };
  }

  static async unfollowUser(followerId, followingId) {
    const followerIdStr = followerId.toString();
    const followingIdStr = followingId.toString();

    if (followerIdStr === followingIdStr) {
      throw new Error('Cannot unfollow yourself');
    }

    const [follower, following] = await Promise.all([
      User.findById(followerId),
      User.findById(followingId),
    ]);

    if (!follower) throw new Error('Current user not found');
    if (!following) throw new Error('User not found');

    following.followers = following.followers.filter(
      id => id.toString() !== followerIdStr
    );
    follower.following = follower.following.filter(
      id => id.toString() !== followingIdStr
    );

    await Promise.all([following.save(), follower.save()]);
    return { follower, following };
  }

  static async acceptFollowRequest(userId, requesterId) {
    const [user, requester] = await Promise.all([
      User.findById(userId),
      User.findById(requesterId),
    ]);

    if (!user) throw new Error('User not found');
    if (!requester) throw new Error('Requester not found');

    user.followRequests = user.followRequests.filter(
      id => id.toString() !== requesterId.toString()
    );
    user.followers.push(requesterId);
    requester.following.push(userId);

    await Promise.all([user.save(), requester.save()]);
    return { user, requester };
  }

  static async rejectFollowRequest(userId, requesterId) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    user.followRequests = user.followRequests.filter(
      id => id.toString() !== requesterId.toString()
    );
    await user.save();
    return { user };
  }

  static async getFollowRequests(userId) {
    const user = await User.findById(userId).populate('followRequests', 'username avatar bio');
    if (!user) throw new Error('User not found');
    return user.followRequests;
  }

  static async blockUser(blockerId, blockedId) {
    const blocker = await User.findById(blockerId);
    if (!blocker) throw new Error('User not found');

    if (!blocker.blockedUsers.includes(blockedId)) {
      blocker.blockedUsers.push(blockedId);
    }

    blocker.followers = blocker.followers.filter(id => id.toString() !== blockedId.toString());
    blocker.following = blocker.following.filter(id => id.toString() !== blockedId.toString());

    const blocked = await User.findById(blockedId);
    if (blocked) {
      blocked.followers = blocked.followers.filter(id => id.toString() !== blockerId.toString());
      blocked.following = blocked.following.filter(id => id.toString() !== blockerId.toString());
      await blocked.save();
    }

    await blocker.save();
    return { success: true };
  }

  static async unblockUser(blockerId, blockedId) {
    const blocker = await User.findById(blockerId);
    if (!blocker) throw new Error('User not found');

    blocker.blockedUsers = blocker.blockedUsers.filter(
      id => id.toString() !== blockedId.toString()
    );
    await blocker.save();
    return { success: true };
  }

  static async getBlockedUsers(userId) {
    const user = await User.findById(userId).populate('blockedUsers', 'username avatar bio');
    if (!user) throw new Error('User not found');
    return user.blockedUsers;
  }

  static async searchUsers(query) {
    if (!query || query.length < 1) {
      return [];
    }
    return User.find(
      {
        $or: [
          { username: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } }
        ]
      },
      'username email avatar bio followers following'
    ).limit(10).lean();
  }

  static async requestVerificationCode(userId, type, newEmail = null) {
    console.log('🔐 [REQUEST CODE] Starting verification code request:', { userId, type, newEmail });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    if (type === 'email' && newEmail) {
      const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(newEmail)) {
        throw new Error('Invalid email format. Please provide a valid email address.');
      }

      const existingUser = await User.findOne({
        $or: [{ email: newEmail }, { pendingEmail: newEmail }],
        _id: { $ne: userId }
      });
      if (existingUser) {
        throw new Error('This email is already in use. Please choose a different email.');
      }

      user.pendingEmail = newEmail;
    }

    user.verificationCode = code;
    user.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.verificationCodeType = type;
    await user.save();

    const emailToSendTo = (type === 'email' && user.pendingEmail) ? user.pendingEmail : user.email;

    const isEmailConfigured =
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASS &&
      !process.env.EMAIL_USER.includes('your-email');

    if (!isEmailConfigured) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`📧 [DEV MODE] Verification code for ${emailToSendTo}: ${code}`);
        return {
          success: true,
          message: `Development mode: Code sent to ${emailToSendTo}. Check server logs.`,
          code,
          type,
        };
      } else {
        throw new Error('Email service not configured. Please set EMAIL_USER and EMAIL_PASS in .env');
      }
    }

    try {
      const transporter = createTransporter();
      await transporter.verify();

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #333;">Verification Code</h2>
          <p>Your verification code for ${type === 'password' ? 'password reset' : 'email change'} is:</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #6366f1; letter-spacing: 4px; margin: 0;">${code}</h1>
          </div>
          <p style="color: #666;">This code expires in <strong>10 minutes</strong>.</p>
          <p style="color: #999; font-size: 12px;">If you did not request this code, please ignore this email.</p>
        </div>
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: emailToSendTo,
        subject: 'Verification Code',
        text: `Your verification code is: ${code}\n\nThis code expires in 10 minutes.`,
        html: htmlContent
      });

      console.log(`✅ Verification email sent to ${emailToSendTo}`);
      return { success: true, message: `Verification code sent to ${emailToSendTo}` };
    } catch (error) {
      console.error('❌ [EMAIL ERROR]', error.message);

      user.verificationCode = null;
      user.verificationCodeExpires = null;
      user.verificationCodeType = null;
      await user.save();

      if (error.code === 'EAUTH') {
        throw new Error('Email authentication failed. Check your EMAIL_USER and EMAIL_PASS in .env');
      } else if (error.message.includes('getaddrinfo')) {
        throw new Error('Email server connection failed. Check EMAIL_HOST and EMAIL_PORT in .env');
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to Gmail SMTP server. Check your internet connection or firewall.');
      } else {
        throw new Error(`Failed to send verification email: ${error.message}`);
      }
    }
  }

  static async verifyAndUpdate(userId, code, type, payload) {
    console.log('📋 [VERIFY] Starting verification for user:', userId, 'type:', type);

    const user = await User.findById(userId).select('+password +verificationCode +verificationCodeExpires +verificationCodeType');
    if (!user) throw new Error('User not found');

    if (!user.verificationCode || user.verificationCode !== code) {
      throw new Error('Invalid verification code');
    }

    if (new Date() > user.verificationCodeExpires) {
      throw new Error('Verification code expired');
    }

    if (user.verificationCodeType !== type) {
      throw new Error(`Verification code type mismatch: expected "${user.verificationCodeType}", got "${type}"`);
    }

    if (type === 'password') {
      user.verificationCode = null;
      user.verificationCodeExpires = null;
      user.verificationCodeType = null;
      user.password = payload.password;
      await user.save();
    } else if (type === 'email') {
      const newEmail = user.pendingEmail || payload.email;
      if (!newEmail) throw new Error('No email provided for verification');

      const existingUser = await User.findOne({ email: newEmail, _id: { $ne: userId } });
      if (existingUser) throw new Error('Email already in use');

      await User.updateOne(
        { _id: userId },
        {
          $set: {
            email: newEmail,
            pendingEmail: null,
            verificationCode: null,
            verificationCodeExpires: null,
            verificationCodeType: null,
            emailVerified: true
          }
        }
      );
    }

    const updatedUser = await User.findById(userId);
    return AuthService.sanitizeUser(updatedUser);
  }
}

