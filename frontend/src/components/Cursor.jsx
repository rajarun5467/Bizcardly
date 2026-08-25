import { useEffect, useRef } from 'react';

/**
 * Custom cursor animation - replicates the reference business card cursor effect.
 * A circular cursor follows the mouse with a pulsing animation,
 * and expands briefly on click.
 */
const Cursor = ({ theme = 'dark' }) => {
  const cursorRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    // Hide on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      cursor.style.display = 'none';
      return;
    }

    cursor.style.display = 'block';

    const handleMouseMove = (e) => {
      cursor.style.top = (e.pageY - 10) + 'px';
      cursor.style.left = (e.pageX - 10) + 'px';
    };

    const handleClick = () => {
      cursor.classList.add('ecard-expand');
      setTimeout(() => {
        cursor.classList.remove('ecard-expand');
      }, 500);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="ecard-cursor"
      style={{
        display: 'none',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        position: 'absolute',
        transitionDuration: '200ms',
        transitionTimingFunction: 'ease-out',
        pointerEvents: 'none',
        zIndex: 999998,
        animation: 'ecard-cursorAnim 0.5s infinite alternate',
      }}
    />
  );
};

export default Cursor;
