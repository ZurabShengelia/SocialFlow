import { useEffect, useRef, useState } from 'react';

export const AnimatedCounter = ({ from = 0, to, duration = 400 }) => {
  const [count, setCount] = useState(from);
  const countRef = useRef(from);

  useEffect(() => {
    if (to === countRef.current) return;

    const startValue = countRef.current;
    const increment = (to - startValue) / (duration / 16);
    let currentValue = startValue;

    const timer = setInterval(() => {
      currentValue += increment;

      if ((increment > 0 && currentValue >= to) || (increment < 0 && currentValue <= to)) {
        setCount(to);
        countRef.current = to;
        clearInterval(timer);
      } else {
        setCount(Math.round(currentValue));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [to, duration]);

  return <span>{count}</span>;
};

