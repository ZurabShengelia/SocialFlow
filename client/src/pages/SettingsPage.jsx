import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLock, FiShield, FiSun, FiLogOut, FiSearch, FiBell, FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle, FiMail, FiKey } from 'react-icons/fi';

import { MainLayout } from '../components/MainLayout';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useUserStore } from '../store/userStore';
import { disconnectSocket } from '../services/socketService';
import { authAPI, userAPI } from '../services/apiService';
import { BlockConfirmModal } from '../components/BlockConfirmModal';
import { getAvatarUrl, DEFAULT_AVATAR } from '../utils/avatarHelper';

const Toggle = ({ enabled, onChange, label, disabled = false }) => {
  const { darkMode } = useThemeStore();
  return (
    <motion.button
      type="button"
      onClick={onChange}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
        darkMode ? 'focus:ring-offset-slate-900' : 'focus:ring-offset-white'
      } ${enabled ? 'bg-primary' : darkMode ? 'bg-slate-600' : 'bg-gray-200'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-label={label}
    >
      <motion.span
        layout
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </motion.button>
  );
};

const AlertMessage = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isError = type === 'error';
  const Icon = isError ? FiAlertCircle : FiCheckCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex items-center gap-3 p-4 rounded-lg border ${
        isError
          ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300'
          : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300'
      }`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="text-sm font-medium">{message}</p>
    </motion.div>
  );
};

export const SettingsPage = () => {
  const { user, logout, getMe, blockUser, unblockUser } = useAuthStore();
  const { updateProfile } = useUserStore();
  const { darkMode, toggleDarkMode } = useThemeStore();
  const navigate = useNavigate();

  const [currentSection, setCurrentSection] = useState('security');

  const [securityStep, setSecurityStep] = useState('idle'); 
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [securityError, setSecurityError] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');
  const [securityLoading, setSecurityLoading] = useState(false);
  const [updateType, setUpdateType] = useState(''); 
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isPrivate, setIsPrivate] = useState(user?.isPrivate || false);
  const [allowMessagesFromAnyone, setAllowMessagesFromAnyone] = useState(
    user?.privacySettings?.allowMessagesFromAnyone ?? true
  );
  const [showActivityStatus, setShowActivityStatus] = useState(
    user?.privacySettings?.showActivityStatus ?? true
  );
  const [privacyError, setPrivacyError] = useState('');
  const [privacySuccess, setPrivacySuccess] = useState('');
  const [privacyLoading, setPrivacyLoading] = useState('');

  const [emailNotifications, setEmailNotifications] = useState(
    user?.notificationSettings?.email ?? true
  );
  const [pushNotifications, setPushNotifications] = useState(
    user?.notificationSettings?.push ?? true
  );
  const [preferencesError, setPreferencesError] = useState('');
  const [preferencesSuccess, setPreferencesSuccess] = useState('');
  const [preferencesLoading, setPreferencesLoading] = useState(''); 

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isBlockedUsersLoading, setIsBlockedUsersLoading] = useState(false);

  const [blockConfirm, setBlockConfirm] = useState({ open: false, user: null, isBlocking: true });
  const [blockActionLoading, setBlockActionLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setIsPrivate(user.isPrivate || false);
      setAllowMessagesFromAnyone(user.privacySettings?.allowMessagesFromAnyone ?? true);
      setShowActivityStatus(user.privacySettings?.showActivityStatus ?? true);
      setEmailNotifications(user.notificationSettings?.email ?? true);
      setPushNotifications(user.notificationSettings?.push ?? true);
      setNewEmail(user.email || '');
    }
  }, [user]);

  const handleLogout = () => {
    disconnectSocket();
    logout();
    navigate('/login');
  };

  const handleShowEmailInput = () => {
    setSecurityError('');
    setSecuritySuccess('');
    setNewEmail('');
    setSecurityStep('email_input');
  };

  const handleRequestCode = async (type) => {
    setSecurityError('');
    setSecuritySuccess('');

    if (type === 'email') {

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

      if (!newEmail) {
        setSecurityError('Please enter a new email address.');
        return;
      }

      if (newEmail.toLowerCase() === user?.email?.toLowerCase()) {
        setSecurityError('You are already using this email. Please enter a different email address.');
        return;
      }

      if (!emailRegex.test(newEmail.trim())) {
        setSecurityError('Invalid email format. Please use: example@domain.com');
        return;
      }

      if (!newEmail.includes('.')) {
        setSecurityError('Invalid email: missing domain extension (e.g., .com, .org)');
        return;
      }
    }

    setSecurityLoading(true);
    try {

      const emailToSend = type === 'email' ? newEmail.trim() : user?.email;
      const response = await authAPI.requestVerificationCode({ type, email: emailToSend });

      setUpdateType(type);
      setSecurityStep('verify');

      setSecuritySuccess(
        `✓ Verification code sent!\n` +
        `📧 Check your email: ${emailToSend}\n` +
        `(Check spam folder if you don't see it)`
      );
    } catch (error) {

      const statusCode = error.response?.status;
      const errorData = error.response?.data;

      let errorMsg = 'Failed to send verification code. Try again later.';
      if (statusCode === 400) {

        errorMsg = errorData?.message || 'Invalid email address. Please check the format and try again.';
      } else if (statusCode === 409) {
        errorMsg = 'This email is already in use. Please choose a different email address.';
      } else if (statusCode === 500) {
        errorMsg = 'Server error. Cannot send code at this time.';
      } else if (error.message === 'Network Error') {
        errorMsg = 'Network error. Check your connection and try again.';
      }

      setSecurityError(errorMsg);
      console.error('Request code failed:', error);
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleVerifyCodeAndSubmit = async () => {
    setSecurityError('');
    setSecuritySuccess('');

    if (!verificationCode || verificationCode.length !== 6 || !/^\d{6}$/.test(verificationCode)) {
      setSecurityError('Verification code must be exactly 6 digits (e.g., 123456).');
      return;
    }

    if (updateType === 'password') {
      if (!newPassword || !confirmPassword) {
        setSecurityError('Password fields cannot be empty.');
        return;
      }
      if (newPassword.length < 6) {
        setSecurityError('Password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setSecurityError('Passwords do not match. Please try again.');
        return;
      }
    }

    if (updateType === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!newEmail || !emailRegex.test(newEmail)) {
        setSecurityError('Email format is invalid. Use: example@domain.com');
        return;
      }
      if (newEmail === user?.email) {
        setSecurityError('New email must be different from your current email.');
        return;
      }
    }

    setSecurityLoading(true);
    try {

      const payload =
        updateType === 'password'
          ? { password: newPassword }
          : { email: newEmail };

      const { data } = await authAPI.verifyAndUpdate({
        type: updateType,
        code: verificationCode,
        payload,
      });

      const successMsg =
        updateType === 'password'
          ? '✓ Password updated successfully! You may be logged out for security reasons.'
          : '✓ Email updated successfully! A confirmation email has been sent.';

      setSecuritySuccess(successMsg);

      try {
        await getMe();
      } catch (refreshError) {
        console.warn('Failed to refresh user after update:', refreshError);

      }

      setTimeout(resetSecurityForm, 3000);
    } catch (error) {

      const statusCode = error.response?.status;
      const errorData = error.response?.data;

      let errorMsg = 'Verification failed. Please try again.';
      if (statusCode === 400) {
        errorMsg = errorData?.message || 'Invalid code or request. Please try again.';
      } else if (statusCode === 401) {
        errorMsg = 'Verification code expired or incorrect. Request a new one.';
      } else if (statusCode === 409) {
        errorMsg = 'Email is already in use. Try a different email.';
      } else if (statusCode === 500) {
        errorMsg = 'Server error. Changes were not applied.';
      }

      setSecurityError(errorMsg);
      console.error('Verify and update failed:', error);
    } finally {
      setSecurityLoading(false);
    }
  };

  const resetSecurityForm = () => {
    setSecurityStep('idle');
    setNewPassword('');
    setConfirmPassword('');
    setVerificationCode('');
    setSecurityError('');
  };

  const handlePrivacyToggle = async (field, value) => {
    setPrivacyError('');
    setPrivacySuccess('');
    setPrivacyLoading(field);

    try {

      if (field === 'isPrivate') setIsPrivate(value);
      if (field === 'allowMessagesFromAnyone') setAllowMessagesFromAnyone(value);
      if (field === 'showActivityStatus') setShowActivityStatus(value);

      const payload =
        field === 'isPrivate'
          ? { isPrivate: value }
          : {
              privacySettings: {
                ...user?.privacySettings,
                [field]: value,
              },
            };

      const result = await updateProfile(payload);

      try {
        await getMe();
      } catch (refreshError) {
        console.warn('Failed to refresh user after privacy update:', refreshError);

      }

      const successMessages = {
        isPrivate: value ? 'Account is now private. Followers must be approved.' : 'Account is now public. Anyone can follow you.',
        allowMessagesFromAnyone: value ? 'Anyone can now send you messages.' : 'Only followers can send you messages.',
        showActivityStatus: value ? 'Your activity status is now visible.' : 'Your activity status is now hidden.',
      };

      setPrivacySuccess(successMessages[field]);
    } catch (error) {

      if (field === 'isPrivate') setIsPrivate(!value);
      if (field === 'allowMessagesFromAnyone') setAllowMessagesFromAnyone(!value);
      if (field === 'showActivityStatus') setShowActivityStatus(!value);

      const errorMessage = error.response?.status === 400
        ? error.response.data.message || 'Invalid request. Please try again.'
        : error.response?.status === 500
        ? 'Server error. Your changes were not saved.'
        : error.response?.data?.message || 'Failed to update privacy setting. Please try again.';

      setPrivacyError(errorMessage);
      console.error(`Privacy update failed for ${field}:`, error);
    } finally {
      setPrivacyLoading('');
    }
  };

  const handlePreferenceToggle = async (field, value) => {
    setPreferencesError('');
    setPreferencesSuccess('');
    setPreferencesLoading(field); 

    try {

      if (field === 'email') setEmailNotifications(value);
      if (field === 'push') setPushNotifications(value);

      const result = await updateProfile({
        notificationSettings: {
          ...user?.notificationSettings,
          [field]: value,
        },
      });

      try {
        await getMe();
      } catch (refreshError) {
        console.warn('Failed to refresh user after preference update:', refreshError);

      }

      const successMessages = {
        email: value ? 'Email notifications enabled.' : 'Email notifications disabled.',
        push: value ? 'Push notifications enabled.' : 'Push notifications disabled.',
      };

      setPreferencesSuccess(successMessages[field]);
    } catch (error) {

      if (field === 'email') setEmailNotifications(!value);
      if (field === 'push') setPushNotifications(!value);

      const errorMessage = error.response?.status === 400
        ? error.response.data.message || 'Invalid request. Please try again.'
        : error.response?.status === 500
        ? 'Server error. Your preferences were not saved.'
        : error.response?.data?.message || 'Failed to update preferences. Please try again.';

      setPreferencesError(errorMessage);
      console.error(`Preference update failed for ${field}:`, error);
    } finally {
      setPreferencesLoading('');
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data } = await userAPI.searchUsers(query);
      const currentBlockedIds = (user?.blockedUsers || []).map((u) => u._id);

      const unblockedResults = data.data.filter(
        (u) => u._id !== user?._id && !currentBlockedIds.includes(u._id)
      );

      setSearchResults(unblockedResults);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const requestBlockUser = (userToBlock) => {
    setBlockConfirm({ open: true, user: userToBlock, isBlocking: true });
  };

  const requestUnblockUser = (blockedUser) => {
    setBlockConfirm({ open: true, user: blockedUser, isBlocking: false });
  };

  const handleBlockUser = async () => {
    if (!blockConfirm.user) return;
    setBlockActionLoading(true);
    try {
      await blockUser(blockConfirm.user._id);
      setSearchQuery('');
      setSearchResults([]);
      setPrivacySuccess(`@${blockConfirm.user.username} has been blocked.`);
    } catch (error) {
      setPrivacyError(error.response?.data?.message || 'Failed to block user. Please try again.');
    } finally {
      setBlockActionLoading(false);
      setBlockConfirm({ open: false, user: null, isBlocking: true });
    }
  };

  const handleUnblockUser = async () => {
    if (!blockConfirm.user) return;
    setBlockActionLoading(true);
    try {
      await unblockUser(blockConfirm.user._id || blockConfirm.user);
      setPrivacySuccess(`@${blockConfirm.user.username || 'User'} has been unblocked.`);
    } catch (error) {
      setPrivacyError(error.response?.data?.message || 'Failed to unblock user. Please try again.');
    } finally {
      setBlockActionLoading(false);
      setBlockConfirm({ open: false, user: null, isBlocking: false });
    }
  };

  const sections = [
    { id: 'security', label: 'Security', icon: FiLock },
    { id: 'privacy', label: 'Privacy', icon: FiShield },
    { id: 'preferences', label: 'Preferences', icon: FiSun },
  ];

  const renderSection = () => {
    switch (currentSection) {
      case 'security':
        return (
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-1">Security</h2>
            <p className="text-text-tertiary mb-6">Update your password and email with two-factor verification.</p>

            {}
            <div className="mb-6 space-y-3">
              <AnimatePresence>
                {securityError && (
                  <AlertMessage
                    type="error"
                    message={securityError}
                    onClose={() => setSecurityError('')}
                  />
                )}
                {securitySuccess && (
                  <AlertMessage
                    type="success"
                    message={securitySuccess}
                    onClose={() => setSecuritySuccess('')}
                  />
                )}
              </AnimatePresence>
            </div>

            {}
            {securityStep === 'idle' && (
              <div className="space-y-4">
                {}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    darkMode
                      ? 'bg-slate-800/30 border-slate-700 hover:border-primary/50'
                      : 'bg-slate-50 border-gray-200 hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FiMail className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-text-primary">Change Email</h3>
                      </div>
                      <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Current email: <span className="font-medium text-primary">{user?.email}</span>
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        We'll send a verification code to confirm the change.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleShowEmailInput()}
                    disabled={securityLoading}
                    className="mt-4 btn-primary w-full"
                  >
                    {securityLoading && updateType === 'email' ? 'Sending...' : 'Change Email'}
                  </button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    darkMode
                      ? 'bg-slate-800/30 border-slate-700 hover:border-primary/50'
                      : 'bg-slate-50 border-gray-200 hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FiKey className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-text-primary">Change Password</h3>
                      </div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Set a new, strong password for your account. We'll send a verification code to your email.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRequestCode('password')}
                    disabled={securityLoading}
                    className="mt-4 btn-primary w-full"
                  >
                    {securityLoading && updateType === 'password' ? 'Sending Code...' : 'Change Password'}
                  </button>
                </motion.div>
              </div>
            )}

            {}
            {securityStep === 'email_input' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className={`p-6 rounded-xl border-2 ${darkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-gray-200'}`}>
                  <h3 className="font-semibold text-text-primary mb-1">Enter New Email Address</h3>
                  <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Enter your new email and we'll send a 6-digit verification code to confirm it.
                  </p>
                  <input
                    id="new_email_input"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="input-field w-full mb-4"
                    placeholder="Enter new email address"
                  />
                  <div className="flex gap-3">
                    <button onClick={() => setSecurityStep('idle')} className="btn-secondary flex-1">
                      Cancel
                    </button>
                    <button
                      onClick={() => handleRequestCode('email')}
                      disabled={securityLoading || !newEmail}
                      className="btn-primary flex-1"
                    >
                      {securityLoading ? 'Sending Code...' : 'Send Verification Code'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {securityStep === 'verify' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className={`p-6 rounded-xl border-2 ${darkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-gray-200'}`}>
                  <h3 className="font-semibold text-text-primary mb-2">Verify Your Identity</h3>
                  <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    A 6-digit verification code was sent to <span className="font-medium text-primary">{updateType === 'email' ? newEmail : user?.email}</span>. <br />
                    Check your email (and spam folder) and enter the code below.
                  </p>

                  {updateType === 'email' && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-text-primary mb-2">New Email</label>
                      <input
                        id="verify_new_email"
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="input-field w-full"
                        placeholder="Enter new email"
                      />
                    </div>
                  )}

                  {updateType === 'password' && (
                    <div className="space-y-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">New Password</label>
                        <div className="relative">
                          <input
                            id="new_password_input"
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="input-field w-full"
                            placeholder="Enter new password (min 6 characters)"
                          />
                          <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                          >
                            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">Confirm Password</label>
                        <div className="relative">
                          <input
                            id="confirm_password_input"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="input-field w-full"
                            placeholder="Confirm new password"
                          />
                          <button
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                          >
                            {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-text-primary mb-2">Verification Code</label>
                    <input
                      id="verification_code_input"
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      className="input-field w-full text-center text-2xl tracking-[0.5em] font-mono"
                    />
                    <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Enter the 6-digit code from your email
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={resetSecurityForm} className="btn-secondary flex-1" disabled={securityLoading}>
                      Cancel
                    </button>
                    <button
                      onClick={handleVerifyCodeAndSubmit}
                      disabled={securityLoading || verificationCode.length !== 6}
                      className="btn-primary flex-1"
                    >
                      {securityLoading ? 'Verifying...' : 'Verify & Update'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        );

      case 'privacy':
        return (
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-1">Privacy & Safety</h2>
            <p className="text-text-tertiary mb-6">Control who can see your activity and interact with you.</p>

            <div className="mb-6 space-y-3">
              <AnimatePresence>
                {privacyError && (
                  <AlertMessage
                    type="error"
                    message={privacyError}
                    onClose={() => setPrivacyError('')}
                  />
                )}
                {privacySuccess && (
                  <AlertMessage
                    type="success"
                    message={privacySuccess}
                    onClose={() => setPrivacySuccess('')}
                  />
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-xl border-2 transition-all ${
                  darkMode
                    ? 'bg-slate-800/30 border-slate-700'
                    : 'bg-slate-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <h3 className="font-semibold text-text-primary">Private Account</h3>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {isPrivate
                        ? '✓ New followers must be approved before they can see your posts.'
                        : 'Anyone can follow you and see your posts.'}
                    </p>
                    <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      Private accounts: Only followers see posts • Cannot send messages to strangers
                    </p>
                  </div>
                  <Toggle
                    enabled={isPrivate}
                    onChange={() => handlePrivacyToggle('isPrivate', !isPrivate)}
                    label="Toggle Private Account"
                    disabled={privacyLoading === 'isPrivate'}
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className={`p-6 rounded-xl border-2 transition-all ${
                  darkMode
                    ? 'bg-slate-800/30 border-slate-700'
                    : 'bg-slate-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <h3 className="font-semibold text-text-primary">Messages from Anyone</h3>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {allowMessagesFromAnyone
                        ? '✓ Anyone can send you direct messages.'
                        : '✓ Only people you follow can send you direct messages.'}
                    </p>
                    <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {isPrivate && 'Note: Private account setting applies regardless.'}
                    </p>
                  </div>
                  <Toggle
                    enabled={allowMessagesFromAnyone}
                    onChange={() => handlePrivacyToggle('allowMessagesFromAnyone', !allowMessagesFromAnyone)}
                    label="Toggle Allow Messages"
                    disabled={privacyLoading === 'allowMessagesFromAnyone' || isPrivate}
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`p-6 rounded-xl border-2 transition-all ${
                  darkMode
                    ? 'bg-slate-800/30 border-slate-700'
                    : 'bg-slate-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <h3 className="font-semibold text-text-primary">Show Activity Status</h3>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {showActivityStatus
                        ? '✓ Others can see when you were last active.'
                        : '✓ Your activity status is hidden from view.'}
                    </p>
                    <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      Activity status shows online status and last seen time
                    </p>
                  </div>
                  <Toggle
                    enabled={showActivityStatus}
                    onChange={() => handlePrivacyToggle('showActivityStatus', !showActivityStatus)}
                    label="Toggle Activity Status"
                    disabled={privacyLoading === 'showActivityStatus'}
                  />
                </div>
              </motion.div>
            </div>

            <div className={`p-6 rounded-xl border-2 ${darkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-gray-200'}`}>
              <h3 className="text-lg font-bold text-text-primary mb-2">Blocked Accounts</h3>
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Blocked users cannot see your posts, send messages, or find your profile.
              </p>

              <div className="relative mb-4">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input
                  id="user_block_search"
                  type="text"
                  placeholder="Search for users to block..."
                  className="input-field w-full pl-10"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin rounded-full border-2 border-b-transparent border-primary"></div>
                )}
              </div>

              {searchResults.length > 0 && (
                <div className={`mb-4 p-4 rounded-lg max-h-48 overflow-y-auto ${darkMode ? 'bg-slate-900/50' : 'bg-white'}`}>
                  {searchResults.map((u) => (
                    <div
                      key={u._id}
                      className="flex items-center justify-between p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                    >
                      <div className="flex items-center gap-3">
                        <img src={getAvatarUrl(u.avatar)} alt={u.username} className="w-10 h-10 rounded-full object-cover" onError={e => { e.target.src = DEFAULT_AVATAR; }} />
                        <span className="font-medium text-text-primary">{u.username}</span>
                      </div>
                      <button onClick={() => requestBlockUser(u)} className="btn-secondary-danger text-sm">
                        Block
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                {isBlockedUsersLoading ? (
                  <p className="text-text-tertiary text-center py-4">Loading blocked users...</p>
                ) : (user.blockedUsers || []).length > 0 ? (
                  (user.blockedUsers || []).map((bu) => (
                    <motion.div
                      key={bu._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-slate-900/30' : 'bg-white'}`}
                    >
                      <div className="flex items-center gap-3">
                        <img src={getAvatarUrl(bu.avatar)} alt={bu.username} className="w-10 h-10 rounded-full object-cover" onError={e => { e.target.src = DEFAULT_AVATAR; }} />
                        <span className="font-medium text-text-primary">{bu.username}</span>
                      </div>
                      <button
                        onClick={() => requestUnblockUser(bu)}
                        className="btn-secondary text-sm"
                      >
                        Unblock
                      </button>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-text-tertiary text-sm text-center py-4">You haven't blocked any accounts.</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-1">Preferences</h2>
            <p className="text-text-tertiary mb-6">Customize your experience and notification settings.</p>

            {}
            <div className="mb-6 space-y-3">
              <AnimatePresence>
                {preferencesError && (
                  <AlertMessage
                    type="error"
                    message={preferencesError}
                    onClose={() => setPreferencesError('')}
                  />
                )}
                {preferencesSuccess && (
                  <AlertMessage
                    type="success"
                    message={preferencesSuccess}
                    onClose={() => setPreferencesSuccess('')}
                  />
                )}
              </AnimatePresence>
            </div>

            {}
            <div className="space-y-4">
              {}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-xl border-2 transition-all ${
                  darkMode
                    ? 'bg-slate-800/30 border-slate-700'
                    : 'bg-slate-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <FiSun className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-text-primary">Dark Mode</h3>
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {darkMode ? '✓ Dark mode is enabled. Reduces eye strain in low light.' : 'Use light theme for daytime browsing.'}
                    </p>
                  </div>
                  <Toggle enabled={darkMode} onChange={toggleDarkMode} label="Toggle Dark Mode" />
                </div>
              </motion.div>

              {}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className={`p-6 rounded-xl border-2 transition-all ${
                  darkMode
                    ? 'bg-slate-800/30 border-slate-700'
                    : 'bg-slate-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <FiMail className="w-5 h-5 text-amber-500" />
                      <h3 className="font-semibold text-text-primary">Email Notifications</h3>
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {emailNotifications
                        ? '✓ Receive important updates and activity summaries via email.'
                        : 'Email notifications are disabled.'}
                    </p>
                  </div>
                  <Toggle
                    enabled={emailNotifications}
                    onChange={() => handlePreferenceToggle('email', !emailNotifications)}
                    label="Toggle Email Notifications"
                    disabled={preferencesLoading === 'email'}
                  />
                </div>
              </motion.div>

              {}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`p-6 rounded-xl border-2 transition-all ${
                  darkMode
                    ? 'bg-slate-800/30 border-slate-700'
                    : 'bg-slate-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <FiBell className="w-5 h-5 text-danger" />
                      <h3 className="font-semibold text-text-primary">Push Notifications</h3>
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {pushNotifications
                        ? '✓ Get notified directly on your device for real-time updates.'
                        : 'Push notifications are disabled.'}
                    </p>
                  </div>
                  <Toggle
                    enabled={pushNotifications}
                    onChange={() => handlePreferenceToggle('push', !pushNotifications)}
                    label="Toggle Push Notifications"
                    disabled={preferencesLoading === 'push'}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2">Settings</h1>
          <p className="text-text-tertiary">Manage your account, privacy, and preferences.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <aside className="md:col-span-1">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={`card-lg sticky top-24 p-2 ${darkMode ? 'bg-slate-800/50' : 'bg-white'}`}>
              <nav className="space-y-1">
                {sections.map((item) => (
                  <button key={item.id} onClick={() => setCurrentSection(item.id)} className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${currentSection === item.id ? 'bg-primary/10 text-primary' : `text-text-secondary hover:bg-gray-100 dark:hover:bg-slate-700/50`}`}>
                    <item.icon className="w-5 h-5 flex-shrink-0" style={{ stroke: 'currentColor', fill: 'none' }} />
                    <span>{item.label}</span>
                  </button>
                ))}
                <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium text-danger hover:bg-danger/10">
                  <FiLogOut className="w-5 h-5" /><span>Logout</span>
                </button>
              </nav>
            </motion.div>
          </aside>
          <main className="md:col-span-3">
            <motion.div key={currentSection} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className={`card-lg p-6 md:p-8 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
              {renderSection()}
            </motion.div>
          </main>
        </div>
      </div>
    </MainLayout>

      {}
      <BlockConfirmModal
        isOpen={blockConfirm.open}
        onClose={() => setBlockConfirm({ open: false, user: null, isBlocking: true })}
        onConfirm={blockConfirm.isBlocking ? handleBlockUser : handleUnblockUser}
        username={blockConfirm.user?.username || ''}
        isBlocking={blockConfirm.isBlocking}
        isLoading={blockActionLoading}
        darkMode={darkMode}
      />
    </>
  );
};
