import { motion } from 'framer-motion';
import { useState } from 'react';
import { useThemeStore } from '../store/themeStore';

export const AnimatedInput = ({ 
  label, 
  type = 'text', 
  placeholder = '', 
  value, 
  onChange,
  onFocus,
  onBlur,
  error = '',
  icon: Icon,
  disabled = false,
  ...props 
}) => {
  const [focused, setFocused] = useState(false);
  const { darkMode } = useThemeStore();

  const handleFocus = (e) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setFocused(value !== '' && false);
    onBlur?.(e);
  };

  const isFilled = value !== '' && value !== undefined;

  return (
    <div className="relative w-full">
      <motion.div
        className="relative"
        animate={focused || isFilled ? { y: 0 } : { y: 0 }}
      >
        <motion.label
          animate={
            focused || isFilled
              ? { y: -24, scale: 0.85 }
              : { y: 0, scale: 1 }
          }
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`absolute left-3 top-3 origin-left pointer-events-none font-medium transition-colors duration-200 ${
            focused
              ? 'text-primary'
              : error
              ? 'text-danger'
              : darkMode
              ? 'text-gray-400'
              : 'text-text-tertiary'
          }`}
        >
          {label}
        </motion.label>

        <div className="relative">
          {Icon && (
            <motion.div
              animate={focused ? { scale: 1.2, color: 'rgb(124, 58, 237)' } : { scale: 1 }}
              className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                error ? 'text-danger' : darkMode ? 'text-gray-500' : 'text-text-tertiary'
              }`}
            >
              <Icon size={18} />
            </motion.div>
          )}

          <motion.input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            animate={
              focused
                ? {
                    boxShadow: `0 0 0 3px ${darkMode ? 'rgba(124,58,237,0.1)' : 'rgba(124,58,237,0.1)'}`,
                  }
                : {}
            }
            className={`input-field pl-${Icon ? '10' : '3'} py-3 transition-all duration-200 ${
              error ? 'border-danger focus:ring-2 focus:ring-danger/30' : ''
            } ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{
              paddingLeft: Icon ? '2.5rem' : '0.75rem',
            }}
            {...props}
          />
        </div>
      </motion.div>

      {}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
          className="text-danger text-xs mt-1 flex items-center gap-1"
        >
          ⚠️ {error}
        </motion.p>
      )}
    </div>
  );
};

