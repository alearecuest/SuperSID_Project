import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'outlined';
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  className = '',
  onClick,
  hover = true,
  padding = 'md',
  variant = 'default',
}) => {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-7',
  };

  const variantClasses = {
    default: 'bg-secondary border border-border',
    elevated: 'bg-secondary shadow-lg',
    outlined: 'bg-transparent border border-border-light',
  };

  const hoverClass = hover ? 'hover:shadow-lg transition-shadow' : '';

  return (
    <div
      className={`
        rounded-lg ${paddingClasses[padding]} ${variantClasses[variant]} ${hoverClass} ${className}
        ${onClick ? 'cursor-pointer' : ''}
      `}
      onClick={onClick}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-primary mb-1">{title}</h3>}
          {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;