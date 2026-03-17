import { motion } from 'framer-motion';
import { useThemeStore } from '../store/themeStore';

export const SkeletonLoader = ({ count = 3, type = 'post' }) => {
  const { darkMode } = useThemeStore();

  const postSkeleton = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`card-lg mb-4 ${darkMode ? 'bg-slate-800' : 'bg-gray-100'}`}
    >
      {}
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`w-10 h-10 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-gray-300'}`}
        />
        <div className="flex-1">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`h-4 w-32 rounded ${darkMode ? 'bg-slate-700' : 'bg-gray-300'} mb-2`}
          />
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
            className={`h-3 w-24 rounded ${darkMode ? 'bg-slate-700' : 'bg-gray-300'}`}
          />
        </div>
      </div>

      {}
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
        className={`h-4 w-full rounded mb-2 ${darkMode ? 'bg-slate-700' : 'bg-gray-300'}`}
      />
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
        className={`h-4 w-5/6 rounded mb-4 ${darkMode ? 'bg-slate-700' : 'bg-gray-300'}`}
      />

      {}
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
        className={`w-full h-64 rounded-lg mb-4 ${darkMode ? 'bg-slate-700' : 'bg-gray-300'}`}
      />

      {}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 + i * 0.1 }}
            className={`flex-1 h-10 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-gray-300'}`}
          />
        ))}
      </div>
    </motion.div>
  );

  const userCardSkeleton = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`card p-4 ${darkMode ? 'bg-slate-800' : 'bg-gray-100'} mb-3`}
    >
      <div className="flex items-center gap-3 mb-3">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`w-10 h-10 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-gray-300'}`}
        />
        <div className="flex-1">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`h-4 w-24 rounded ${darkMode ? 'bg-slate-700' : 'bg-gray-300'} mb-2`}
          />
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
            className={`h-3 w-16 rounded ${darkMode ? 'bg-slate-700' : 'bg-gray-300'}`}
          />
        </div>
      </div>
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
        className={`h-8 w-full rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-gray-300'}`}
      />
    </motion.div>
  );

  const messageSkeleton = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="mb-3 flex gap-2"
    >
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className={`w-8 h-8 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-gray-300'}`}
      />
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
        className={`flex-1 h-10 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-gray-300'}`}
      />
    </motion.div>
  );

  const getSkeletonType = () => {
    switch (type) {
      case 'user':
        return userCardSkeleton;
      case 'message':
        return messageSkeleton;
      default:
        return postSkeleton;
    }
  };

  const skeleton = getSkeletonType();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.3 }}
        >
          {skeleton}
        </motion.div>
      ))}
    </motion.div>
  );
};

