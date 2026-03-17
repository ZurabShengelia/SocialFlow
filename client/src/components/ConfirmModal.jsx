import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, darkMode }) => {
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, y: -50 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25,
        mass: 0.7,
      }
    },
    exit: { opacity: 0, scale: 0.8, y: -50, transition: { duration: 0.2 } },
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
            className={`rounded-2xl shadow-2xl border w-full max-w-md ${
              darkMode
                ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700/50 shadow-slate-900/50'
                : 'bg-gradient-to-br from-white to-gray-50 border-gray-200/50 shadow-gray-900/10'
            }`}
          >
            <div className="p-8 text-center">
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}
              >
                {title}
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
                className={`text-base mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
              >
                {message}
              </motion.p>
            </div>
            <div className={`flex justify-center gap-4 px-8 py-6 rounded-b-2xl border-t ${
              darkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-gray-100/50 border-gray-200/50'
            }`}>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                onClick={onClose}
                className={`px-6 py-3 rounded-xl text-lg font-semibold transition-all duration-300 ease-in-out shadow-md w-full ${
                  darkMode 
                    ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.3 }}
                onClick={onConfirm}
                className="px-6 py-3 rounded-xl text-lg font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-300 ease-in-out shadow-lg hover:shadow-red-500/50 w-full"
              >
                Delete
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;

