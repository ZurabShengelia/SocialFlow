import { motion } from 'framer-motion';
import { pageVariants } from '../utils/animationVariants';

export const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={pageVariants.initial}
      animate={pageVariants.animate}
      exit={pageVariants.exit}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

