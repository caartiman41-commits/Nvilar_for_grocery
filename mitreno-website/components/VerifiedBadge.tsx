import React, { useId } from 'react';

export const VerifiedBadge = ({ size, className = "w-4 h-4" }: { size?: number; className?: string }) => {
  const gradId = useId();
  
  return (
    <span 
      className={`inline-flex items-center justify-center shrink-0 ${className}`} 
      title="Mitreno Certified Boutique"
      style={size ? { width: size, height: size } : undefined}
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-[0_1px_3px_rgba(18,70,184,0.35)]">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E56D8" />
            <stop offset="50%" stopColor="#1246B8" />
            <stop offset="100%" stopColor="#0B2F84" />
          </linearGradient>
        </defs>
        {/* Mathematically Symmetrical 8-Petal Scalloped Luxury Rosette */}
        <path
          d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.67-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.34 2.19c-1.39-.46-2.9-.2-3.91.81s-1.27 2.52-.81 3.91c-1.31.67-2.19 1.91-2.19 3.34s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.81 3.91s2.52 1.27 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.67-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34z"
          fill={`url(#${gradId})`}
          stroke="#93C5FD"
          strokeWidth="0.75"
        />
        {/* Perfectly Centered White Certification Checkmark */}
        <path
          d="M7.5 12.3L10.4 15.2L16.5 9.1"
          stroke="#FFFFFF"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
};

