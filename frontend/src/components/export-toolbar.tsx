import { useState } from 'react';

interface ExportToolbarProps {
  onSave: (format: 'png' | 'jpeg') => void;
  onQuickSave: (format: 'png' | 'jpeg') => void;
  onCopyToClipboard: () => void;
  isExporting: boolean;
}

export function ExportToolbar({
  onSave,
  onQuickSave,
  onCopyToClipboard,
  isExporting,
}: ExportToolbarProps) {
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 glass">
      {/* Format Selection */}
      <div className="flex items-center gap-2 pr-3 border-r border-white/10">
        <span className="text-xs text-slate-400 font-medium">Format</span>
        <div className="flex gap-1">
          <button
            onClick={() => setFormat('png')}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition-all duration-200 ${
              format === 'png'
                ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
            }`}
          >
            PNG
          </button>
          <button
            onClick={() => setFormat('jpeg')}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition-all duration-200 ${
              format === 'jpeg'
                ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
            }`}
          >
            JPEG
          </button>
        </div>
      </div>

      {/* Export Actions */}
      <div className="flex items-center gap-2">
        {/* Copy to Clipboard */}
        <button
          onClick={onCopyToClipboard}
          disabled={isExporting}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg font-medium transition-all duration-200
                     bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20
                     text-slate-300 hover:text-white
                     disabled:opacity-50 disabled:cursor-not-allowed"
          title="Copy to Clipboard (Ctrl+C)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          Copy
        </button>

        {/* Quick Save */}
        <button
          onClick={() => onQuickSave(format)}
          disabled={isExporting}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg font-medium transition-all duration-200
                     bg-gradient-to-r from-cyan-500/20 to-teal-500/20 hover:from-cyan-500/30 hover:to-teal-500/30
                     border border-cyan-500/30 hover:border-cyan-500/50
                     text-cyan-300 hover:text-cyan-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
          title="Quick Save to Pictures/WinShot (Ctrl+S)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Quick Save
        </button>

        {/* Save As */}
        <button
          onClick={() => onSave(format)}
          disabled={isExporting}
          className="flex items-center gap-1.5 px-4 py-1.5 text-sm rounded-lg font-medium transition-all duration-200
                     bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500
                     text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40
                     hover:-translate-y-0.5 active:translate-y-0
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          title="Save As... (Ctrl+Shift+S)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Save As...
        </button>
      </div>

      {/* Exporting indicator */}
      {isExporting && (
        <div className="flex items-center gap-2 ml-2">
          <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-sm text-violet-300 animate-pulse font-medium">Exporting...</span>
        </div>
      )}
    </div>
  );
}
