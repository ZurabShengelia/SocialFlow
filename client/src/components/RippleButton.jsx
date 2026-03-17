import { motion } from 'framer-motion';
import { useState, useRef } from 'react';

export const RippleButton = ({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  ...props 
}) => {
  const [ripples, setRipples] = useState([]);
  const buttonRef = useRef(null);

  const handleClick = (e) => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = {
      id: Date.now(),
      x,
      y,
      size,
    };

    setRipples((prev) => [...prev, ripple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
    }, 600);

    onClick?.(e);
  };

  const variants = {
    primary: 'bg-primary hover:bg-primary/90 text-white',
    secondary: 'bg-gray-200 dark:bg-slate-700 text-text-primary hover:bg-gray-300 dark:hover:bg-slate-600',
    danger: 'bg-danger hover:bg-danger/90 text-white',
    ghost: 'hover:bg-gray-100 dark:hover:bg-slate-700/50 text-text-primary',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <motion.button
      ref={buttonRef}
      onClick={handleClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`relative overflow-hidden rounded-lg font-medium transition-all duration-200 ${
        variants[variant]
      } ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      {...props}
    >
      {}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          initial={{
            x: ripple.x,
            y: ripple.y,
            scale: 0,
            opacity: 0.4,
          }}
          animate={{
            scale: 2,
            opacity: 0,
          }}
          transition={{
            duration: 0.6,
            ease: 'easeOut',
          }}
          className="absolute pointer-events-none bg-white rounded-full"
          style={{
            width: ripple.size,
            height: ripple.size,
          }}
        />
      ))}

      {}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
};

