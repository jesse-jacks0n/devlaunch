import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import Icon from './Icon';

interface ToolVersion {
    name: string;
    version: string | null;
    installed: boolean;
    icon: string;
}

interface StatusBarProps {
    projectCount: number;
}

const StatusBar: React.FC<StatusBarProps> = ({ projectCount }) => {
    const [toolVersions, setToolVersions] = useState<ToolVersion[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchToolVersions = async () => {
            try {
                const versions = await invoke<ToolVersion[]>('get_tool_versions');
                setToolVersions(versions);
            } catch (e) {
                console.error('Failed to fetch tool versions:', e);
            } finally {
                setLoading(false);
            }
        };

        fetchToolVersions();
        // Refresh every 5 minutes
        const interval = setInterval(fetchToolVersions, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const getToolColor = (tool: ToolVersion) => {
        if (!tool.installed) return 'text-slate-600';
        switch (tool.name) {
            case 'Node.js': return 'text-emerald-400';
            case 'Python': return 'text-yellow-400';
            case 'Java': return 'text-orange-400';
            case 'Flutter': return 'text-blue-400';
            case 'Rust': return 'text-orange-400';
            case 'Git': return 'text-red-400';
            default: return 'text-slate-400';
        }
    };

    const getToolIcon = (tool: ToolVersion) => {
        switch (tool.name) {
            case 'Node.js': return 'nodejs';
            case 'Python': return 'python';
            case 'Java': return 'java';
            case 'Flutter': return 'flutter';
            case 'Rust': return 'rust';
            case 'Git': return 'git_logo';
            default: return 'code';
        }
    };

    return (
        <div className="statusbar-bg h-8 shrink-0 bg-[#0c0e14] border-t border-border-dim flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Ready</span>
                </div>
                <div className="h-3 w-px bg-white/10"></div>
                <span className="text-[10px] font-mono text-slate-500">{projectCount} projects</span>
            </div>
            <div className="flex items-center gap-3">
                {/* Tool Versions */}
                {!loading && toolVersions.length > 0 && (
                    <>
                        <div className="flex items-center gap-2">
                            {toolVersions.filter(t => t.installed).slice(0, 5).map((tool, index) => (
                                <div
                                    key={tool.name}
                                    className="flex items-center gap-1 group relative"
                                    title={`${tool.name} ${tool.version || 'installed'}`}
                                >
                                    <Icon name={getToolIcon(tool)} className={`text-[12px] ${getToolColor(tool)}`} />
                                    <span className={`text-[10px] font-mono ${getToolColor(tool)}`}>
                                        {tool.version ? `v${tool.version.split('.').slice(0, 2).join('.')}` : '✓'}
                                    </span>
                                    {index < toolVersions.filter(t => t.installed).slice(0, 5).length - 1 && (
                                        <span className="text-slate-700 ml-1">·</span>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="h-3 w-px bg-white/10"></div>
                    </>
                )}
                <span className="text-[10px] font-mono text-slate-500">Tauri v2.0</span>
                <div className="h-3 w-px bg-white/10"></div>
                <div className="flex items-center gap-1 text-slate-500">
                    <Icon name="desktop_windows" className="text-[12px]" />
                    <span className="text-[10px] font-mono">Desktop</span>
                </div>
            </div>
        </div>
    );
};

export default StatusBar;