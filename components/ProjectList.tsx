import React from 'react';
import { Project, TechStack, ActionState } from '../types';
import ProjectActions from './ProjectActions';
import Icon from './Icon';

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
        <div className={`group relative grid grid-cols-12 gap-2 lg:gap-4 px-6 py-3 border-b border-l border-r border-border-dim transition-colors items-center project-row
            ${isArchived ? 'bg-surface hover:bg-surface-highlight opacity-60' : 'bg-surface hover:bg-surface-highlight'}
            ${isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : ''}
            ${isLoading ? 'pointer-events-none' : ''}`}
        >
            {/* Project Name & Path */}
            <div className="col-span-6 lg:col-span-4 flex items-center gap-2 min-w-0">
                {/* Selection Checkbox - inline with content */}
                {onToggleSelect && (
                    <button
                        onClick={onToggleSelect}
                        className={`size-5 rounded border flex items-center justify-center transition-all shrink-0
                            ${isSelected
                                ? 'bg-primary border-primary text-white'
                                : 'border-border-dim hover:border-slate-500 text-transparent hover:text-slate-500'
                            }`}
                    >
                        <Icon name="check" className="text-[14px]" />
                    </button>
                )}
                <div className={`size-8 lg:size-9 rounded flex items-center justify-center shrink-0 border transition-all
                    bg-surface border-border-dim text-slate-500 group-hover:text-primary group-hover:border-primary/30`}
                >
                    {isLoading ? (
                        <Icon name="progress_activity" className="text-[18px] lg:text-[20px] animate-spin text-primary" />
                    ) : (
                        <Icon name={project.icon} className="text-[18px] lg:text-[20px]" />
                    )}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                        {project.isPinned && (
                            <Icon name="pin" className="text-[12px] text-amber-400 shrink-0" title="Pinned" />
                        )}
                        <h3 className="text-sm font-semibold leading-tight truncate text-slate-200 group-hover:text-white">
                            {project.name}
                        </h3>
                        {project.notes && (
                            <Icon name="note" className="text-[10px] text-primary shrink-0" title="Has notes" />
                        )}
                    </div>
                    <p className="text-[10px] lg:text-xs text-slate-500 font-mono truncate" title={project.path}>{project.path}</p>
                </div>
            </div>

            {/* Tech Stack - Hidden on smaller screens */}
            <div className="hidden lg:flex col-span-2 flex-wrap gap-1 items-center overflow-hidden">
                {project.techStack.slice(0, 2).map((tech, i) => (
                    <TechStackBadge key={i} tech={tech} />
                ))}
                {project.techStack.length > 2 && (
                    <span className="text-[10px] text-slate-500 font-mono">+{project.techStack.length - 2}</span>
                )}
            </div>

            {/* Git Status */}
            <div className="col-span-3 lg:col-span-2 flex items-center gap-2 min-w-0">
                <Icon name="call_split" className={`text-[14px] shrink-0
                    ${project.gitStatus.type === 'success' ? 'text-emerald-400' : ''}
                    ${project.gitStatus.type === 'warning' ? 'text-yellow-400' : ''}
                    ${project.gitStatus.type === 'neutral' ? 'text-slate-600' : ''}
                    ${project.gitStatus.type === 'info' ? 'text-blue-400' : ''}
                `} />
                <span className="text-xs font-mono text-slate-300 truncate" title={project.gitStatus.branch}>
                    {project.gitStatus.branch}
                </span>
            </div>

            {/* Storage - Hidden on smaller screens */}
            <div className="hidden xl:flex col-span-1 items-center gap-1.5 text-xs text-slate-400">
                <Icon name={project.hasNodeModules ? 'folder' : 'hard_drive'} className={`text-[14px] shrink-0 ${project.hasNodeModules ? 'text-orange-400' : 'text-slate-600'}`} />
                <span className="font-mono text-[11px] truncate">{project.storage}</span>
            </div>

            {/* Last Active - Hidden on smaller screens */}
            <div className={`hidden xl:flex col-span-1 text-xs justify-center ${isArchived ? 'text-slate-600' : 'text-slate-400'}`}>
                {project.lastActive.replace(' ago', '')}
            </div>

            {/* Actions */}
            <div className="col-span-3 lg:col-span-2 flex justify-end items-center gap-1 lg:gap-2">
                <button
                    onClick={() => onOpenIde('code')}
                    disabled={isLoading}
                    className="launch-btn opacity-0 group-hover:opacity-100 bg-primary/20 hover:bg-primary text-primary text-xs font-medium px-2 lg:px-3 py-1.5 rounded transition-all flex items-center gap-1 disabled:opacity-50"
                >
                    <Icon name="open_in_new" className="text-[14px]" />
                    <span className="hidden sm:inline">Launch</span>
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

            {/* Selection Checkbox - absolute top left */}
            {onToggleSelect && (
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
                    className={`absolute top-3 left-3 size-5 rounded border flex items-center justify-center transition-all z-10
                        ${isSelected
                            ? 'bg-primary border-primary text-white'
                            : 'border-border-dim opacity-0 group-hover:opacity-100 hover:border-slate-500 text-transparent hover:text-slate-500'
                        }`}
                >
                    <Icon name="check" className="text-[14px]" />
                </button>
            )}

            {/* Top Row: Icon, Name, Actions */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="size-10 rounded-md flex items-center justify-center shrink-0 border transition-all bg-surface border-border-dim text-slate-400 group-hover:border-primary/30">
                        {isLoading ? (
                            <Icon name="progress_activity" className="text-[24px] animate-spin text-primary" />
                        ) : (
                            <Icon name={project.icon} className="text-[24px]" />
                        )}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                            <h3 className="text-base font-bold text-slate-200 group-hover:text-white transition-colors leading-tight truncate">
                                {project.name}
                            </h3>
                            {project.isPinned && (
                                <Icon name="pin" className="text-[12px] text-amber-400 shrink-0" title="Pinned" />
                            )}
                            {project.notes && (
                                <Icon name="note" className="text-[12px] text-primary shrink-0" title="Has notes" />
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
                    <Icon name="call_split" className="text-[12px]" />
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
                        <Icon name="health_and_safety" className="text-[10px]" />
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
                        <Icon name={project.hasNodeModules ? 'folder' : 'hard_drive'} className={`text-[14px] ${project.hasNodeModules ? 'text-orange-400' : ''}`} />
                        <span className="font-mono text-[11px]">{project.storage}</span>
                    </div>
                    <div className="flex items-center gap-1.5" title="Last active">
                        <Icon name="history" className="text-[14px]" />
                        <span>{project.lastActive}</span>
                    </div>
                </div>

                {/* Launch Button */}
                <button
                    onClick={() => onOpenIde('code')}
                    disabled={isLoading}
                    className="launch-btn opacity-0 group-hover:opacity-100 transition-all bg-primary/20 hover:bg-primary text-primary rounded px-2 py-1 flex items-center gap-1 text-xs font-medium disabled:opacity-50"
                >
                    <Icon name="open_in_new" className="text-[14px]" />
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
