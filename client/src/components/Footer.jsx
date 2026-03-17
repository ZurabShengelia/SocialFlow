import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiGithub, FiChevronRight } from 'react-icons/fi';
import { useThemeStore } from '../store/themeStore';

export const Footer = () => {
  const { darkMode } = useThemeStore();
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { label: 'Explore', href: '/explore' },
    { label: 'Messages', href: '/messages' },
    { label: 'Stories', href: '/stories' },
    { label: 'Profile', href: '/profile' },
  ];

  const legalLinks = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Contact', href: '/contact' },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const linkVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.05, duration: 0.3 },
    }),
  };

  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '100px' }}
      variants={containerVariants}
      className={`border-t transition-colors ${
        darkMode ? 'border-slate-800 bg-slate-950' : 'border-gray-100 bg-gray-50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {}
          <motion.div variants={linkVariants} custom={0} className="md:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
              <motion.img
                src="/logo.png"
                alt="SocialFlow"
                whileHover={{ scale: 1.1, rotate: 3 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                className="w-14 h-14 rounded-xl object-cover"
                style={{ filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.5))' }}
              />
              <span
                className={`font-semibold text-lg transition-colors ${
                  darkMode ? 'text-white group-hover:text-violet-400' : 'text-gray-900 group-hover:text-violet-600'
                }`}
              >
                SocialFlow
              </span>
            </Link>
            <p
              className={`text-sm leading-relaxed ${
                darkMode ? 'text-slate-400' : 'text-gray-600'
              }`}
            >
              Connect, discover, and share your story with the world.
            </p>
          </motion.div>

          {}
          <motion.div variants={linkVariants} custom={1}>
            <h4
              className={`text-sm font-semibold mb-4 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Navigate
            </h4>
            <ul className="space-y-2">
              {navLinks.map((link, i) => (
                <motion.li key={link.label} custom={i + 2} variants={linkVariants}>
                  <Link
                    to={link.href}
                    className={`text-sm flex items-center gap-1 transition-all group ${
                      darkMode
                        ? 'text-slate-400 hover:text-violet-400'
                        : 'text-gray-600 hover:text-violet-600'
                    }`}
                  >
                    <span className="group-hover:translate-x-1 transition-transform">
                      {link.label}
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {}
          <motion.div variants={linkVariants} custom={6}>
            <h4
              className={`text-sm font-semibold mb-4 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Legal
            </h4>
            <ul className="space-y-2">
              {legalLinks.map((link, i) => (
                <motion.li key={link.label} custom={7 + i} variants={linkVariants}>
                  <Link
                    to={link.href}
                    className={`text-sm flex items-center gap-1 transition-all group ${
                      darkMode
                        ? 'text-slate-400 hover:text-violet-400'
                        : 'text-gray-600 hover:text-violet-600'
                    }`}
                  >
                    <span className="group-hover:translate-x-1 transition-transform">
                      {link.label}
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {}
          <motion.div variants={linkVariants} custom={12}>
            <h4
              className={`text-sm font-semibold mb-4 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Connect
            </h4>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="https://github.com/ZurabShengelia"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-all ${
                darkMode
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-violet-400'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-violet-600'
              }`}
            >
              <FiGithub size={16} />
              <span>GitHub</span>
            </motion.a>
          </motion.div>
        </div>

        {}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className={`h-px mb-8 origin-left ${
            darkMode ? 'bg-gradient-to-r from-slate-800 to-transparent' : 'bg-gradient-to-r from-gray-200 to-transparent'
          }`}
        />

        {}
        <motion.div
          variants={linkVariants}
          custom={13}
          className="flex flex-col sm:flex-row items-center justify-center"
        >
          <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>
            © {currentYear} SocialFlow. All rights reserved.
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
};
