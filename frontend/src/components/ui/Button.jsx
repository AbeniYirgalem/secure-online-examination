import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const variantClasses = {
  primary:
    'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow focus-visible:ring-blue-600 disabled:bg-blue-300',
  secondary:
    'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 focus-visible:ring-slate-400 disabled:bg-slate-100 disabled:text-slate-400',
  outline:
    'bg-transparent hover:bg-blue-50 text-blue-600 border border-blue-600 focus-visible:ring-blue-600 disabled:border-blue-300 disabled:text-blue-300',
  ghost:
    'bg-transparent hover:bg-slate-100 text-slate-700 focus-visible:ring-slate-400 disabled:text-slate-400',
  danger:
    'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus-visible:ring-rose-600 disabled:bg-rose-300',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs font-medium rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm font-medium rounded-xl gap-2',
  lg: 'px-6 py-2.5 text-base font-semibold rounded-xl gap-2.5',
};

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  ...props
}) {
  const baseClasses =
    'inline-flex items-center justify-center transition-all duration-150 ease-in-out cursor-pointer disabled:cursor-not-allowed select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  const selectedVariant = variantClasses[variant] || variantClasses.primary;
  const selectedSize = sizeClasses[size] || sizeClasses.md;

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${selectedVariant} ${selectedSize} ${className}`}
      {...props}
    >
      {isLoading ? (
        <LoadingSpinner size={size === 'lg' ? 'md' : 'sm'} className={variant === 'primary' || variant === 'danger' ? 'text-white' : 'text-slate-600'} />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
}
