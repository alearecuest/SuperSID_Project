import React, { ReactNode, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeButton?: boolean;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeButton = true,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-modal">
      <div className={`bg-bg-secondary rounded-lg shadow-xl ${sizeClasses[size]} w-full mx-4`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          {title && <h2 className="text-xl font-semibold">{title}</h2>}
          {closeButton && (
            <button
              onClick={onClose}
              className="text-muted hover:text-primary transition-colors"
              aria-label="Close modal"
            >
              ✕
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">{children}</div>

        {/* Footer */}
        {onConfirm && (
          <div className="flex gap-3 p-6 border-t border-border justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border hover:bg-bg-tertiary transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors"
            >
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;