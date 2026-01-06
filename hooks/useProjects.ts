import { useState, useEffect, useCallback, useMemo } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { Project, ProjectScanResult, ActionState, Toast, ProjectScript, HealthStatus, SortOption } from '../types';

const STORAGE_KEY = 'devlaunch_projects';

// Helper to parse storage string to bytes
function parseStorageToBytes(storage: string): number {
    const match = storage.match(/^([\d.]+)\s*(B|KB|MB|GB|TB)?$/i);
    if (!match) return 0;
    const value = parseFloat(match[1]);
    const unit = (match[2] || 'B').toUpperCase();
    const multipliers: Record<string, number> = {
        'B': 1, 'KB': 1024, 'MB': 1024 * 1024, 'GB': 1024 * 1024 * 1024, 'TB': 1024 * 1024 * 1024 * 1024,
    };
    return value * (multipliers[unit] || 1);
}

export function useProjects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const [actionStates, setActionStates] = useState<ActionState[]>([]);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [sortBy, setSortBy] = useState<SortOption>('lastOpened');
    const [filterTags, setFilterTags] = useState<string[]>([]);

    // Load projects from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setProjects(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse stored projects:', e);
            }
        }
        setLoading(false);
    }, []);

    // Save projects to localStorage whenever they change
    useEffect(() => {
        if (!loading) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
        }
    }, [projects, loading]);

    // Get all unique tags from projects
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        projects.forEach(p => p.tags?.forEach(t => tags.add(t)));
        return Array.from(tags).sort();
    }, [projects]);

    // Sorted and filtered projects
    const sortedProjects = useMemo(() => {
        let filtered = [...projects];

        if (filterTags.length > 0) {
            filtered = filtered.filter(p => filterTags.some(tag => p.tags?.includes(tag)));
        }

        filtered.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;

            switch (sortBy) {
                case 'name': return a.name.localeCompare(b.name);
                case 'lastOpened': return (b.lastOpened || '').localeCompare(a.lastOpened || '');
                case 'mostUsed': return (b.openCount || 0) - (a.openCount || 0);
                case 'storage': return parseStorageToBytes(b.storage) - parseStorageToBytes(a.storage);
                default: return 0;
            }
        });

        return filtered;
    }, [projects, sortBy, filterTags]);

    const addToast = useCallback((message: string, type: Toast['type'] = 'info', duration = 4000) => {
        const id = crypto.randomUUID();
        setToasts(prev => [...prev, { id, message, type, duration }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const setActionState = useCallback((projectId: string, action: ActionState['action'] | null) => {
        if (action === null) {
            setActionStates(prev => prev.filter(s => s.projectId !== projectId));
        } else {
            setActionStates(prev => {
                const existing = prev.find(s => s.projectId === projectId);
                if (existing) return prev.map(s => s.projectId === projectId ? { ...s, action } : s);
                return [...prev, { projectId, action }];
            });
        }
    }, []);

    const getActionState = useCallback((projectId: string) => {
        return actionStates.find(s => s.projectId === projectId);
    }, [actionStates]);

    // Selection functions
    const toggleSelect = useCallback((projectId: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(projectId) ? next.delete(projectId) : next.add(projectId);
            return next;
        });
    }, []);

    const selectAll = useCallback(() => setSelectedIds(new Set(projects.map(p => p.id))), [projects]);
    const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

    const addProject = useCallback(async () => {
        try {
            const selected = await open({ directory: true, multiple: false, title: 'Select Project Directory' });
            if (!selected) return;

            const path = selected as string;
            if (projects.some(p => p.path === path)) {
                addToast('Project already exists in library', 'warning');
                return;
            }

            setImporting(true);
            const result = await invoke<ProjectScanResult>('scan_project', { path });

            if (result.detected) {
                const projectWithMeta = {
                    ...result.project,
                    lastOpened: new Date().toISOString(),
                    openCount: 0,
                    tags: [],
                    notes: '',
                };
                setProjects(prev => [projectWithMeta, ...prev]);
                addToast(`Added "${result.project.name}" to library`, 'success');
            }
        } catch (e) {
            addToast(`Failed to add project: ${e}`, 'error');
        } finally {
            setImporting(false);
        }
    }, [projects, addToast]);

    const addProjectFromPath = useCallback(async (path: string) => {
        try {
            if (projects.some(p => p.path === path)) {
                addToast('Project already exists in library', 'warning');
                return;
            }

            setImporting(true);
            const result = await invoke<ProjectScanResult>('scan_project', { path });

            if (result.detected) {
                const projectWithMeta = {
                    ...result.project,
                    lastOpened: new Date().toISOString(),
                    openCount: 0,
                    tags: [],
                    notes: '',
                };
                setProjects(prev => [projectWithMeta, ...prev]);
                addToast(`Added "${result.project.name}" to library`, 'success');
                return true;
            }
            return false;
        } catch (e) {
            addToast(`Failed to add project: ${e}`, 'error');
            return false;
        } finally {
            setImporting(false);
        }
    }, [projects, addToast]);

    const removeProject = useCallback((projectId: string) => {
        setProjects(prev => prev.filter(p => p.id !== projectId));
        setSelectedIds(prev => { const next = new Set(prev); next.delete(projectId); return next; });
        addToast('Project removed from library', 'info');
    }, [addToast]);

    const refreshProject = useCallback(async (projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        try {
            setActionState(projectId, 'scanning');
            const result = await invoke<ProjectScanResult>('scan_project', { path: project.path });

            if (result.detected) {
                setProjects(prev => prev.map(p =>
                    p.id === projectId
                        ? { ...result.project, id: projectId, lastActive: 'Just now', tags: p.tags, notes: p.notes, isPinned: p.isPinned, openCount: p.openCount }
                        : p
                ));
                addToast('Project refreshed', 'success');
            }
        } catch (e) {
            addToast(`Failed to refresh project: ${e}`, 'error');
        } finally {
            setActionState(projectId, null);
        }
    }, [projects, setActionState, addToast]);

    const openInIde = useCallback(async (projectId: string, ide: string = 'code') => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        try {
            setActionState(projectId, 'opening');
            await invoke('open_in_ide', { path: project.path, ide });

            setProjects(prev => prev.map(p =>
                p.id === projectId ? {
                    ...p,
                    lastActive: 'Just now',
                    lastOpened: new Date().toISOString(),
                    openCount: (p.openCount || 0) + 1
                } : p
            ));
            addToast(`Opening ${project.name} in ${ide}`, 'success');
        } catch (e) {
            const errorStr = String(e).toLowerCase();
            if (errorStr.includes('not found') || errorStr.includes('not recognized') || errorStr.includes('no such file')) {
                const ideCommands: Record<string, { command: string; install: string }> = {
                    'code': { command: 'code', install: 'Open VS Code, Ctrl+Shift+P → "Shell Command: Install \'code\' in PATH"' },
                    'cursor': { command: 'cursor', install: 'Open Cursor → File > Preferences > Add to PATH' },
                    'webstorm': { command: 'webstorm', install: 'Open WebStorm → Tools > Create Command-line Launcher' },
                    'idea': { command: 'idea', install: 'Open IntelliJ → Tools > Create Command-line Launcher' },
                    'zed': { command: 'zed', install: 'Open Zed → Zed > Install CLI' }
                };
                const info = ideCommands[ide] || { command: ide, install: `Add ${ide} to PATH` };
                addToast(`"${info.command}" not found. ${info.install}`, 'error', 8000);
            } else {
                addToast(`Failed to open IDE: ${e}`, 'error');
            }
        } finally {
            setActionState(projectId, null);
        }
    }, [projects, setActionState, addToast]);

    const installDependencies = useCallback(async (projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        try {
            setActionState(projectId, 'installing');
            addToast(`Installing dependencies for ${project.name}...`, 'info');
            const result = await invoke<string>('install_dependencies', { path: project.path, packageManager: project.packageManager });
            await refreshProject(projectId);
            addToast(result, 'success');
        } catch (e) {
            addToast(`Installation failed: ${e}`, 'error');
        } finally {
            setActionState(projectId, null);
        }
    }, [projects, setActionState, addToast, refreshProject]);

    const deleteNodeModules = useCallback(async (projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        try {
            setActionState(projectId, 'deleting');
            const result = await invoke<string>('delete_node_modules', { path: project.path });
            setProjects(prev => prev.map(p => p.id === projectId ? { ...p, hasNodeModules: false, storage: '< 1 MB' } : p));
            addToast(result, 'success');
        } catch (e) {
            addToast(`Failed to delete node_modules: ${e}`, 'error');
        } finally {
            setActionState(projectId, null);
        }
    }, [projects, setActionState, addToast]);

    const cleanBuildFolder = useCallback(async (projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        try {
            setActionState(projectId, 'deleting');
            const result = await invoke<string>('clean_build_folder', {
                path: project.path,
                projectType: project.projectType
            });
            await refreshProject(projectId);
            addToast(result, 'success');
        } catch (e) {
            addToast(`Failed to clean build folder: ${e}`, 'error');
        } finally {
            setActionState(projectId, null);
        }
    }, [projects, setActionState, addToast, refreshProject]);

    const revealInExplorer = useCallback(async (projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        try {
            await invoke('reveal_in_explorer', { path: project.path });
        } catch (e) {
            addToast(`Failed to open explorer: ${e}`, 'error');
        }
    }, [projects, addToast]);

    const archiveProject = useCallback((projectId: string) => {
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, isArchived: !p.isArchived } : p));
    }, []);

    const togglePin = useCallback((projectId: string) => {
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, isPinned: !p.isPinned } : p));
        addToast('Project pin toggled', 'info');
    }, [addToast]);

    const updateNotes = useCallback((projectId: string, notes: string) => {
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, notes } : p));
    }, []);

    const updateTags = useCallback((projectId: string, tags: string[]) => {
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, tags } : p));
    }, []);

    const addTag = useCallback((projectId: string, tag: string) => {
        setProjects(prev => prev.map(p => {
            if (p.id === projectId) {
                const currentTags = p.tags || [];
                if (!currentTags.includes(tag)) {
                    return { ...p, tags: [...currentTags, tag] };
                }
            }
            return p;
        }));
    }, []);

    const removeTag = useCallback((projectId: string, tag: string) => {
        setProjects(prev => prev.map(p => {
            if (p.id === projectId) {
                return { ...p, tags: (p.tags || []).filter(t => t !== tag) };
            }
            return p;
        }));
    }, []);

    const openTerminal = useCallback(async (projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        try {
            await invoke('open_terminal', { path: project.path });
            addToast(`Opened terminal in ${project.name}`, 'success');
        } catch (e) {
            addToast(`Failed to open terminal: ${e}`, 'error');
        }
    }, [projects, addToast]);

    const getScripts = useCallback(async (projectId: string): Promise<ProjectScript[]> => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return [];
        try {
            return await invoke<ProjectScript[]>('get_scripts', { path: project.path });
        } catch (e) {
            addToast(`Failed to get scripts: ${e}`, 'error');
            return [];
        }
    }, [projects, addToast]);

    const runScript = useCallback(async (projectId: string, scriptName: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        try {
            setActionState(projectId, 'running-script');
            const result = await invoke<string>('run_script', { path: project.path, scriptName, packageManager: project.packageManager });
            addToast(result, 'success');
        } catch (e) {
            addToast(`Failed to run script: ${e}`, 'error');
        } finally {
            setActionState(projectId, null);
        }
    }, [projects, setActionState, addToast]);

    const gitPull = useCallback(async (projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        try {
            setActionState(projectId, 'pulling');
            const result = await invoke<string>('git_pull', { path: project.path });
            await refreshProject(projectId);
            addToast(result || 'Pull completed', 'success');
        } catch (e) {
            addToast(`Git pull failed: ${e}`, 'error');
        } finally {
            setActionState(projectId, null);
        }
    }, [projects, setActionState, addToast, refreshProject]);

    const gitFetch = useCallback(async (projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        try {
            setActionState(projectId, 'fetching');
            const result = await invoke<string>('git_fetch', { path: project.path });
            addToast(result, 'success');
        } catch (e) {
            addToast(`Git fetch failed: ${e}`, 'error');
        } finally {
            setActionState(projectId, null);
        }
    }, [projects, setActionState, addToast]);

    const checkHealth = useCallback(async (projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        try {
            setActionState(projectId, 'auditing');
            addToast('Checking project health...', 'info');
            const health = await invoke<HealthStatus>('check_health', { path: project.path });
            setProjects(prev => prev.map(p => p.id === projectId ? { ...p, healthStatus: health } : p));
            const total = health.vulnerabilities.low + health.vulnerabilities.moderate + health.vulnerabilities.high + health.vulnerabilities.critical;
            addToast(`Found ${health.outdatedCount} outdated packages, ${total} vulnerabilities`, total > 0 ? 'warning' : 'success');
        } catch (e) {
            addToast(`Health check failed: ${e}`, 'error');
        } finally {
            setActionState(projectId, null);
        }
    }, [projects, setActionState, addToast]);

    const bulkDeleteNodeModules = useCallback(async (projectIds: string[]) => {
        const paths = projectIds
            .map(id => projects.find(p => p.id === id))
            .filter(p => p && p.hasNodeModules)
            .map(p => p!.path);

        if (paths.length === 0) {
            addToast('No projects with node_modules selected', 'warning');
            return;
        }

        try {
            addToast(`Deleting node_modules from ${paths.length} projects...`, 'info');
            const results = await invoke<string[]>('bulk_delete_node_modules', { paths });

            setProjects(prev => prev.map(p =>
                projectIds.includes(p.id) ? { ...p, hasNodeModules: false, storage: '< 1 MB' } : p
            ));

            addToast(`Completed: ${results.filter(r => r.startsWith('✓')).length}/${paths.length} successful`, 'success');
            clearSelection();
        } catch (e) {
            addToast(`Bulk delete failed: ${e}`, 'error');
        }
    }, [projects, addToast, clearSelection]);

    const bulkCleanBuildFolders = useCallback(async (projectIds: string[]) => {
        const projectsToClean = projectIds
            .map(id => projects.find(p => p.id === id))
            .filter(p => p && p.hasBuildFolder && !p.hasNodeModules);

        if (projectsToClean.length === 0) {
            addToast('No projects with build folders selected', 'warning');
            return;
        }

        try {
            addToast(`Cleaning build folders from ${projectsToClean.length} projects...`, 'info');
            let successCount = 0;

            for (const project of projectsToClean) {
                if (!project) continue;
                try {
                    await invoke<string>('clean_build_folder', {
                        path: project.path,
                        projectType: project.projectType
                    });
                    successCount++;
                } catch (e) {
                    console.error(`Failed to clean ${project.name}:`, e);
                }
            }

            // Refresh all cleaned projects
            for (const project of projectsToClean) {
                if (project) await refreshProject(project.id);
            }

            addToast(`Completed: ${successCount}/${projectsToClean.length} build folders cleaned`, 'success');
            clearSelection();
        } catch (e) {
            addToast(`Bulk clean failed: ${e}`, 'error');
        }
    }, [projects, addToast, clearSelection, refreshProject]);

    return {
        projects,
        sortedProjects,
        loading,
        importing,
        actionStates,
        toasts,
        selectedIds,
        sortBy,
        filterTags,
        allTags,
        setSortBy,
        setFilterTags,
        toggleSelect,
        selectAll,
        clearSelection,
        addProject,
        addProjectFromPath,
        removeProject,
        refreshProject,
        openInIde,
        openTerminal,
        installDependencies,
        deleteNodeModules,
        cleanBuildFolder,
        bulkDeleteNodeModules,
        bulkCleanBuildFolders,
        gitPull,
        gitFetch,
        checkHealth,
        getScripts,
        runScript,
        togglePin,
        updateNotes,
        updateTags,
        addTag,
        removeTag,
        archiveProject,
        revealInExplorer,
        getActionState,
        addToast,
        removeToast,
    };
}
