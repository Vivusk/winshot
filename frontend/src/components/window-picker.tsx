import { useState, useEffect } from 'react';
import { WindowInfo } from '../types';
import { GetWindowList } from '../../wailsjs/go/main/App';

interface WindowPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (window: WindowInfo) => void;
}

export function WindowPicker({ isOpen, onClose, onSelect }: WindowPickerProps) {
  const [windows, setWindows] = useState<WindowInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadWindows();
    }
  }, [isOpen]);

  const loadWindows = async () => {
    setIsLoading(true);
    try {
      const list = await GetWindowList();
      // Filter out our own window and sort by title
      const filtered = (list as WindowInfo[])
        .filter(w => !w.title.includes('WinShot'))
        .sort((a, b) => a.title.localeCompare(b.title));
      setWindows(filtered);
    } catch (error) {
      console.error('Failed to get window list:', error);
    }
    setIsLoading(false);
  };

  const filteredWindows = windows.filter(w =>
    w.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-card rounded-2xl w-[600px] max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gradient">Select Window</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"
              placeholder="Search windows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white/5 text-white rounded-xl border border-white/10
                         placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-all duration-200"
            />
          </div>
        </div>

        {/* Window List */}
        <div className="flex-1 overflow-y-auto p-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                <span>Loading windows...</span>
              </div>
            </div>
          ) : filteredWindows.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              No windows found
            </div>
          ) : (
            <div className="space-y-1">
              {filteredWindows.map((window) => (
                <button
                  key={window.handle}
                  onClick={() => onSelect(window)}
                  className="w-full p-3 text-left rounded-xl transition-all duration-200
                             bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="3" y="4" width="18" height="16" rx="3" strokeWidth="2"/>
                        <path strokeLinecap="round" strokeWidth="2" d="M3 9h18"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white truncate font-medium">{window.title}</div>
                      <div className="text-xs text-slate-400">
                        <span className="text-violet-400">{window.width}</span>
                        <span className="text-slate-500"> × </span>
                        <span className="text-violet-400">{window.height}</span>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-1 transition-all duration-200"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex justify-between items-center">
          <button
            onClick={loadWindows}
            className="text-slate-400 hover:text-violet-400 transition-all duration-200 text-sm flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Refresh
          </button>
          <span className="text-sm text-slate-400">
            <span className="text-violet-400 font-medium">{filteredWindows.length}</span> windows
          </span>
        </div>
      </div>
    </div>
  );
}
