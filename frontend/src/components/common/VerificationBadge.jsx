import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const VerificationBadge = ({ size = 16, className = "" }) => {
  return (
    <span 
      className={`inline-flex items-center text-sky-500 hover:text-sky-600 transition-colors duration-200 ${className}`} 
      title="Verified Provider by GramSathi"
    >
      <CheckCircle2 size={size} fill="currentColor" className="text-white fill-sky-500 stroke-[2.5]" />
    </span>
  );
};

export default VerificationBadge;
