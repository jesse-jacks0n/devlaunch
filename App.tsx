import React, { useState, useCallback, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import StatusBar from './components/StatusBar';
import ProjectList from './components/ProjectList';
import SettingsPage from './components/SettingsPage';
import StatisticsPage from './components/StatisticsPage';
import ActivityPage from './components/ActivityPage';
import EmptyState from './components/EmptyState';
import ToastContainer from './components/ToastContainer';
import ConfirmDialog from './components/ConfirmDialog';
import ScriptsModal from './components/ScriptsModal';
import NotesModal from './components/NotesModal';
import TagsModal from './components/TagsModal';
import BulkActionsBar from './components/BulkActionsBar';
import NewProjectModal from './components/NewProjectModal';
import { useSettings } from './hooks/useSettings';
import { ViewType, SortOption, Project, ProjectScript } from './types';
import { useProjects } from './hooks/useProjects';

interface ActivityItem {
    id: string;
    type: 'open' | 'install' | 'delete' | 'archive' | 'git' | 'script' | 'add' | 'remove';
    projectName: string;
    projectPath?: string;
    description: string;
    timestamp: Date;
    icon: string;
    iconColor: string;
}

const SORT_OPTIONS: { value: SortOption; label: string; icon: string }[] = [
    { value: 'lastOpened', label: 'Last Opened', icon: 'schedule' },
    { value: 'name', label: 'Name', icon: 'sort_by_alpha' },
    { value: 'mostUsed', label: 'Most Used', icon: 'trending_up' },
    { value: 'storage', label: 'Storage', icon: 'hard_drive' },
    { value: 'lastActive', label: 'Last Active', icon: 'history' },
];

const App: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [currentView, setCurrentView] = useState<ViewType>('library');
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [activityLog, setActivityLog] = useState<ActivityItem[]>(() => {
        const saved = localStorage.getItem('devlaunch-activity');
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed.map((item: any) => ({ ...item, timestamp: new Date(item.timestamp) }));
        }
        return [];
    });
    const [scriptsModal, setScriptsModal] = useState<{ isOpen: boolean; project: Project | null; scripts: ProjectScript[]; loading: boolean }>({
        isOpen: false, project: null, scripts: [], loading: false
    });
    const [notesModal, setNotesModal] = useState<{ isOpen: boolean; project: Project | null }>({
        isOpen: false, project: null
    });
    const [tagsModal, setTagsModal] = useState<{ isOpen: boolean; project: Project | null }>({
        isOpen: false, project: null
    });
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        variant?: 'danger' | 'warning' | 'info';
        confirmLabel?: string;
        cancelLabel?: string;
    }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });
    const [bulkDeleting, setBulkDeleting] = useState(false);
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);

    const searchInputRef = useRef<HTMLInputElement>(null);
    const sortDropdownRef = useRef<HTMLDivElement>(null);

    const {
        projects,
        sortedProjects,
        loading,
        importing,
        toasts,
        sortBy,
        setSortBy,
        filterTags,
        setFilterTags,
        allTags,
        selectedIds,
        toggleSelect,
        selectAll,
        clearSelection,
        addProject,
        addProjectFromPath,
        removeProject,
        refreshProject,
        openInIde,
        installDependencies,
        deleteNodeModules,
        cleanBuildFolder,
        revealInExplorer,
        archiveProject,
        getActionState,
        removeToast,
        openTerminal,
        getScripts,
        runScript,
        gitPull,
        gitFetch,
        checkHealth,
        togglePin,
        updateNotes,
        updateTags,
        bulkDeleteNodeModules,
    } = useProjects();

    const {
        settings,
        updateSetting,
        resetSettings,
    } = useSettings();

    // Save activity log to localStorage
    useEffect(() => {
        localStorage.setItem('devlaunch-activity', JSON.stringify(activityLog));
    }, [activityLog]);

    // Add activity helper
    const addActivity = useCallback((
        type: ActivityItem['type'],
        projectName: string,
        description: string,
        icon: string,
        iconColor: string,
        projectPath?: string
    ) => {
        const newItem: ActivityItem = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            projectName,
            projectPath,
            description,
            timestamp: new Date(),
            icon,
            iconColor,
        };
        setActivityLog(prev => [newItem, ...prev].slice(0, 100)); // Keep last 100 items
    }, []);

    const clearActivity = useCallback(() => {
        setActivityLog([]);
        localStorage.removeItem('devlaunch-activity');
    }, []);

    // Filter projects based on search, archived setting, and tags
    const filteredProjects = sortedProjects.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.tags && p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
        const matchesArchived = settings.showArchivedProjects || !p.isArchived;
        const matchesTags = filterTags.length === 0 || (p.tags && filterTags.some(t => p.tags!.includes(t)));
        return matchesSearch && matchesArchived && matchesTags;
    });

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl+K - Focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            // Escape - Clear search or close modals
            if (e.key === 'Escape') {
                if (searchQuery) {
                    setSearchQuery('');
                }
            }
            // Ctrl+A - Select all (when not in input)
            if ((e.ctrlKey || e.metaKey) && e.key === 'a' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                e.preventDefault();
                selectAll();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [searchQuery, selectAll]);

    // Close sort dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
                setShowSortDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDeleteNodeModules = useCallback((projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        if (settings.confirmBeforeDelete) {
            setConfirmDialog({
                isOpen: true,
                title: 'Delete node_modules?',
                message: `This will permanently delete the node_modules folder from "${project.name}". You can reinstall dependencies later.`,
                variant: 'warning',
                onConfirm: () => {
                    deleteNodeModules(projectId);
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                },
            });
        } else {
            deleteNodeModules(projectId);
        }
    }, [projects, settings.confirmBeforeDelete, deleteNodeModules]);

    const handleCleanBuildFolder = useCallback((projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        const buildFolderName = project.buildFolderName || 'build';
        if (settings.confirmBeforeDelete) {
            setConfirmDialog({
                isOpen: true,
                title: 'Clean Build Folder?',
                message: `This will permanently delete the ${buildFolderName} folder(s) from "${project.name}". This will free up ${project.buildStorage || 'some'} space.`,
                variant: 'warning',
                onConfirm: () => {
                    cleanBuildFolder(projectId);
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                },
            });
        } else {
            cleanBuildFolder(projectId);
        }
    }, [projects, settings.confirmBeforeDelete, cleanBuildFolder]);

    const handleRemoveProject = useCallback((projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        setConfirmDialog({
            isOpen: true,
            title: 'Remove from library?',
            message: `This will remove "${project.name}" from your library. The project files will NOT be deleted.`,
            variant: 'info',
            onConfirm: () => {
                removeProject(projectId);
                setConfirmDialog(prev => ({ ...prev, isOpen: false }));
            },
        });
    }, [projects, removeProject]);

    const handleOpenInIde = useCallback((projectId: string, ide: string) => {
        const project = projects.find(p => p.id === projectId);
        openInIde(projectId, settings.defaultIde || ide);
        if (project) {
            addActivity('open', project.name, `Opened in ${settings.defaultIde || ide}`, 'open_in_new', 'bg-primary/10 text-primary', project.path);
        }
    }, [openInIde, settings.defaultIde, projects, addActivity]);

    const handleOpenScripts = useCallback(async (projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        setScriptsModal({ isOpen: true, project, scripts: project.scripts || [], loading: !project.scripts });

        if (!project.scripts) {
            const scripts = await getScripts(projectId);
            setScriptsModal(prev => ({ ...prev, scripts, loading: false }));
        }
    }, [projects, getScripts]);

    const handleRunScript = useCallback((scriptName: string) => {
        if (scriptsModal.project) {
            runScript(scriptsModal.project.id, scriptName);
            addActivity('script', scriptsModal.project.name, `Ran script: ${scriptName}`, 'play_arrow', 'bg-emerald-500/10 text-emerald-400', scriptsModal.project.path);
        }
    }, [scriptsModal.project, runScript, addActivity]);

    const handleOpenNotes = useCallback((projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (project) {
            setNotesModal({ isOpen: true, project });
        }
    }, [projects]);

    const handleSaveNotes = useCallback((notes: string) => {
        if (notesModal.project) {
            updateNotes(notesModal.project.id, notes);
        }
    }, [notesModal.project, updateNotes]);

    const handleOpenTags = useCallback((projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (project) {
            setTagsModal({ isOpen: true, project });
        }
    }, [projects]);

    const handleSaveTags = useCallback((tags: string[]) => {
        if (tagsModal.project) {
            updateTags(tagsModal.project.id, tags);
        }
    }, [tagsModal.project, updateTags]);

    // Activity-logged wrappers
    const handleInstallDeps = useCallback((projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        installDependencies(projectId);
        if (project) {
            addActivity('install', project.name, 'Installing dependencies', 'download', 'bg-emerald-500/10 text-emerald-400', project.path);
        }
    }, [projects, installDependencies, addActivity]);

    const handleGitPull = useCallback((projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        gitPull(projectId);
        if (project) {
            addActivity('git', project.name, 'Pulled latest changes', 'download', 'bg-orange-500/10 text-orange-400', project.path);
        }
    }, [projects, gitPull, addActivity]);

    const handleGitFetch = useCallback((projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        gitFetch(projectId);
        if (project) {
            addActivity('git', project.name, 'Fetched remote changes', 'sync', 'bg-orange-500/10 text-orange-400', project.path);
        }
    }, [projects, gitFetch, addActivity]);

    const handleOpenTerminal = useCallback((projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        openTerminal(projectId);
        if (project) {
            addActivity('open', project.name, 'Opened terminal', 'terminal', 'bg-slate-500/10 text-slate-400', project.path);
        }
    }, [projects, openTerminal, addActivity]);

    const handleBulkDeleteNodeModules = useCallback(() => {
        const selectedProjects = projects.filter(p => selectedIds.has(p.id) && p.hasNodeModules);
        if (selectedProjects.length === 0) return;

        setConfirmDialog({
            isOpen: true,
            title: 'Delete all node_modules?',
            message: `This will delete node_modules from ${selectedProjects.length} project${selectedProjects.length > 1 ? 's' : ''}. This action cannot be undone.`,
            variant: 'warning',
            onConfirm: async () => {
                setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                setBulkDeleting(true);
                const paths = selectedProjects.map(p => p.path);
                await bulkDeleteNodeModules(paths);
                setBulkDeleting(false);
                clearSelection();
            },
        });
    }, [projects, selectedIds, bulkDeleteNodeModules, clearSelection]);

    const handleTagFilterClick = (tag: string) => {
        if (filterTags.includes(tag)) {
            setFilterTags(filterTags.filter(t => t !== tag));
        } else {
            setFilterTags([...filterTags, tag]);
        }
    };

    const handleToggleTheme = useCallback(() => {
        updateSetting('theme', settings.theme === 'dark' ? 'light' : 'dark');
    }, [settings.theme, updateSetting]);

    // Calculate sidebar stats
    const nodeProjectCount = projects.filter(p => p.packageManager).length;
    const totalStorageBytes = projects.reduce((sum, p) => {
        const match = p.storage.match(/^([\d.]+)\s*(B|KB|MB|GB|TB)?$/i);
        if (!match) return sum;
        const value = parseFloat(match[1]);
        const unit = (match[2] || 'B').toUpperCase();
        const multipliers: Record<string, number> = { 'B': 1, 'KB': 1024, 'MB': 1024 * 1024, 'GB': 1024 * 1024 * 1024, 'TB': 1024 * 1024 * 1024 * 1024 };
        return sum + value * (multipliers[unit] || 1);
    }, 0);
    const formatTotalStorage = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    };

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-background-dark text-slate-300 font-display">
            <Sidebar
                currentView={currentView}
                onViewChange={setCurrentView}
                projectCount={projects.length}
                nodeProjectCount={nodeProjectCount}
                totalStorage={formatTotalStorage(totalStorageBytes)}
                theme={settings.theme}
                onToggleTheme={handleToggleTheme}
            />

            {/* Main Content */}
            <main className="flex-1 flex flex-col bg-background-dark bg-grid-pattern relative overflow-hidden">
                {currentView === 'settings' ? (
                    <SettingsPage
                        settings={settings}
                        onUpdateSetting={updateSetting}
                        onResetSettings={resetSettings}
                        onClose={() => setCurrentView('library')}
                    />
                ) : currentView === 'statistics' ? (
                    <StatisticsPage
                        projects={projects}
                        onClose={() => setCurrentView('library')}
                    />
                ) : currentView === 'activity' ? (
                    <ActivityPage
                        projects={projects}
                        activityLog={activityLog}
                        onClose={() => setCurrentView('library')}
                        onClearActivity={clearActivity}
                    />
                ) : (
                    <>
                        {/* Header / Command Bar */}
                        <header className="header-bg h-auto shrink-0 border-b border-border-dim bg-background-dark/80 backdrop-blur-md z-10">

                            {/* Top Row: Breadcrumbs & Actions */}
                            <div className="flex items-center justify-between px-6 py-4">
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-white text-xl font-bold tracking-tight">Local Projects</h2>
                                    <p className="text-slate-500 text-xs font-mono">
                                        {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'} found
                                        {searchQuery && ` · Filtered by "${searchQuery}"`}
                                        {filterTags.length > 0 && ` · Tagged: ${filterTags.join(', ')}`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* Sort Dropdown */}
                                    <div className="relative" ref={sortDropdownRef}>
                                        <button
                                            onClick={() => setShowSortDropdown(!showSortDropdown)}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border-dim rounded text-xs text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">
                                                {SORT_OPTIONS.find(o => o.value === sortBy)?.icon || 'sort'}
                                            </span>
                                            {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                                            <span className="material-symbols-outlined text-[14px]">expand_more</span>
                                        </button>
                                        {showSortDropdown && (
                                            <div className="absolute right-0 top-full mt-1 w-44 bg-surface border border-border-dim rounded-lg shadow-xl z-50 py-1 animate-fade-in">
                                                {SORT_OPTIONS.map(option => (
                                                    <button
                                                        key={option.value}
                                                        onClick={() => { setSortBy(option.value); setShowSortDropdown(false); }}
                                                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors
                                                            ${sortBy === option.value ? 'bg-primary/10 text-primary' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">{option.icon}</span>
                                                        {option.label}
                                                        {sortBy === option.value && (
                                                            <span className="material-symbols-outlined text-[14px] ml-auto">check</span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* View Mode Toggle */}
                                    <div className="flex p-1 bg-surface rounded border border-border-dim">
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`flex items-center justify-center px-3 py-1 rounded text-xs font-medium transition-all
                                                ${viewMode === 'list'
                                                    ? 'bg-surface-highlight shadow-sm text-white'
                                                    : 'hover:bg-white/5 text-slate-400 hover:text-white'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-[16px] mr-1.5">list</span>
                                            List
                                        </button>
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`flex items-center justify-center px-3 py-1 rounded text-xs font-medium transition-all
                                                ${viewMode === 'grid'
                                                    ? 'bg-surface-highlight shadow-sm text-white'
                                                    : 'hover:bg-white/5 text-slate-400 hover:text-white'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-[16px] mr-1.5">grid_view</span>
                                            Grid
                                        </button>
                                    </div>

                                    <div className="h-6 w-px bg-border-dim"></div>

                                    <button
                                        onClick={() => setShowNewProjectModal(true)}
                                        disabled={importing}
                                        className="bg-primary hover:bg-primary/90 text-white text-sm font-medium px-4 h-8 rounded flex items-center gap-2 transition-colors  disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {importing ? (
                                            <>
                                                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                                                Scanning...
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-[18px]">add</span>
                                                New Project
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Search & Filter Row */}
                            <div className="px-6 pb-4 space-y-3">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-slate-500 group-focus-within:text-primary transition-colors">search</span>
                                    </div>
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        className="block w-full pl-10 pr-24 py-2.5 bg-surface border border-border-dim rounded text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all font-mono"
                                        placeholder="Search projects by name, path, or tags..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute inset-y-0 right-16 pr-3 flex items-center text-slate-500 hover:text-white"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">close</span>
                                        </button>
                                    )}
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <kbd className="inline-flex items-center border border-border-dim rounded px-2 text-[10px] font-medium text-slate-500 font-mono bg-white/5">CTRL+K</kbd>
                                    </div>
                                </div>

                                {/* Tag Filters */}
                                {allTags.length > 0 && (
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs text-slate-500">Tags:</span>
                                        {allTags.slice(0, 10).map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => handleTagFilterClick(tag)}
                                                className={`px-2 py-0.5 rounded text-xs font-medium border transition-colors
                                                    ${filterTags.includes(tag)
                                                        ? 'bg-primary/20 border-primary/30 text-primary'
                                                        : 'bg-surface border-border-dim text-slate-400 hover:text-white hover:border-primary/50'
                                                    }`}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                        {filterTags.length > 0 && (
                                            <button
                                                onClick={() => setFilterTags([])}
                                                className="px-2 py-0.5 text-xs text-slate-500 hover:text-white transition-colors"
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Table Header (List View Only) */}
                            {viewMode === 'list' && filteredProjects.length > 0 && (
                                <div className="grid grid-cols-12 gap-4 mx-6 px-6 py-2 border-t border-l border-r border-border-dim bg-surface/50 text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    <div className="col-span-4 flex items-center gap-1">
                                        Project
                                    </div>
                                    <div className="col-span-2 flex items-center">Tech Stack</div>
                                    <div className="col-span-2 flex items-center">Git Status</div>
                                    <div className="col-span-1 flex items-center">Storage</div>
                                    <div className="col-span-1 flex items-center text-center justify-center">Active</div>
                                    <div className="col-span-2 text-right">Actions</div>
                                </div>
                            )}
                        </header>

                        {/* Bulk Actions Bar */}
                        <BulkActionsBar
                            selectedCount={selectedIds.size}
                            totalCount={filteredProjects.length}
                            onSelectAll={() => selectAll()}
                            onClearSelection={clearSelection}
                            onBulkDeleteNodeModules={handleBulkDeleteNodeModules}
                            isDeleting={bulkDeleting}
                        />

                        {/* Project List or Empty State */}
                        {filteredProjects.length === 0 ? (
                            <EmptyState onAddProject={addProject} />
                        ) : (
                            <ProjectList
                                projects={filteredProjects}
                                viewMode={viewMode}
                                getActionState={getActionState}
                                selectedIds={selectedIds}
                                onToggleSelect={toggleSelect}
                                onOpenIde={handleOpenInIde}
                                onInstallDeps={handleInstallDeps}
                                onDeleteNodeModules={handleDeleteNodeModules}
                                onCleanBuildFolder={handleCleanBuildFolder}
                                onRevealInExplorer={revealInExplorer}
                                onRefresh={refreshProject}
                                onArchive={archiveProject}
                                onRemove={handleRemoveProject}
                                onOpenTerminal={handleOpenTerminal}
                                onRunScripts={handleOpenScripts}
                                onGitPull={handleGitPull}
                                onGitFetch={handleGitFetch}
                                onCheckHealth={checkHealth}
                                onEditNotes={handleOpenNotes}
                                onManageTags={handleOpenTags}
                                onTogglePin={togglePin}
                            />
                        )}
                    </>
                )}

                <StatusBar projectCount={projects.length} />
            </main>

            {/* Toast Notifications */}
            <ToastContainer toasts={toasts} onRemove={removeToast} />

            {/* Modals */}
            <ScriptsModal
                isOpen={scriptsModal.isOpen}
                projectName={scriptsModal.project?.name || ''}
                projectPath={scriptsModal.project?.path || ''}
                scripts={scriptsModal.scripts}
                isLoading={scriptsModal.loading}
                onRunScript={handleRunScript}
                onClose={() => setScriptsModal({ isOpen: false, project: null, scripts: [], loading: false })}
            />

            <NotesModal
                isOpen={notesModal.isOpen}
                projectName={notesModal.project?.name || ''}
                initialNotes={notesModal.project?.notes || ''}
                onSave={handleSaveNotes}
                onClose={() => setNotesModal({ isOpen: false, project: null })}
            />

            <TagsModal
                isOpen={tagsModal.isOpen}
                projectName={tagsModal.project?.name || ''}
                currentTags={tagsModal.project?.tags || []}
                allTags={allTags}
                onSave={handleSaveTags}
                onClose={() => setTagsModal({ isOpen: false, project: null })}
            />

            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                variant={confirmDialog.variant}
                confirmLabel={confirmDialog.confirmLabel}
                cancelLabel={confirmDialog.cancelLabel}
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
            />

            {/* New Project Modal */}
            <NewProjectModal
                isOpen={showNewProjectModal}
                onClose={() => setShowNewProjectModal(false)}
                onImportProject={addProject}
                onProjectCreated={(path) => {
                    // Show toast that project is being created
                    // The user will need to add it manually after the terminal completes
                    setConfirmDialog({
                        isOpen: true,
                        title: 'Project Creation Started',
                        message: `A terminal has been opened to create your project. Once the setup completes, click "Add to Library" to import the project at:\n\n${path}`,
                        variant: 'info',
                        confirmLabel: 'Add to Library',
                        cancelLabel: 'Later',
                        onConfirm: async () => {
                            await addProjectFromPath(path);
                            setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                        },
                    });
                }}
            />

            {/* Import Loading Overlay */}
            {importing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background-dark/80 backdrop-blur-sm">
                    <div className="bg-surface border border-border-dim rounded-lg p-8 flex flex-col items-center gap-4 shadow-2xl">
                        <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[28px] text-primary animate-spin">progress_activity</span>
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-white mb-1">Scanning Project</h3>
                            <p className="text-sm text-slate-500">Detecting tech stack, git status, and more...</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
