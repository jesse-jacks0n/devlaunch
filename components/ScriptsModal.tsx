import React, { useState, useEffect } from 'react';
import { ProjectScript } from '../types';
import Icon from './Icon';

interface ScriptsModalProps {
    isOpen: boolean;
    projectName: string;
    projectPath: string;
    scripts: ProjectScript[];
    isLoading: boolean;
    onRunScript: (scriptName: string) => void;
    onClose: () => void;
}

const ScriptsModal: React.FC<ScriptsModalProps> = ({
    isOpen,
    projectName,
    projectPath,
    scripts,
    isLoading,
    onRunScript,
    onClose,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [runningScript, setRunningScript] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setSearchQuery('');
            setRunningScript(null);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            return () => document.removeEventListener('keydown', handleEsc);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const filteredScripts = scripts.filter(script =>
        script.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        script.command.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleRunScript = (scriptName: string) => {
        setRunningScript(scriptName);
        onRunScript(scriptName);
        setTimeout(() => setRunningScript(null), 1000);
    };

    // Categorize scripts
    const categorizeScript = (name: string): string => {
        if (['dev', 'start', 'serve'].includes(name)) return 'Development';
        if (['build', 'compile'].includes(name)) return 'Build';
        if (['test', 'test:watch', 'test:coverage', 'e2e'].some(t => name.includes(t.replace(':', '')))) return 'Testing';
        if (['lint', 'format', 'prettier', 'eslint'].some(t => name.includes(t))) return 'Code Quality';
        return 'Other';
    };

    const groupedScripts = filteredScripts.reduce((acc, script) => {
        const category = categorizeScript(script.name);
        if (!acc[category]) acc[category] = [];
        acc[category].push(script);
        return acc;
    }, {} as Record<string, ProjectScript[]>);

    const categoryOrder = ['Development', 'Build', 'Testing', 'Code Quality', 'Other'];
    const sortedCategories = Object.keys(groupedScripts).sort(
        (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
    );

    const getCategoryIcon = (category: string): string => {
        switch (category) {
            case 'Development': return 'play_arrow';
            case 'Build': return 'construction';
            case 'Testing': return 'science';
            case 'Code Quality': return 'check_circle';
            default: return 'terminal';
        }
    };

    const getCategoryColor = (category: string): string => {
        switch (category) {
            case 'Development': return 'text-emerald-400';
            case 'Build': return 'text-orange-400';
            case 'Testing': return 'text-purple-400';
            case 'Code Quality': return 'text-cyan-400';
            default: return 'text-slate-400';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="modal-dialog w-full max-w-2xl bg-background border border-border-dim rounded-xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border-dim bg-surface/50">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <Icon name="terminal" className="text-[24px] text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Run Scripts</h2>
                            <p className="text-xs text-slate-500 font-mono">{projectName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="size-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                    >
                        <Icon name="close" className="text-[20px]" />
                    </button>
                </div>

                {/* Search */}
                <div className="px-6 py-3 border-b border-border-dim">
                    <div className="relative">
                        <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search scripts..."
                            className="w-full pl-10 pr-4 py-2 bg-surface border border-border-dim rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary/50"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Scripts List */}
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <Icon name="progress_activity" className="text-[32px] text-primary animate-spin" />
                            <p className="text-sm text-slate-400">Loading scripts...</p>
                        </div>
                    ) : scripts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <Icon name="code_off" className="text-[48px] text-slate-600" />
                            <p className="text-sm text-slate-400">No scripts found in package.json</p>
                        </div>
                    ) : filteredScripts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <Icon name="search_off" className="text-[48px] text-slate-600" />
                            <p className="text-sm text-slate-400">No scripts match "{searchQuery}"</p>
                        </div>
                    ) : (
                        <div className="p-4 space-y-4">
                            {sortedCategories.map(category => (
                                <div key={category}>
                                    <div className="flex items-center gap-2 px-2 mb-2">
                                        <Icon name={getCategoryIcon(category)} className={`text-[14px] ${getCategoryColor(category)}`} />
                                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                                            {category}
                                        </span>
                                        <span className="text-[10px] text-slate-600 font-mono">
                                            ({groupedScripts[category].length})
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        {groupedScripts[category].map(script => (
                                            <div
                                                key={script.name}
                                                className="group flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface transition-colors"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-white">{script.name}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 font-mono truncate mt-0.5" title={script.command}>
                                                        {script.command}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleRunScript(script.name)}
                                                    disabled={runningScript === script.name}
                                                    className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                                                >
                                                    {runningScript === script.name ? (
                                                        <>
                                                            <Icon name="progress_activity" className="text-[14px] animate-spin" />
                                                            Running...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Icon name="play_arrow" className="text-[14px]" />
                                                            Run
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-border-dim bg-surface/30 flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                        Scripts will run in a new terminal window
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-600">Press</span>
                        <kbd className="px-1.5 py-0.5 bg-surface border border-border-dim rounded text-[10px] font-mono text-slate-400">ESC</kbd>
                        <span className="text-xs text-slate-600">to close</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScriptsModal;
