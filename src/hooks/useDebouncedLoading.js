import { useState, useEffect } from 'react';

export function useDebouncedLoading(isLoading, delay = 200) {
  const [debouncedLoading, setDebouncedLoading] = useState(false);

  useEffect(() => {
    let timer;

    if (isLoading) {
      timer = setTimeout(() => {
        setDebouncedLoading(true);
      }, delay);
    } else {
      setDebouncedLoading(false);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [isLoading, delay]);

  return debouncedLoading;
}

export default useDebouncedLoading;
