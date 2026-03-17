import { motion } from 'framer-motion';
import { FiPlay } from 'react-icons/fi';
import { useThemeStore } from '../store/themeStore';

export const GameCard = ({ game, onPlay }) => {
  const { darkMode } = useThemeStore();

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className={`rounded-xl overflow-hidden cursor-pointer shadow-lg transition-all duration-300 ${
        darkMode ? 'bg-slate-800 hover:shadow-xl hover:shadow-blue-500/20' : 'bg-white hover:shadow-xl hover:shadow-blue-500/20'
      }`}
      onClick={onPlay}
    >
      {}
      <div className="relative w-full h-48 bg-gradient-to-b from-blue-500 to-purple-600 overflow-hidden">
        {game.logoUrl ? (
          <img
            src={game.logoUrl}
            alt={game.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">{game.emoji}</span>
          </div>
        )}

        {}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            whileHover={{ scale: 1 }}
            className={`p-3 rounded-full ${
              darkMode ? 'bg-blue-500' : 'bg-blue-500'
            } text-white`}
          >
            <FiPlay size={24} />
          </motion.div>
        </div>
      </div>

      {}
      <div className="p-4">
        <h3 className={`text-lg font-bold mb-1 ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {game.name}
        </h3>
        <p className={`text-sm mb-3 line-clamp-2 ${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {game.description}
        </p>

        {}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
          className={`w-full py-2 px-4 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
            darkMode
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          <FiPlay size={16} />
          Play Now
        </motion.button>
      </div>
    </motion.div>
  );
};

