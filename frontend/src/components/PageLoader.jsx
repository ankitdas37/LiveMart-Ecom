import React from 'react';

const PageLoader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors z-50">
      <div className="relative flex items-center justify-center">
        {/* Outer pulsating ring */}
        <div className="absolute inset-0 border-4 border-amber-500/20 rounded-full w-20 h-20 animate-ping"></div>
        {/* Inner spinning ring */}
        <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-700 border-t-amber-500 rounded-full animate-spin"></div>
        {/* Center dot */}
        <div className="absolute w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

export default PageLoader;
