import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Optional label displayed above the input */
  label?: string;
  /** Error message shown below the input */
  error?: string;
  /** Additional class names for the wrapper */
  wrapperClassName?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  wrapperClassName = '',
  className = '',
  ...rest
}) => {
  const inputClasses = `form-input ${className}`.trim();
  return (
    <div className={`form-group ${wrapperClassName}`.trim()}>
      {label && <label className="form-label">{label}</label>}
      <input className={inputClasses} {...rest} />
      {error && <p className="form-error">{error}</p>}
    </div>
  );
};
