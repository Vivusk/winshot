import { WindowMinimise, WindowToggleMaximise, Quit } from '../../wailsjs/runtime/runtime';

interface TitleBarProps {
  title?: string;
}

export function TitleBar({ title = 'WinShot' }: TitleBarProps) {
  return (
    <div
      className="flex items-center h-10 glass select-none border-b-0"
      style={{ '--wails-draggable': 'drag' } as React.CSSProperties}
    >
      {/* App icon and title - draggable area */}
      <div className="flex items-center gap-2.5 px-4 flex-1 h-full">
        {/* Vibrant gradient icon */}
        <div className="relative">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <rect x="3" y="3" width="18" height="18" rx="3" stroke="url(#iconGradient)" strokeWidth="2"/>
            <circle cx="8.5" cy="8.5" r="1.5" fill="url(#iconGradient)"/>
            <path stroke="url(#iconGradient)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M21 15l-5-5L5 21"/>
          </svg>
        </div>
        <span className="text-sm font-semibold text-gradient">{title}</span>
      </div>

      {/* Window controls - not draggable */}
      <div
        className="flex h-full"
        style={{ '--wails-draggable': 'no-drag' } as React.CSSProperties}
      >
        {/* Minimize button */}
        <button
          onClick={() => WindowMinimise()}
          className="w-11 h-full flex items-center justify-center text-slate-400
                     hover:bg-white/10 hover:text-white transition-all duration-200"
          title="Minimize"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeWidth="2" d="M5 12h14" />
          </svg>
        </button>

        {/* Maximize/Restore button */}
        <button
          onClick={() => WindowToggleMaximise()}
          className="w-11 h-full flex items-center justify-center text-slate-400
                     hover:bg-white/10 hover:text-white transition-all duration-200"
          title="Maximize"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="2" />
          </svg>
        </button>

        {/* Close button */}
        <button
          onClick={() => Quit()}
          className="w-11 h-full flex items-center justify-center text-slate-400
                     hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 hover:text-white transition-all duration-200"
          title="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
