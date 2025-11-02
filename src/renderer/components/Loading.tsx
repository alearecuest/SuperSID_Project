import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  message = 'Loading...',
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const spinner = (
    <div className={`${sizeClasses[size]} border-4 border-border border-t-primary rounded-full animate-spin`} />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-bg-primary z-fixed">
        {spinner}
        {message && <p className="mt-4 text-text-secondary">{message}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {spinner}
      {message && <p className="mt-4 text-text-secondary">{message}</p>}
    </div>
  );
};

export default Loading;