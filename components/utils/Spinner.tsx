import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeStyles = {
    sm: { width: '16px', height: '16px' },
    md: { width: '24px', height: '24px' },
    lg: { width: '32px', height: '32px' },
  };

  const spinnerStyle: React.CSSProperties = {
    ...sizeStyles[size],
    display: 'inline-block',
    borderRadius: '50%',
  };

  const circleStyle: React.CSSProperties = {
    opacity: 0.25,
    stroke: 'currentColor',
    strokeWidth: 4,
  };

  const pathStyle: React.CSSProperties = {
    opacity: 0.75,
    fill: 'currentColor',
  };

  return (
    <svg
      style={spinnerStyle}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      className={`spinner ${className}`}
    >
      <circle
        style={circleStyle}
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
      ></circle>
      <path
        style={pathStyle}
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 12 12"
          to="360 12 12"
          dur="1s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
};

export default Spinner;