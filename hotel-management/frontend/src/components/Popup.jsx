import { useEffect } from 'react';

export default function Popup({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [message, duration, onClose]);

  return (
    <div className={`popup popup-${type}`} role="status" aria-live="polite">
      <span>{type === 'success' ? '✔' : '⚠'}</span> {message}
      <button className="popup-close" onClick={onClose} aria-label="Close message">×</button>
    </div>
  );
}
