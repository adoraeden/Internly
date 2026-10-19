import React from 'react';

interface LogoProps {
  collapsed?: boolean;
  theme?: 'dark' | 'light' | 'teal';
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({
  collapsed = false,
  theme = 'teal',
  showTagline = false,
  size = 'md',
}) => {
  const isDark = theme === 'dark' || theme === 'teal';

  const markSize =
    size === 'lg' ? 'w-10 h-10' : size === 'sm' ? 'w-7 h-7' : 'w-8 h-8';
  const iconSize =
    size === 'lg' ? 'w-5 h-5' : size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const textSize =
    size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-base' : 'text-lg';

  return (
    <div className="flex items-center gap-2.5">
      {/* Deep Teal geometric mark: upward step & forward progression */}
      <div
        className={`relative flex items-center justify-center rounded-xl bg-[#087E83] text-white shadow-xs shrink-0 ring-1 ring-white/20 ${markSize}`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={iconSize}
        >
          {/* Base foundation step */}
          <rect x="4" y="14" width="6" height="6" rx="1.2" fill="white" fillOpacity="0.8" />
          {/* Elevated second step */}
          <rect x="10" y="9" width="6" height="11" rx="1.2" fill="white" />
          {/* Dynamic forward arrow/step */}
          <path
            d="M16 5L20 5L20 9M20 5L14 11"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {!collapsed && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`${textSize} font-bold tracking-tight leading-none ${
                isDark ? 'text-white' : 'text-[#155456]'
              }`}
            >
              Internly
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#087E83] inline-block self-center" />
          </div>
          {showTagline && (
            <span
              className={`text-[11px] font-medium leading-tight mt-0.5 ${
                isDark ? 'text-[#E1F0EF]/80' : 'text-[#687879]'
              }`}
            >
              Make your next move.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
