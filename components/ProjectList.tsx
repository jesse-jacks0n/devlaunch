import React from 'react';
import { Project, TechStack, ActionState } from '../types';
import ProjectActions from './ProjectActions';

interface ProjectListProps {
    projects: Project[];
    viewMode: 'list' | 'grid';
    getActionState: (projectId: string) => ActionState | undefined;
    onOpenIde: (projectId: string, ide: string) => void;
    onInstallDeps: (projectId: string) => void;
    onDeleteNodeModules: (projectId: string) => void;
    onCleanBuildFolder?: (projectId: string) => void;
    onRevealInExplorer: (projectId: string) => void;
    onRefresh: (projectId: string) => void;
    onArchive: (projectId: string) => void;
    onRemove: (projectId: string) => void;
    // New action handlers
    onOpenTerminal?: (projectId: string) => void;
    onRunScripts?: (projectId: string) => void;
    onGitPull?: (projectId: string) => void;
    onGitFetch?: (projectId: string) => void;
    onCheckHealth?: (projectId: string) => void;
    onEditNotes?: (projectId: string) => void;
    onManageTags?: (projectId: string) => void;
    onTogglePin?: (projectId: string) => void;
    // Selection
    selectedIds?: Set<string>;
    onToggleSelect?: (projectId: string) => void;
}

