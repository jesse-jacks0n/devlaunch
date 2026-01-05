import React from 'react';

interface BulkActionsBarProps {
    selectedCount: number;
    totalCount: number;
    onSelectAll: () => void;
    onClearSelection: () => void;
    onBulkDeleteNodeModules: () => void;
    isDeleting: boolean;
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
    selectedCount,
    totalCount,
    onSelectAll,
    onClearSelection,
    onBulkDeleteNodeModules,
    isDeleting,
}) => {
    if (selectedCount === 0) return null;

    return (
        <div className="bulk-actions-bar sticky top-0 z-40 mx-6 border-l border-r bg-surface/95 backdrop-blur border-b border-border-dim px-6 py-3 animate-fade-in">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[18px] text-primary">check_box</span>
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
                    {/* Bulk Actions */}
                    <button
                        onClick={onBulkDeleteNodeModules}
                        disabled={isDeleting}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isDeleting ? (
                            <>
                                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                                Deleting...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
                                Delete All node_modules
                            </>
                        )}
                    </button>

                    <button
                        onClick={onClearSelection}
                        className="size-8 rounded-lg hover:bg-surface-highlight flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                        title="Clear selection"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkActionsBar;
