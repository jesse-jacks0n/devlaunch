import React, { useState, useRef, useEffect } from 'react';
import { Project, ActionState } from '../types';
import Icon from './Icon';

interface ProjectActionsProps {
    project: Project;
    actionState?: ActionState;
    onOpenIde: (ide: string) => void;
    onInstallDeps: () => void;
    onDeleteNodeModules: () => void;
    onCleanBuildFolder?: () => void;
    onRevealInExplorer: () => void;
    onRefresh: () => void;
    onArchive: () => void;
    onRemove: () => void;
    onOpenTerminal?: () => void;
    onRunScripts?: () => void;
    onGitPull?: () => void;
    onGitFetch?: () => void;
    onCheckHealth?: () => void;
    onEditNotes?: () => void;
    onManageTags?: () => void;
    onTogglePin?: () => void;
}

const ProjectActions: React.FC<ProjectActionsProps> = ({
    project,
    actionState,
    onOpenIde,
    onInstallDeps,
    onDeleteNodeModules,
    onCleanBuildFolder,
    onRevealInExplorer,
    onRefresh,
    onArchive,
    onRemove,
    onOpenTerminal,
    onRunScripts,
    onGitPull,
    onGitFetch,
    onCheckHealth,
    onEditNotes,
    onManageTags,
    onTogglePin,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isLoading = !!actionState;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isLoading}
                className={`more-btn flex items-center justify-center size-8 rounded transition-all
                    ${isLoading
                        ? 'bg-surface text-slate-500 cursor-not-allowed'
                        : 'hover:bg-surface-highlight text-slate-400 hover:text-white'
                    }`}
            >
                {isLoading ? (
                    <Icon name="progress_activity" className="text-[18px] animate-spin" />
                ) : (
                    <Icon name="more_vert" className="text-[18px]" />
                )}
            </button>

            {isOpen && !isLoading && (
                <div className="dropdown-menu absolute right-0 top-full mt-1 w-72 bg-surface border border-border-dim rounded-lg shadow-xl z-50 py-1 animate-fade-in max-h-[70vh] overflow-y-auto">
                    {/* Pin Action */}
                    {onTogglePin && (
                        <div className="px-1 py-1">
                            <button
                                onClick={() => { onTogglePin(); setIsOpen(false); }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white rounded transition-colors"
                            >
                                <Icon name={project.isPinned ? 'pin_off' : 'pin'} className={`text-[18px] ${project.isPinned ? 'text-amber-400' : 'text-slate-400'}`} />
                                {project.isPinned ? 'Unpin Project' : 'Pin Project'}
                            </button>
                        </div>
                    )}

                    {onTogglePin && <div className="h-px bg-border-dim my-1 mx-2"></div>}

                    {/* IDE Actions */}
                    <div className="px-1 py-1">
                        <button
                            onClick={() => { onOpenIde('code'); setIsOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white rounded transition-colors"
                        >
                            <Icon name="open_in_new" className="text-[18px] text-primary" />
                            Open in VS Code
                        </button>
                        <button
                            onClick={() => { onOpenIde('cursor'); setIsOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white rounded transition-colors"
                        >
                            <Icon name="edit" className="text-[18px] text-primary" />
                            Open in Cursor
                        </button>
                        {onOpenTerminal && (
                            <button
                                onClick={() => { onOpenTerminal(); setIsOpen(false); }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white rounded transition-colors"
                            >
                                <Icon name="terminal" className="text-[18px] text-primary" />
                                Open Terminal
                            </button>
                        )}
                    </div>

                    <div className="h-px bg-border-dim my-1 mx-2"></div>

                    {/* Scripts & Package Manager */}
                    {project.packageManager && (
                        <>
                            <div className="px-1 py-1">
                                {onRunScripts && (
                                    <button
                                        onClick={() => { onRunScripts(); setIsOpen(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white rounded transition-colors"
                                    >
                                        <Icon name="play_arrow" className="text-[18px] text-primary" />
                                        Run Scripts
                                        {project.scripts && project.scripts.length > 0 && (
                                            <span className="ml-auto text-[10px] font-mono bg-primary/20 text-primary px-1.5 rounded">{project.scripts.length}</span>
                                        )}
                                    </button>
                                )}
                                <button
                                    onClick={() => { onInstallDeps(); setIsOpen(false); }}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white rounded transition-colors"
                                >
                                    <Icon name="download" className="text-[18px] text-emerald-400" />
                                    Install Dependencies
                                    <span className="ml-auto text-[10px] font-mono text-slate-500">{project.packageManager}</span>
                                </button>
                                {project.hasNodeModules && (
                                    <button
                                        onClick={() => { onDeleteNodeModules(); setIsOpen(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white rounded transition-colors"
                                    >
                                        <Icon name="delete_sweep" className="text-[18px] text-orange-400" />
                                        Delete node_modules
                                        <span className="ml-auto text-[10px] font-mono text-slate-500">{project.storage}</span>
                                    </button>
                                )}
                                {onCheckHealth && (
                                    <button
                                        onClick={() => { onCheckHealth(); setIsOpen(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white rounded transition-colors"
                                    >
                                        <Icon name="health_and_safety" className="text-[18px] text-primary" />
                                        Check Health
                                        {project.healthStatus && (
                                            <span className={`ml-auto text-[10px] font-mono px-1.5 rounded ${(project.healthStatus.vulnerabilities?.high || 0) > 0
                                                ? 'bg-red-500/20 text-red-400'
                                                : project.healthStatus.outdatedCount > 0
                                                    ? 'bg-amber-500/20 text-amber-400'
                                                    : 'bg-emerald-500/20 text-emerald-400'
                                                }`}>
                                                {(project.healthStatus.vulnerabilities?.high || 0) > 0
                                                    ? `${project.healthStatus.vulnerabilities?.high} high`
                                                    : project.healthStatus.outdatedCount > 0
                                                        ? `${project.healthStatus.outdatedCount} outdated`
                                                        : 'healthy'
                                                }
                                            </span>
                                        )}
                                    </button>
                                )}
                            </div>
                            <div className="h-px bg-border-dim my-1 mx-2"></div>
                        </>
                    )}

                    {/* Build & Clean Actions - For non-Node projects or projects with build folders */}
                    {onCleanBuildFolder && project.hasBuildFolder && (
                        <>
                            <div className="px-1 py-1">
                                <button
                                    onClick={() => { onCleanBuildFolder(); setIsOpen(false); }}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white rounded transition-colors"
                                >
                                    <Icon name="cleaning_services" className="text-[18px] text-orange-400" />
                                    Clean Build Folder
                                    {project.buildStorage && (
                                        <span className="ml-auto text-[10px] font-mono text-slate-500">{project.buildStorage}</span>
                                    )}
                                </button>
                            </div>
                            <div className="h-px bg-border-dim my-1 mx-2"></div>
                        </>
                    )}

                    {/* Git Actions */}
                    {project.hasGit && (onGitPull || onGitFetch) && (
                        <>
                            <div className="px-1 py-1">
                                {onGitPull && (
                                    <button
                                        onClick={() => { onGitPull(); setIsOpen(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white rounded transition-colors"
                                    >
                                        <Icon name="download" className="text-[18px] text-primary" />
                                        Git Pull
                                    </button>
                                )}
                                {onGitFetch && (
                                    <button
                                        onClick={() => { onGitFetch(); setIsOpen(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white rounded transition-colors"
                                    >
                                        <Icon name="cloud_download" className="text-[18px] text-primary" />
                                        Git Fetch
                                    </button>
                                )}
                            </div>
                            <div className="h-px bg-border-dim my-1 mx-2"></div>
                        </>
                    )}

                    {/* Notes & Tags */}
                    {(onEditNotes || onManageTags) && (
                        <>
                            <div className="px-1 py-1">
                                {onEditNotes && (
                                    <button
                                        onClick={() => { onEditNotes(); setIsOpen(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white rounded transition-colors"
                                    >
                                        <Icon name="note" className="text-[18px] text-primary" />
                                        {project.notes ? 'Edit Notes' : 'Add Notes'}
                                        {project.notes && (
                                            <Icon name="check" className="text-[14px] ml-auto text-primary" />
                                        )}
                                    </button>
                                )}
                                {onManageTags && (
                                    <button
                                        onClick={() => { onManageTags(); setIsOpen(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white rounded transition-colors"
                                    >
                                        <Icon name="label" className="text-[18px] text-primary" />
                                        Manage Tags
                                        {project.tags && project.tags.length > 0 && (
                                            <span className="ml-auto text-[10px] font-mono bg-primary/20 text-primary px-1.5 rounded">{project.tags.length}</span>
                                        )}
                                    </button>
                                )}
                            </div>
                            <div className="h-px bg-border-dim my-1 mx-2"></div>
                        </>
                    )}

                    {/* Utility Actions */}
                    <div className="px-1 py-1">
                        <button
                            onClick={() => { onRevealInExplorer(); setIsOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white rounded transition-colors"
                        >
                            <Icon name="folder_open" className="text-[18px] text-slate-400" />
                            Reveal in Explorer
                        </button>
                        <button
                            onClick={() => { onRefresh(); setIsOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white rounded transition-colors"
                        >
                            <Icon name="refresh" className="text-[18px] text-slate-400" />
                            Refresh Project Info
                        </button>
                    </div>

                    <div className="h-px bg-border-dim my-1 mx-2"></div>

                    {/* Archive & Remove */}
                    <div className="px-1 py-1">
                        <button
                            onClick={() => { onArchive(); setIsOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white rounded transition-colors"
                        >
                            <Icon name={project.isArchived ? 'unarchive' : 'archive'} className="text-[18px] text-slate-400" />
                            {project.isArchived ? 'Unarchive Project' : 'Archive Project'}
                        </button>
                        <button
                            onClick={() => { onRemove(); setIsOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        >
                            <Icon name="remove_circle" className="text-[18px]" />
                            Remove from Library
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectActions;
