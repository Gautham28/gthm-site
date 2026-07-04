import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const GAP = 8;

export function Tooltip({ children, text, position = "top", className = "" }) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState(null);
  const triggerRef = useRef(null);

  const updatePosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();

    setCoords({
      top: position === "bottom" ? rect.bottom + GAP : rect.top - GAP,
      left: rect.left + rect.width / 2,
    });
  };

  const handleEnter = () => {
    updatePosition();
    setIsVisible(true);
  };

  const handleLeave = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    if (!isVisible) return;

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isVisible]);

  return (
    <div
      ref={triggerRef}
      className={`tooltip ${className}`.trim()}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {children}
      {coords
        ? createPortal(
            <div
              aria-hidden={!isVisible}
              className={`tooltip-bubble tooltip-bubble--${position} ${isVisible ? "tooltip-bubble--visible" : ""}`}
              role="tooltip"
              style={{ top: coords.top, left: coords.left }}
            >
              {text}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
