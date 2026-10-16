import React from 'react';
import { ProjexLogo } from './ProjexLogo';

interface ProjexLoaderProps {
  label?: string;
  sublabel?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  className?: string;
}

export const ProjexLoader: React.FC<ProjexLoaderProps> = ({
  label = 'Loading PROJEX...',
  sublabel = 'Coordinating tasks and dependencies',
  size = 'md',
  fullScreen = false,
  className = '',
}) => {
  const logoSize = size === 'sm' ? 140 : size === 'lg' ? 220 : 170;

  const content = (
    <div className={`flex flex-col items-center justify-center text-center p-6 space-y-4 animate-fade-rise ${className}`}>
      {/* Animated Projex Mechanical Logo */}
      <div className="relative text-slate-900 dark:text-white p-2">
        <ProjexLogo size={logoSize} animated={true} />
        {/* Subtle accent glow */}
        <div className="absolute inset-0 bg-[#1E60FF]/5 rounded-3xl -z-10 blur-xl animate-pulse" />
      </div>

      {/* Status Texts */}
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          {label}
        </h4>
        {sublabel && (
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
            {sublabel}
          </p>
        )}
      </div>

      {/* Progress pill line */}
      <div className="w-32 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative">
        <div className="absolute top-0 bottom-0 left-0 bg-[#1E60FF] rounded-full w-1/2 motion-safe:animate-[pulse_1.5s_ease-in-out_infinite]" />
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-[#F8FAFC]/90 dark:bg-[#080D1A]/90 backdrop-blur-md flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};
