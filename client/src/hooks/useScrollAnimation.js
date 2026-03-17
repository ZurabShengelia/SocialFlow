import { useInView } from 'framer-motion';
import { useRef } from 'react';

export const useScrollInView = (options = {}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: false,
    margin: '0px 0px -100px 0px', 
    ...options,
  });

  return [ref, isInView];
};

export const useScrollInViewOnce = (options = {}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: '0px 0px -100px 0px',
    ...options,
  });

  return [ref, isInView];
};

