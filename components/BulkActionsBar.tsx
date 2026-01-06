import React from 'react';
import Icon from './Icon';
import { Project } from '../types';

interface BulkActionsBarProps {
    selectedCount: number;
    totalCount: number;
    selectedProjects: Project[];
    onSelectAll: () => void;
    onClearSelection: () => void;
    onBulkDeleteNodeModules: () => void;
    onBulkCleanBuildFolders?: () => void;
    isDeleting: boolean;
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
    selectedCount,
    totalCount,
    selectedProjects,
    onSelectAll,
    onClearSelection,
    onBulkDeleteNodeModules,
    onBulkCleanBuildFolders,
    isDeleting,
}) => {
    if (selectedCount === 0) return null;

    // Determine project types in selection
    const webProjectTypes = ['node'];
    const hasWebProjects = selectedProjects.some(p =>
        webProjectTypes.includes(p.projectType || '') || p.hasNodeModules
    );
    const hasNonWebProjects = selectedProjects.some(p =>
        !webProjectTypes.includes(p.projectType || '') && !p.hasNodeModules && p.hasBuildFolder
    );
    const isMixed = hasWebProjects && hasNonWebProjects;

    // Count projects with node_modules and build folders
    const nodeModulesCount = selectedProjects.filter(p => p.hasNodeModules).length;
    const buildFolderCount = selectedProjects.filter(p => p.hasBuildFolder && !p.hasNodeModules).length;

    return (
        <div className="bulk-actions-bar sticky top-0 z-40 mx-6 border-l border-r bg-surface/95 backdrop-blur border-b border-border-dim px-6 py-3 animate-fade-in">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <Icon name="check_box" className="text-[18px] text-primary" />
                        </div>
                        <span className="text-sm font-medium text-white">
                            {selectedCount} selected
                        </span>
                        <span className="text-xs text-slate-500">
                            of {totalCount}
                        </span>
                    </div>

                    <div className="h-5 w-px bg-border-dim"></div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={onSelectAll}
                            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-surface-highlight rounded transition-colors"
                        >
                            Select All
                        </button>
                        <button
                            onClick={onClearSelection}
                            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-surface-highlight rounded transition-colors"
                        >
                            Clear Selection
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Bulk Actions - Conditional based on project types */}
                    {isMixed ? (
                        // Mixed selection: show both options
                        <div className="flex items-center gap-2">
                            {nodeModulesCount > 0 && (
                                <button
                                    onClick={onBulkDeleteNodeModules}
                                    disabled={isDeleting}
                                    className="flex items-center gap-2 px-3 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isDeleting ? (
                                        <Icon name="progress_activity" className="text-[16px] animate-spin" />
                                    ) : (
                                        <>
                                            <Icon name="folder" className="text-[16px]" />
                                            node_modules ({nodeModulesCount})
                                        </>
                                    )}
                                </button>
                            )}
                            {buildFolderCount > 0 && onBulkCleanBuildFolders && (
                                <button
                                    onClick={onBulkCleanBuildFolders}
                                    disabled={isDeleting}
                                    className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isDeleting ? (
                                        <Icon name="progress_activity" className="text-[16px] animate-spin" />
                                    ) : (
                                        <>
                                            <Icon name="cleaning_services" className="text-[16px]" />
                                            Build folders ({buildFolderCount})
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    ) : hasWebProjects && nodeModulesCount > 0 ? (
                        // Only web projects with node_modules
                        <button
                            onClick={onBulkDeleteNodeModules}
                            disabled={isDeleting}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isDeleting ? (
                                <>
                                    <Icon name="progress_activity" className="text-[18px] animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Icon name="delete_sweep" className="text-[18px]" />
                                    Delete node_modules
                                </>
                            )}
                        </button>
                    ) : hasNonWebProjects && buildFolderCount > 0 && onBulkCleanBuildFolders ? (
                        // Only non-web projects with build folders
                        <button
                            onClick={onBulkCleanBuildFolders}
                            disabled={isDeleting}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isDeleting ? (
                                <>
                                    <Icon name="progress_activity" className="text-[18px] animate-spin" />
                                    Cleaning...
                                </>
                            ) : (
                                <>
                                    <Icon name="cleaning_services" className="text-[18px]" />
                                    Clear build files
                                </>
                            )}
                        </button>
                    ) : null}

                    <button
                        onClick={onClearSelection}
                        className="size-8 rounded-lg hover:bg-surface-highlight flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                        title="Clear selection"
                    >
                        <Icon name="close" className="text-[20px]" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkActionsBar;
