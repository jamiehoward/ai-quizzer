import React, { useEffect } from 'react';

function FlashMessage({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`flash-message ${type}`}>
      {message}
    </div>
  );
}

export default FlashMessage;
