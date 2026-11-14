import React from 'react';

export default function Input({
  id,
  name,
  label,
  type = 'text',
  error,
  helperText,
  leftIcon = null,
  rightIcon = null,
  required = false,
  className = '',
  ...props
}) {
  const inputId = id || name;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-700 tracking-wide uppercase"
        >
          {label}
          {required && <span className="text-rose-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}

      <div className="relative rounded-xl shadow-xs">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          name={name}
          type={type}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          required={required}
          className={`block w-full rounded-xl text-sm text-slate-900 bg-white border transition-colors duration-150 py-2.5 
            ${leftIcon ? 'pl-10' : 'pl-3.5'} 
            ${rightIcon ? 'pr-10' : 'pr-3.5'} 
            ${
              error
                ? 'border-rose-400 focus:border-rose-600 focus:ring-2 focus:ring-rose-200 focus:outline-none'
                : 'border-slate-300 hover:border-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none'
            } 
            disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed ${className}`}
          {...props}
        />

        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
            {rightIcon}
          </div>
        )}
      </div>

      {error ? (
        <p id={`${inputId}-error`} className="text-xs text-rose-600 flex items-center mt-1">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${inputId}-helper`} className="text-xs text-slate-500 mt-1">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
