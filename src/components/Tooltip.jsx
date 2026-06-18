import { useState } from "react";

export function Tooltip({ children, text, position = "top", className = "" }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className={`tooltip ${className}`.trim()}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <div
        aria-hidden={!isVisible}
        className={`tooltip-bubble tooltip-bubble--${position} ${isVisible ? "tooltip-bubble--visible" : ""}`}
        role="tooltip"
      >
        {text}
      </div>
    </div>
  );
}
