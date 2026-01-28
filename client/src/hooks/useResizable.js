import { useState, useEffect, useCallback } from 'react';

const useResizable = (initialWidth = 350, minWidth = 200, maxWidth = 400) => {
  const [width, setWidth] = useState(() => {
    // Get saved width from localStorage or use initial width
    const saved = localStorage.getItem('sidebarWidth');
    return saved ? parseInt(saved, 10) : initialWidth;
  });
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent) => {
      if (isResizing) {
        const newWidth = mouseMoveEvent.clientX;
        if (newWidth >= minWidth && newWidth <= maxWidth) {
          setWidth(newWidth);
          // Save to localStorage
          localStorage.setItem('sidebarWidth', newWidth.toString());
        }
      }
    },
    [isResizing, minWidth, maxWidth]
  );

  useEffect(() => {
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResizing);
    return () => {
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  return { width, startResizing, isResizing };
};

export default useResizable;