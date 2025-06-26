import React, { useState, useRef, useEffect } from 'react';
import './BottomSheet.css';

export default function BottomSheet() {
  const sheetRef = useRef();
  const [position, setPosition] = useState('closed');
  const [touchStartY, setTouchStartY] = useState(null);
  const [mouseStartY, setMouseStartY] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const getY = (pos) => {
    if (pos === 'closed') return window.innerHeight - 80;
    if (pos === 'half') return window.innerHeight / 2;
    if (pos === 'full') return 100;
  };

  // Touch events
  const handleTouchStart = (e) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    const diff = e.touches[0].clientY - touchStartY;
    if (sheetRef.current) {
      sheetRef.current.style.transition = 'none';
      sheetRef.current.style.transform = `translateY(${getY(position) + diff}px)`; // ✅ Fixed
    }
  };

  const handleTouchEnd = (e) => {
    const moved = e.changedTouches[0].clientY - touchStartY;
    if (moved < -100) setPosition('full');
    else if (moved > 100) setPosition('closed');
    else setPosition('half');
  };

  // Mouse events (inside useEffect to fix ESLint warning)
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const diff = e.clientY - mouseStartY;
      if (sheetRef.current) {
        sheetRef.current.style.transition = 'none';
        sheetRef.current.style.transform = `translateY(${getY(position) + diff}px)`; // ✅ Fixed
      }
    };

    const handleMouseUp = (e) => {
      if (!isDragging) return;
      setIsDragging(false);
      const moved = e.clientY - mouseStartY;
      if (moved < -100) setPosition('full');
      else if (moved > 100) setPosition('closed');
      else setPosition('half');
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, mouseStartY, position]);

  // Position update animation
  useEffect(() => {
    if (sheetRef.current) {
      sheetRef.current.style.transition = 'transform 0.3s cubic-bezier(0.25, 1.25, 0.5, 1)';
      sheetRef.current.style.transform = `translateY(${getY(position)}px)`; // ✅ Fixed
    }
  }, [position]);

  // Keyboard accessibility
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setPosition('closed');
      else if (e.key === 'ArrowUp') {
        setPosition((prev) => (prev === 'closed' ? 'half' : 'full'));
      } else if (e.key === 'ArrowDown') {
        setPosition((prev) => (prev === 'full' ? 'half' : 'closed'));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Mouse down (start drag)
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setMouseStartY(e.clientY);
  };

  return (
    <>
      {/* Backdrop */}
      {position !== 'closed' && (
        <div className="backdrop" onClick={() => setPosition('closed')} />
      )}

      {/* Control buttons */}
      <div className="controls">
        <button onClick={() => setPosition('full')}>Full</button>
        <button onClick={() => setPosition('half')}>Half</button>
        <button onClick={() => setPosition('closed')}>Close</button>
      </div>

      {/* Bottom Sheet */}
      <div
        className="bottom-sheet"
        ref={sheetRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        <div className="handle" />
        <div className="sheet-content">
          <h2>Bottom Sheet</h2>
          <p>This bottom sheet supports multiple snap points, drag gestures, and keyboard control.</p>
        </div>
      </div>
    </>
  );
}
