import { createPortal } from "react-dom";

export function Toast({ message }) {
  if (!message) return null;

  return createPortal(
    <div aria-live="polite" className="toast" role="status">
      {message}
    </div>,
    document.body,
  );
}
