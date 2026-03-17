import { useState } from 'react';
import { MainLayout } from '../components/MainLayout';
import { GameCard } from '../components/GameCard';
import { useThemeStore } from '../store/themeStore';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPlay } from 'react-icons/fi';

export const GamesPage = () => {
  const { darkMode } = useThemeStore();
  const [selectedGame, setSelectedGame] = useState(null);

  const games = [
    {
      id: 'battleship',
      name: 'Battleship Game',
      description: 'Classic naval combat strategy game. Deploy your fleet and sink your opponent\'s ships!',
      emoji: '🚢',
      path: '/games/Battleship Game/index.html',
      logoUrl: '/games/Battleship Game/logo.png'
    },
    {
      id: 'chess',
      name: 'King Chess',
      description: 'Strategic chess game. Test your tactical skills against intelligent opponents.',
      emoji: '♟️',
      path: '/games/King Chess/index.html',
      logoUrl: '/games/King Chess/pictures/Logo.jpg'
    },
    {
      id: 'medieval',
      name: 'Medieval Defense',
      description: 'Defend your castle from enemy waves. Build and upgrade your defenses strategically.',
      emoji: '🏰',
      path: '/games/Medieval Defense/index.html',
      logoUrl: '/games/Medieval Defense/pictures/Logo.png'
    },
    {
      id: 'snake',
      name: 'Neon Snake in Matrix',
      description: 'A futuristic twist on the classic snake game with glowing neon effects.',
      emoji: '🐍',
      path: '/games/Neon Snake in Matrix/index.html',
      logoUrl: '/games/Neon Snake in Matrix/pictures/logo.png'
    },
    {
      id: 'tictactoe',
      name: 'Neon Tic-Tac-Toe',
      description: 'Modern take on the classic Tic-Tac-Toe with stunning neon graphics.',
      emoji: '⭕',
      path: '/games/Neon Tic-Tac-Toe/index.html',
      logoUrl: '/games/Neon Tic-Tac-Toe/pictures/logo.jpg'
    },
    {
      id: 'rps',
      name: 'Rock Paper Scissors',
      description: 'Classic Rock-Paper-Scissors game. Can you beat the computer?',
      emoji: '✋',
      path: '/games/Rock Paper Scissors/index.html',
      logoUrl: '/games/Rock Paper Scissors/Images/logo.png'
    },
    {
      id: 'trex',
      name: 'Weird T-Rex',
      description: 'Jump over obstacles like the famous Chrome dinosaur game but with a weird twist!',
      emoji: '🦖',
      path: '/games/Wierd T-Rex/index.html',
      logoUrl: '/games/Wierd T-Rex/logo.png'
    },
  ];

  const handlePlayGame = (game) => {
    setSelectedGame(game);
  };

  const handleCloseGame = () => {
    setSelectedGame(null);
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`min-h-screen py-8 px-4 ${
          darkMode ? 'bg-slate-900' : 'bg-gray-50'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          {}
          <motion.div
            initial={{ x: -50 }}
            animate={{ x: 0 }}
            className="mb-12"
          >
            <h1 className={`text-4xl md:text-5xl font-bold mb-3 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              🎮 Games Hub
            </h1>
            <p className={`text-lg ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Choose your game and have fun! Click on any game to play.
            </p>
          </motion.div>

          {}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {games.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GameCard
                  game={game}
                  onPlay={() => handlePlayGame(game)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {}
      <AnimatePresence>
        {selectedGame && (
          <>
            {}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseGame}
              className="fixed inset-0 bg-black z-40"
            />

            {}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex flex-col"
            >
              {}
              <div className={`flex items-center justify-between p-4 border-b ${
                darkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <h2 className={`text-2xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {selectedGame.name}
                </h2>
                <button
                  onClick={handleCloseGame}
                  className={`p-3 rounded-full transition ${
                    darkMode
                      ? 'bg-slate-800 hover:bg-slate-700'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  <FiX size={24} className={darkMode ? 'text-white' : 'text-gray-900'} />
                </button>
              </div>

              {}
              <div className="flex-1 overflow-hidden">
                <iframe
                  src={selectedGame.path}
                  title={selectedGame.name}
                  className="w-full h-full border-none"
                  sandbox="allow-scripts allow-same-origin allow-pointer-lock"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </MainLayout>
  );
};

