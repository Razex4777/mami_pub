import { useState, useEffect } from 'react';

export const useLottieAnimation = (path: string) => {
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(path)
      .then(response => response.json())
      .then(data => {
        setAnimationData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading animation:', error);
        setLoading(false);
      });
  }, [path]);

  return { animationData, loading };
};
