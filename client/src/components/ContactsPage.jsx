import React, { useState } from 'react';
import '../styles/ContactsPage.css';

function ContactsPage() {
  const [position, setPosition] = useState({ x: 70, y: 150 });
  const [size, setSize] = useState({ width: 420, height: 700 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  return (
    <div 
      className="contacts-page-wrapper"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div 
        className="contacts-background"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${size.width}px`,
          height: `${size.height}px`
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="resize-handle" />
      </div>
    </div>
  );
}

export default ContactsPage;