const TechStackBadge: React.FC<{ tech: TechStack }> = ({ tech }) => {
    const getStyles = (type: TechStack['type']) => {
        switch (type) {
            case 'blue': return 'bg-surface border-blue-500/20 text-blue-400';
            case 'pink': return 'bg-surface border-pink-500/20 text-pink-400';
            case 'orange': return 'bg-surface border-orange-500/20 text-orange-400';
            case 'purple': return 'bg-surface border-purple-500/20 text-purple-400';
            case 'yellow': return 'bg-surface border-yellow-500/20 text-yellow-400';
            case 'green': return 'bg-surface border-green-500/20 text-green-400';
            default: return 'bg-surface border-border-dim text-slate-300';
        }
    };

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border font-mono ${getStyles(tech.type)}`}>
            {tech.name}
        </span>
    );
};

const TagBadge: React.FC<{ tag: string }> = ({ tag }) => (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-primary/10 border border-primary/20 text-primary">
        {tag}
    </span>
);

interface ProjectRowProps {
    project: Project;
    actionState?: ActionState;
    isSelected?: boolean;
    onToggleSelect?: () => void;
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

const ProjectRow: React.FC<ProjectRowProps> = ({
    project,
    actionState,
    isSelected,
    onToggleSelect,
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
    const isArchived = project.isArchived;
    const isLoading = !!actionState;

    return (
        <div className={`group relative grid grid-cols-12 gap-4 px-6 py-3 border-b border-l border-r border-border-dim transition-colors items-center project-row
            ${isArchived ? 'bg-surface hover:bg-surface-highlight opacity-60' : 'bg-surface hover:bg-surface-highlight'}
            ${isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : ''}
            ${isLoading ? 'pointer-events-none' : ''}`}
        >
            {/* Selection Checkbox */}
            {onToggleSelect && (
                <div className="absolute left-1 top-1/2 -translate-y-1/2">
                    <button
                        onClick={onToggleSelect}
                        className={`size-5 rounded border flex items-center justify-center transition-all
                            ${isSelected
                                ? 'bg-primary border-primary text-white'
                                : 'border-border-dim hover:border-slate-500 text-transparent hover:text-slate-500'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[14px]">check</span>
                    </button>
                </div>
            )}

            {/* Project Name & Path */}
            <div className={`col-span-4 flex items-start gap-3 ${onToggleSelect ? 'pl-5' : ''}`}>
                <div className={`size-9 rounded flex items-center justify-center shrink-0 border transition-all
                    bg-surface border-border-dim text-slate-500 group-hover:text-primary group-hover:border-primary/30`}
                >
                    {isLoading ? (
                        <span className="material-symbols-outlined text-[20px] animate-spin text-primary">progress_activity</span>
                    ) : (
                        <span className="material-symbols-outlined text-[20px]">{project.icon}</span>
                    )}
                </div>
                <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                        {project.isPinned && (
                            <span className="material-symbols-outlined text-[14px] text-amber-400" title="Pinned">star</span>
                        )}
                        <h3 className="text-sm font-semibold leading-tight truncate text-slate-200 group-hover:text-white">
                            {project.name}
                        </h3>
                        {project.notes && (
                            <span className="material-symbols-outlined text-[12px] text-primary" title="Has notes">note</span>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 font-mono truncate mt-0.5" title={project.path}>{project.path}</p>
                    {project.tags && project.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                            {project.tags.slice(0, 2).map((tag, i) => (
                                <TagBadge key={i} tag={tag} />
                            ))}
                            {project.tags.length > 2 && (
                                <span className="text-[9px] text-slate-500">+{project.tags.length - 2}</span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Tech Stack */}
            <div className="col-span-2 flex flex-wrap gap-1.5 items-center">
                {project.techStack.slice(0, 2).map((tech, i) => (
                    <TechStackBadge key={i} tech={tech} />
                ))}
                {project.techStack.length > 2 && (
                    <span className="text-[10px] text-slate-500 font-mono">+{project.techStack.length - 2}</span>
                )}
            </div>

            {/* Git Status */}
            <div className="col-span-2 flex flex-col justify-center">
                <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-[14px] 
                        ${project.gitStatus.type === 'success' ? 'text-emerald-400' : ''}
                        ${project.gitStatus.type === 'warning' ? 'text-yellow-400' : ''}
                        ${project.gitStatus.type === 'neutral' ? 'text-slate-600' : ''}
                        ${project.gitStatus.type === 'info' ? 'text-blue-400' : ''}
                    `}>
                        call_split
                    </span>
                    <span className="text-xs font-mono text-slate-300 truncate max-w-[100px]" title={project.gitStatus.branch}>
                        {project.gitStatus.branch}
                    </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                    {project.gitStatus.type === 'warning' && <span className="size-1.5 rounded-full bg-yellow-500"></span>}
                    {project.gitStatus.type === 'success' && <span className="size-1.5 rounded-full bg-emerald-500"></span>}
                    {project.gitStatus.type === 'neutral' && <span className="size-1.5 rounded-full bg-slate-600"></span>}
                    {project.gitStatus.type === 'info' && <span className="material-symbols-outlined text-[10px] text-blue-400">arrow_upward</span>}

                    <span className="text-[10px] font-mono text-slate-500">
                        {project.gitStatus.count ? `${project.gitStatus.count} ${project.gitStatus.status.toLowerCase()}` : project.gitStatus.status}
                    </span>
                </div>
            </div>

            {/* Storage */}
            <div className="col-span-1 flex items-center gap-1.5 text-xs text-slate-400">
                <span className={`material-symbols-outlined text-[14px] ${project.hasNodeModules ? 'text-orange-400' : 'text-slate-600'}`}>
                    {project.hasNodeModules ? 'folder' : 'hard_drive'}
                </span>
                <span className="font-mono text-[11px]">{project.storage}</span>
            </div>

            {/* Last Active */}
            <div className={`col-span-1 text-xs text-center ${isArchived ? 'text-slate-600' : 'text-slate-400'}`}>
                {project.lastActive.replace(' ago', '')}
            </div>

            {/* Actions */}
            <div className="col-span-2 flex justify-end items-center gap-2">
                <button
                    onClick={() => onOpenIde('code')}
                    disabled={isLoading}
                    className="launch-btn opacity-0 group-hover:opacity-100 bg-primary/20 hover:bg-primary text-primary text-xs font-medium px-3 py-1.5 rounded transition-all flex items-center gap-1 disabled:opacity-50"
                >
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    Launch
                </button>
                <ProjectActions
                    project={project}
                    actionState={actionState}
                    onOpenIde={onOpenIde}
                    onInstallDeps={onInstallDeps}
                    onDeleteNodeModules={onDeleteNodeModules}
                    onCleanBuildFolder={onCleanBuildFolder}
                    onRevealInExplorer={onRevealInExplorer}
                    onRefresh={onRefresh}
                    onArchive={onArchive}
                    onRemove={onRemove}
                    onOpenTerminal={onOpenTerminal}
                    onRunScripts={onRunScripts}
                    onGitPull={onGitPull}
                    onGitFetch={onGitFetch}
                    onCheckHealth={onCheckHealth}
                    onEditNotes={onEditNotes}
                    onManageTags={onManageTags}
                    onTogglePin={onTogglePin}
                />
            </div>
        </div>
    );
};

interface ProjectGridCardProps {
    project: Project;
    actionState?: ActionState;
    isSelected?: boolean;
    onToggleSelect?: () => void;
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

const ProjectGridCard: React.FC<ProjectGridCardProps> = ({
    project,
    actionState,
    isSelected,
    onToggleSelect,
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
    const isArchived = project.isArchived;
    const isLoading = !!actionState;

    return (
        <div className={`group relative bg-surface hover:bg-surface-highlight border border-border-dim hover:border-border-dim/80 rounded-lg p-5 flex flex-col gap-4 transition-all duration-200 project-card
             ${isArchived ? 'opacity-60' : ''}
             ${isSelected ? 'ring-2 ring-primary border-primary' : ''}
             ${isLoading ? 'pointer-events-none' : ''}`}>

            {/* Selection Checkbox */}
            {onToggleSelect && (
                <button
                    onClick={onToggleSelect}
                    className={`absolute top-3 left-3 size-5 rounded border flex items-center justify-center transition-all z-10
                        ${isSelected
                            ? 'bg-primary border-primary text-white'
                            : 'border-border-dim opacity-0 group-hover:opacity-100 hover:border-slate-500 text-transparent hover:text-slate-500'
                        }`}
                >
                    <span className="material-symbols-outlined text-[14px]">check</span>
                </button>
            )}

            {/* Pinned Indicator */}
            {project.isPinned && (
                <div className="absolute top-3 left-3 text-amber-400">
                    <span className="material-symbols-outlined text-[16px]">star</span>
                </div>
            )}

            {/* Top Row: Icon, Name, Actions */}
            <div className="flex items-start justify-between">
                <div className={`flex items-start gap-3 flex-1 min-w-0 ${onToggleSelect || project.isPinned ? 'pl-6' : ''}`}>
                    <div className="size-10 rounded-md flex items-center justify-center shrink-0 border transition-all bg-surface border-border-dim text-slate-400 group-hover:border-primary/30">
                        {isLoading ? (
                            <span className="material-symbols-outlined text-[24px] animate-spin text-primary">progress_activity</span>
                        ) : (
                            <span className="material-symbols-outlined text-[24px]">{project.icon}</span>
                        )}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                            <h3 className="text-base font-bold text-slate-200 group-hover:text-white transition-colors leading-tight truncate">
                                {project.name}
                            </h3>
                            {project.notes && (
                                <span className="material-symbols-outlined text-[12px] text-primary" title="Has notes">note</span>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 font-mono mt-1 truncate" title={project.path}>
                            {project.path}
                        </p>
                    </div>
                </div>

                <ProjectActions
                    project={project}
                    actionState={actionState}
                    onOpenIde={onOpenIde}
                    onInstallDeps={onInstallDeps}
                    onDeleteNodeModules={onDeleteNodeModules}
                    onCleanBuildFolder={onCleanBuildFolder}
                    onRevealInExplorer={onRevealInExplorer}
                    onRefresh={onRefresh}
                    onArchive={onArchive}
                    onRemove={onRemove}
                    onOpenTerminal={onOpenTerminal}
                    onRunScripts={onRunScripts}
                    onGitPull={onGitPull}
                    onGitFetch={onGitFetch}
                    onCheckHealth={onCheckHealth}
                    onEditNotes={onEditNotes}
                    onManageTags={onManageTags}
                    onTogglePin={onTogglePin}
                />
            </div>

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {project.tags.slice(0, 3).map((tag, i) => (
                        <TagBadge key={i} tag={tag} />
                    ))}
                    {project.tags.length > 3 && (
                        <span className="text-[9px] text-slate-500">+{project.tags.length - 3}</span>
                    )}
                </div>
            )}

            {/* Git Badge */}
            <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-mono
                    ${project.gitStatus.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' : ''}
                    ${project.gitStatus.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : ''}
                    ${project.gitStatus.type === 'neutral' ? 'bg-slate-500/10 border-slate-500/20 text-slate-400' : ''}
                    ${project.gitStatus.type === 'info' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : ''}
                `}>
                    <span className="material-symbols-outlined text-[12px]">call_split</span>
                    <span className="truncate max-w-[80px]">{project.gitStatus.branch}</span>
                </div>
                {project.gitStatus.count && (
                    <span className="text-[10px] text-slate-500">
                        {project.gitStatus.count} {project.gitStatus.status.toLowerCase()}
                    </span>
                )}
                {/* Health indicator */}
                {project.healthStatus && (
                    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono
                        ${(project.healthStatus.vulnerabilities?.high || 0) > 0
                            ? 'bg-red-500/10 text-red-400'
                            : project.healthStatus.outdatedCount > 0
                                ? 'bg-amber-500/10 text-amber-400'
                                : 'bg-emerald-500/10 text-emerald-400'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[10px]">health_and_safety</span>
                        {(project.healthStatus.vulnerabilities?.high || 0) > 0
                            ? `${project.healthStatus.vulnerabilities?.high} vuln`
                            : project.healthStatus.outdatedCount > 0
                                ? `${project.healthStatus.outdatedCount} old`
                                : 'ok'
                        }
                    </div>
                )}
            </div>

            {/* Tech Stack Tags */}
            <div className="flex flex-wrap gap-1.5 min-h-[26px]">
                {project.techStack.slice(0, 4).map((tech, i) => (
                    <TechStackBadge key={i} tech={tech} />
                ))}
                {project.techStack.length > 4 && (
                    <span className="text-[10px] text-slate-600 font-mono flex items-center">+{project.techStack.length - 4}</span>
                )}
            </div>

            {/* Footer: Stats & Launch */}
            <div className="mt-auto pt-4 border-t border-border-dim flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5" title="Storage usage">
                        <span className={`material-symbols-outlined text-[14px] ${project.hasNodeModules ? 'text-orange-400' : ''}`}>
                            {project.hasNodeModules ? 'folder' : 'hard_drive'}
                        </span>
                        <span className="font-mono text-[11px]">{project.storage}</span>
                    </div>
                    <div className="flex items-center gap-1.5" title="Last active">
                        <span className="material-symbols-outlined text-[14px]">history</span>
                        <span>{project.lastActive}</span>
                    </div>
                </div>

                {/* Launch Button */}
                <button
                    onClick={() => onOpenIde('code')}
                    disabled={isLoading}
                    className="launch-btn opacity-0 group-hover:opacity-100 transition-all bg-primary/20 hover:bg-primary text-primary rounded px-2 py-1 flex items-center gap-1 text-xs font-medium disabled:opacity-50"
                >
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    Launch
                </button>
            </div>
        </div>
    );
};

const ProjectList: React.FC<ProjectListProps> = ({
    projects,
    viewMode,
    getActionState,
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
    selectedIds,
    onToggleSelect,
}) => {
    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar mx-6 ">
            {viewMode === 'list' ? (
                <div className="flex flex-col ">
                    {projects.map(project => (
                        <ProjectRow
                            key={project.id}
                            project={project}
                            actionState={getActionState(project.id)}
                            isSelected={selectedIds?.has(project.id)}
                            onToggleSelect={onToggleSelect ? () => onToggleSelect(project.id) : undefined}
                            onOpenIde={(ide) => onOpenIde(project.id, ide)}
                            onInstallDeps={() => onInstallDeps(project.id)}
                            onDeleteNodeModules={() => onDeleteNodeModules(project.id)}
                            onCleanBuildFolder={onCleanBuildFolder ? () => onCleanBuildFolder(project.id) : undefined}
                            onRevealInExplorer={() => onRevealInExplorer(project.id)}
                            onRefresh={() => onRefresh(project.id)}
                            onArchive={() => onArchive(project.id)}
                            onRemove={() => onRemove(project.id)}
                            onOpenTerminal={onOpenTerminal ? () => onOpenTerminal(project.id) : undefined}
                            onRunScripts={onRunScripts ? () => onRunScripts(project.id) : undefined}
                            onGitPull={onGitPull ? () => onGitPull(project.id) : undefined}
                            onGitFetch={onGitFetch ? () => onGitFetch(project.id) : undefined}
                            onCheckHealth={onCheckHealth ? () => onCheckHealth(project.id) : undefined}
                            onEditNotes={onEditNotes ? () => onEditNotes(project.id) : undefined}
                            onManageTags={onManageTags ? () => onManageTags(project.id) : undefined}
                            onTogglePin={onTogglePin ? () => onTogglePin(project.id) : undefined}
                        />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 p-6">
                    {projects.map(project => (
                        <ProjectGridCard
                            key={project.id}
                            project={project}
                            actionState={getActionState(project.id)}
                            isSelected={selectedIds?.has(project.id)}
                            onToggleSelect={onToggleSelect ? () => onToggleSelect(project.id) : undefined}
                            onOpenIde={(ide) => onOpenIde(project.id, ide)}
                            onInstallDeps={() => onInstallDeps(project.id)}
                            onDeleteNodeModules={() => onDeleteNodeModules(project.id)}
                            onCleanBuildFolder={onCleanBuildFolder ? () => onCleanBuildFolder(project.id) : undefined}
                            onRevealInExplorer={() => onRevealInExplorer(project.id)}
                            onRefresh={() => onRefresh(project.id)}
                            onArchive={() => onArchive(project.id)}
                            onRemove={() => onRemove(project.id)}
                            onOpenTerminal={onOpenTerminal ? () => onOpenTerminal(project.id) : undefined}
                            onRunScripts={onRunScripts ? () => onRunScripts(project.id) : undefined}
                            onGitPull={onGitPull ? () => onGitPull(project.id) : undefined}
                            onGitFetch={onGitFetch ? () => onGitFetch(project.id) : undefined}
                            onCheckHealth={onCheckHealth ? () => onCheckHealth(project.id) : undefined}
                            onEditNotes={onEditNotes ? () => onEditNotes(project.id) : undefined}
                            onManageTags={onManageTags ? () => onManageTags(project.id) : undefined}
                            onTogglePin={onTogglePin ? () => onTogglePin(project.id) : undefined}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProjectList;
