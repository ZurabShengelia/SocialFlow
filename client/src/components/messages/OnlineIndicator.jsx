

const SIZE_MAP = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3.5 h-3.5',
};

const RING_MAP = {
  light: 'ring-white',
  dark: 'ring-slate-900',
  card: 'ring-slate-800',
  header: 'ring-white/80',
};

export const OnlineIndicator = ({
  isOnline,
  size = 'md',
  ringColor = 'light',
  className = '',
  pulse = true,
}) => {
  if (!isOnline) return null;

  return (
    <span className={`relative block ${SIZE_MAP[size] ?? SIZE_MAP.md} ${className}`}>
      {}
      {pulse && (
        <span
          className={`
            absolute inset-0 rounded-full bg-emerald-400 opacity-60
            animate-ping
          `}
          style={{ animationDuration: '2s' }}
        />
      )}
      {}
      <span
        className={`
          relative block w-full h-full rounded-full
          bg-emerald-400
          ring-2 ${RING_MAP[ringColor] ?? RING_MAP.light}
        `}
        aria-label="Online"
      />
    </span>
  );
};

