export interface TechStack {
    name: string;
    type: 'default' | 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'pink' | 'orange';
}

export interface GitStatus {
    branch: string;
    status: 'Clean' | 'Modified' | 'Behind' | 'Ahead' | 'Up to date' | 'N/A' | 'Unknown';
    count?: number;
    type: 'success' | 'warning' | 'error' | 'neutral' | 'info';
}

export interface ProjectScript {
    name: string;
    command: string;
}

export interface HealthStatus {
    outdatedCount: number;
    vulnerabilities: {
        low: number;
        moderate: number;
        high: number;
        critical: number;
    };
    lastChecked?: string;
}

export interface Project {
    id: string;
    name: string;
    path: string;
    icon: string;
    techStack: TechStack[];
    gitStatus: GitStatus;
    lastActive: string;
    lastOpened?: string;
    openCount?: number;
    storage: string;
    buildStorage?: string;
    isArchived?: boolean;
    isPinned?: boolean;
    hasNodeModules: boolean;
    hasBuildFolder: boolean;
    buildFolderName?: string;
    packageManager?: string;
    notes?: string;
    tags?: string[];
    scripts?: ProjectScript[];
    healthStatus?: HealthStatus;
    projectType?: 'node' | 'flutter' | 'android' | 'python' | 'rust' | 'go' | 'other';
    hasGit?: boolean;
}

export interface ProjectScanResult {
    project: Project;
    detected: boolean;
}

export type SortOption = 'name' | 'lastOpened' | 'mostUsed' | 'storage' | 'lastActive';

export interface AppSettings {
    defaultIde: string;
    idePath: string;
    theme: 'dark' | 'light';
    accentColor: string;
    confirmBeforeDelete: boolean;
    showArchivedProjects: boolean;
    defaultSort: SortOption;
}

export type ViewType = 'library' | 'settings' | 'activity' | 'statistics' | 'templates';

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
}

export interface ActionState {
    projectId: string;
    action: 'installing' | 'deleting' | 'opening' | 'scanning' | 'pulling' | 'fetching' | 'auditing' | 'running-script';
    progress?: number;
}

export interface ProjectTemplate {
    id: string;
    name: string;
    description: string;
    icon: string;
    command: string;
    techStack: TechStack[];
}