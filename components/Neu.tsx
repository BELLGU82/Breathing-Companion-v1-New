import React from 'react';

interface NeuProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: (event: React.MouseEvent<any>) => void;
  active?: boolean;
}

export const NeuCard: React.FC<NeuProps> = ({ children, className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-neu-base rounded-2xl shadow-neu-flat p-6 ${className} ${onClick ? 'cursor-pointer active:shadow-neu-pressed transition-all duration-200' : ''}`}
    >
      {children}
    </div>
  );
};

export const NeuButton: React.FC<NeuProps & { size?: 'sm' | 'md' | 'lg', variant?: 'primary' | 'danger' | 'secondary', disabled?: boolean }> = ({ 
  children, 
  className = '', 
  onClick, 
  active = false,
  size = 'md',
  variant = 'primary',
  disabled = false
}) => {
  const sizeClasses = {
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6'
  };
  
  const textColors = {
    primary: 'text-neu-text',
    danger: 'text-red-500',
    secondary: 'text-gray-500'
  };

  return (
    <button
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      className={`
        rounded-xl font-medium outline-none 
        transition-all duration-200 ease-in-out select-none flex items-center justify-center
        ${sizeClasses[size]}
        ${active ? 'shadow-neu-pressed text-neu-accent' : 'shadow-neu-flat bg-neu-base'}
        ${textColors[variant]}
        ${className}
        ${disabled ? 'opacity-50 cursor-not-allowed shadow-none' : 'active:shadow-neu-pressed'}
      `}
    >
      {children}
    </button>
  );
};

export const NeuIconButton: React.FC<NeuProps> = ({ children, className = '', onClick, active }) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-12 h-12 rounded-full flex items-center justify-center outline-none
        transition-all duration-200 ease-in-out
        ${active ? 'shadow-neu-pressed text-neu-accent' : 'shadow-neu-flat bg-neu-base text-neu-text'}
        active:shadow-neu-pressed
        ${className}
      `}
    >
      {children}
    </button>
  );
};