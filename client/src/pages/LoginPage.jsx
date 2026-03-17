import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

const GeometricBackground = () => (
  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="grid2" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid2)" />
    <circle cx="20%" cy="25%" r="200" fill="rgba(255,255,255,0.04)" />
    <circle cx="75%" cy="65%" r="240" fill="rgba(6,182,212,0.10)" />
    <circle cx="55%" cy="10%" r="90" fill="rgba(255,255,255,0.05)" />
    <polygon points="0,350 180,180 0,0" fill="rgba(255,255,255,0.03)" />
    <circle cx="88%" cy="25%" r="70" fill="rgba(255,255,255,0.06)" />
    <rect x="8%" y="65%" width="100" height="100" rx="20" fill="rgba(255,255,255,0.03)" transform="rotate(15,100,700)" />
  </svg>
);

export const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(formData.email, formData.password);
      navigate('/feed');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com', icon: FiMail },
    { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••', icon: FiLock },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen flex"
      style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}
    >
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-14"
        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 40%, #06b6d4 100%)' }}
      >
        <GeometricBackground />
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 flex items-center gap-3"
        >
          <img
            src="/logo.png"
            alt="SocialFlow"
            className="w-16 h-16 rounded-2xl object-cover"
            style={{ boxShadow: '0 0 20px rgba(255,255,255,0.3)' }}
          />
          <span className="text-white font-bold text-xl tracking-tight">SocialFlow</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10"
        >
          <h1 className="text-5xl font-bold text-white leading-tight mb-6" style={{ letterSpacing: '-0.02em' }}>
            Welcome<br />
            back to<br />
            <span style={{ color: 'rgba(6,182,212,0.9)' }}>your world.</span>
          </h1>
          <p className="text-white/70 text-lg leading-relaxed max-w-sm">
            Your feed, your stories, your community — all waiting for you. Sign in and dive back in.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6"
        >
          <p className="text-white/90 text-sm leading-relaxed mb-4">
            "I built SocialFlow to change the way creators share their work. My goal is to foster a community that is genuinely supportive and inspiring for everyone."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-violet-400 flex items-center justify-center text-white text-xs font-bold">
              Z
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Zurab Shengelia</p>
              <p className="text-white/50 text-xs">Founder of SocialFlow</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8" style={{ background: '#f8fafc' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img
              src="/logo.png"
              alt="SocialFlow"
              className="w-14 h-14 rounded-2xl object-cover"
            />
            <span className="font-bold text-lg text-gray-900">SocialFlow</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Sign in</h2>
            <p className="text-gray-500 text-sm">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="flex items-start gap-3 bg-red-100 border-2 border-red-500 rounded-lg p-4 mb-4 shadow-md"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800">{error}</p>
                </div>
              </motion.div>
            )}

            {fields.map(({ name, label, type, placeholder, icon: Icon }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                <div
                  className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 transition-all duration-200"
                  style={{
                    border: focused === name ? '1.5px solid #7c3aed' : '1.5px solid #e2e8f0',
                    boxShadow: focused === name ? '0 0 0 3px rgba(124,58,237,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                >
                  <Icon size={16} style={{ color: focused === name ? '#7c3aed' : '#94a3b8', flexShrink: 0, transition: 'color 0.2s' }} />
                  <input
                    id={`login_${name}`}
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    onFocus={() => setFocused(name)}
                    onBlur={() => setFocused('')}
                    placeholder={placeholder}
                    className="bg-transparent flex-1 outline-none text-gray-900 text-sm placeholder-gray-400"
                    required
                  />
                </div>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="pt-2"
            >
              <motion.button
                whileHover={{ scale: 1.015, boxShadow: '0 8px 25px rgba(124,58,237,0.35)' }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white text-sm transition-all duration-200"
                style={{
                  background: loading ? '#a78bfa' : 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
                  boxShadow: '0 4px 15px rgba(124,58,237,0.25)',
                }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <FiArrowRight size={15} />
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold hover:underline" style={{ color: '#7c3aed' }}>
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

