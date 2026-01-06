import React from 'react';
import Icon from './Icon';

interface EmptyStateProps {
    onAddProject: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAddProject }) => {
    return (
        <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
                <div className="size-20 rounded-2xl bg-surface border border-border-dim flex items-center justify-center mx-auto mb-6">
                    <Icon name="folder_off" className="text-[40px] text-slate-600" />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">No projects yet</h3>
                <p className="text-sm text-slate-400 mb-6">
                    Add your development projects to get started. DevLaunch will automatically detect
                    project types, package managers, and Git status.
                </p>

                <button
                    onClick={onAddProject}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium px-5 py-2.5 rounded transition-colors shadow-lg shadow-primary/30"
                >
                    <Icon name="add" className="text-[18px]" />
                    Add Your First Project
                </button>

                <div className="mt-8 pt-8 border-t border-border-dim">
                    <p className="text-xs text-slate-500 mb-4 uppercase tracking-wider font-semibold">Quick Tips</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                        <div className="flex gap-3">
                            <Icon name="folder_open" className="text-[18px] text-slate-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs text-slate-300">Select any folder</p>
                                <p className="text-[10px] text-slate-500">Auto-detects project type</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Icon name="memory" className="text-[18px] text-slate-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs text-slate-300">Clean node_modules</p>
                                <p className="text-[10px] text-slate-500">Free up disk space</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Icon name="open_in_new" className="text-[18px] text-slate-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs text-slate-300">Launch in IDE</p>
                                <p className="text-[10px] text-slate-500">One-click project open</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmptyState;
