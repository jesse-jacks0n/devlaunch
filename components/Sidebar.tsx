import React from 'react';
import { ViewType } from '../types';

interface SidebarProps {
    currentView: ViewType;
    onViewChange: (view: ViewType) => void;
    projectCount: number;
    nodeProjectCount: number;
    totalStorage: string;
    theme: 'dark' | 'light';
    onToggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, projectCount, nodeProjectCount, totalStorage, theme, onToggleTheme }) => {
    return (
        <aside className="sidebar-bg w-64 bg-[#111422] border-r border-border-dim flex flex-col justify-between shrink-0 z-20">
            <div className="flex flex-col">
                {/* Brand */}
                <div className="h-16 flex items-center px-5 border-b border-border-dim">
                    <div className="flex items-center gap-3">
                        
                        <div>
                            <h1 className="text-white text-sm font-bold tracking-tight">DevLaunch</h1>
                            <p className="text-xs text-slate-500 font-mono">v3.0.1-beta</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <div className="p-3 flex flex-col gap-1 mt-4">
                    <button
                        onClick={() => onViewChange('library')}
                        className={`flex items-center gap-3 px-3 py-2 rounded transition-all w-full text-left
                            ${currentView === 'library'
                                ? 'bg-primary/10 border border-primary/20 text-white'
                                : 'hover:bg-white/5 text-slate-400 hover:text-white border border-transparent'
                            }`}
                    >
                        <span className={`material-symbols-outlined ${currentView === 'library' ? 'text-primary icon-fill' : ''}`}>folder_open</span>
                        <span className="text-sm font-medium">Library</span>
                        <span className="ml-auto text-[10px] font-mono text-slate-500">{projectCount}</span>
                    </button>
                    <button
                        onClick={() => onViewChange('activity')}
                        className={`flex items-center gap-3 px-3 py-2 rounded transition-all w-full text-left
                            ${currentView === 'activity'
                                ? 'bg-primary/10 border border-primary/20 text-white'
                                : 'hover:bg-white/5 text-slate-400 hover:text-white border border-transparent'
                            }`}
                    >
                        <span className={`material-symbols-outlined ${currentView === 'activity' ? 'text-primary icon-fill' : ''}`}>monitoring</span>
                        <span className="text-sm font-medium">Activity</span>
                    </button>
                    <button
                        onClick={() => onViewChange('statistics')}
                        className={`flex items-center gap-3 px-3 py-2 rounded transition-all w-full text-left
                            ${currentView === 'statistics'
                                ? 'bg-primary/10 border border-primary/20 text-white'
                                : 'hover:bg-white/5 text-slate-400 hover:text-white border border-transparent'
                            }`}
                    >
                        <span className={`material-symbols-outlined ${currentView === 'statistics' ? 'text-primary icon-fill' : ''}`}>pie_chart</span>
                        <span className="text-sm font-medium">Statistics</span>
                    </button>

                    <div className="h-px bg-border-dim my-2 mx-3"></div>

                    <div className="px-3 py-2">
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Quick Stats</p>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500">Total Projects</span>
                                <span className="text-slate-300 font-mono">{projectCount}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500">Node Projects</span>
                                <span className="text-slate-300 font-mono">{nodeProjectCount}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500">Storage Used</span>
                                <span className="text-slate-300 font-mono">{totalStorage}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-3 border-t border-border-dim">
                <div className="flex items-center gap-2 mb-1">
                    <button
                        onClick={() => onViewChange('settings')}
                        className={`flex-1 flex items-center gap-3 px-3 py-2 rounded transition-all text-left
                            ${currentView === 'settings'
                                ? 'bg-primary/10 border border-primary/20 text-white'
                                : 'hover:bg-white/5 text-slate-400 hover:text-white border border-transparent'
                            }`}
                    >
                        <span className={`material-symbols-outlined ${currentView === 'settings' ? 'text-primary' : ''}`}>settings</span>
                        <span className="text-sm font-medium">Settings</span>
                    </button>
                    <button
                        onClick={onToggleTheme}
                        className="size-9 flex items-center justify-center rounded border border-transparent hover:bg-white/5 text-slate-400 hover:text-white transition-all"
                        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                        </span>
                    </button>
                </div>
                {/* <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white/5 text-slate-400 hover:text-white transition-all">
                    <span className="material-symbols-outlined">help</span>
                    <span className="text-sm font-medium">Documentation</span>
                </a> */}
            </div>
        </aside>
    );
};

export default Sidebar;