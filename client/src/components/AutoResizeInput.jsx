import React, { useRef, useEffect } from 'react';

const AutoResizeInput = ({ value, onChange, style, ...props }) => {
  const inputRef = useRef(null);

  const adjustFontSize = () => {
    if (inputRef.current) {
      const input = inputRef.current;
      const containerWidth = input.offsetWidth;
      let currentFontSize = parseFloat(window.getComputedStyle(input).fontSize);
      
      // Create a temporary span to measure the text width
      const span = document.createElement('span');
      span.style.visibility = 'hidden';
      span.style.whiteSpace = 'nowrap';
      span.style.font = window.getComputedStyle(input).font;
      span.innerText = input.value || input.placeholder || '';
      document.body.appendChild(span);
      let textWidth = span.offsetWidth;
      document.body.removeChild(span);
      
      // Decrease font size until text fits within containerWidth (with a minimum font size limit)
      while (textWidth > containerWidth && currentFontSize > 10) {
        currentFontSize -= 1;
        input.style.fontSize = currentFontSize + 'px';
        span.style.fontSize = currentFontSize + 'px';
        span.innerText = input.value || input.placeholder || '';
        textWidth = span.offsetWidth;
      }
    }
  };

  useEffect(() => {
    adjustFontSize();
  }, [value]);

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={onChange}
      style={style}
      {...props}
    />
  );
};

export default AutoResizeInput;