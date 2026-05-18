import React from 'react';
import { FaMobileAlt } from 'react-icons/fa'; // Supprimer FaUsers

const Logo = ({ size = 'md', variant = 'default', className = '' }) => {
  const sizes = {
    sm: {
      container: 'w-12 h-12',
      icon: 'text-2xl',
      text: 'text-sm',
      subtext: 'text-[8px]'
    },
    md: {
      container: 'w-16 h-16',
      icon: 'text-3xl',
      text: 'text-base',
      subtext: 'text-[10px]'
    },
    lg: {
      container: 'w-24 h-24',
      icon: 'text-5xl',
      text: 'text-2xl',
      subtext: 'text-xs'
    },
    xl: {
      container: 'w-32 h-32',
      icon: 'text-6xl',
      text: 'text-3xl',
      subtext: 'text-sm'
    }
  };

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center ${className}`}>
        <div className={`bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl ${sizes[size].container} flex items-center justify-center shadow-lg`}>
          <FaMobileAlt className={`${sizes[size].icon} text-white`} />
        </div>
        <div className="ml-2">
          <span className={`font-bold text-gray-800 ${sizes[size].text}`}>Friend</span>
          <span className={`font-bold text-indigo-600 ${sizes[size].text}`}>Mobile</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`text-center ${className}`}>
      <div className={`bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl ${sizes[size].container} mx-auto flex items-center justify-center shadow-lg mb-3`}>
        <FaMobileAlt className={`${sizes[size].icon} text-white`} />
      </div>
      <div>
        <h1 className={`font-bold ${sizes[size].text} text-gray-800`}>
          Friend<span className="text-indigo-600">Mobile</span>
        </h1>
        <p className={`text-gray-500 ${sizes[size].subtext} mt-1`}>Connect. Share. Together.</p>
      </div>
    </div>
  );
};

export default Logo;