import React, { useState } from 'react';
import { Project } from '../types';
import Icon from './Icon';

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

interface ActivityPageProps {
    projects: Project[];
    activityLog: ActivityItem[];
    onClose: () => void;
    onClearActivity: () => void;
}

const ActivityPage: React.FC<ActivityPageProps> = ({ projects, activityLog, onClose, onClearActivity }) => {
    const [filter, setFilter] = useState<'all' | 'open' | 'install' | 'git' | 'script'>('all');

    const filteredActivity = activityLog.filter(item => {
        if (filter === 'all') return true;
        if (filter === 'open') return item.type === 'open';
        if (filter === 'install') return item.type === 'install' || item.type === 'delete';
        if (filter === 'git') return item.type === 'git';
        if (filter === 'script') return item.type === 'script';
        return true;
    });

    const getRelativeTime = (date: Date): string => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffSec < 60) return 'just now';
        if (diffMin < 60) return `${diffMin}m ago`;
        if (diffHour < 24) return `${diffHour}h ago`;
        if (diffDay < 7) return `${diffDay}d ago`;
        return date.toLocaleDateString();
    };

    const groupByDate = (items: ActivityItem[]): { label: string; items: ActivityItem[] }[] => {
        const groups: { [key: string]: ActivityItem[] } = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const thisWeek = new Date(today);
        thisWeek.setDate(thisWeek.getDate() - 7);

        items.forEach(item => {
            const itemDate = new Date(item.timestamp);
            itemDate.setHours(0, 0, 0, 0);

            let key: string;
            if (itemDate.getTime() === today.getTime()) {
                key = 'Today';
            } else if (itemDate.getTime() === yesterday.getTime()) {
                key = 'Yesterday';
            } else if (itemDate >= thisWeek) {
                key = 'This Week';
            } else {
                key = 'Earlier';
            }

            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
        });

        const order = ['Today', 'Yesterday', 'This Week', 'Earlier'];
        return order
            .filter(key => groups[key]?.length > 0)
            .map(key => ({ label: key, items: groups[key] }));
    };

    const groupedActivity = groupByDate(filteredActivity);

    // Calculate stats
    const todayCount = activityLog.filter(item => {
        const itemDate = new Date(item.timestamp);
        const today = new Date();
        return itemDate.toDateString() === today.toDateString();
    }).length;

    const weekCount = activityLog.filter(item => {
        const itemDate = new Date(item.timestamp);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return itemDate >= weekAgo;
    }).length;

    const mostActiveProject = activityLog.reduce((acc, item) => {
        acc[item.projectName] = (acc[item.projectName] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const topProject = Object.entries(mostActiveProject).sort((a, b) => (b[1] as number) - (a[1] as number))[0];

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="header-bg h-auto shrink-0 border-b border-border-dim bg-background-dark/80 backdrop-blur-md z-10">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onClose}
                            className="size-8 rounded flex items-center justify-center hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                        >
                            <Icon name="arrow_back" className="text-[20px]" />
                        </button>
                        <div>
                            <h2 className="text-white text-xl font-bold tracking-tight">Activity Log</h2>
                            <p className="text-slate-500 text-xs font-mono">
                                {activityLog.length} total actions recorded
                            </p>
                        </div>
                    </div>
                    {activityLog.length > 0 && (
                        <button
                            onClick={onClearActivity}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        >
                            <Icon name="delete_sweep" className="text-[16px]" />
                            Clear History
                        </button>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="px-6 pb-3 flex items-center gap-2">
                    {[
                        { value: 'all', label: 'All', icon: 'list' },
                        { value: 'open', label: 'Opens', icon: 'open_in_new' },
                        { value: 'install', label: 'Dependencies', icon: 'download' },
                        { value: 'git', label: 'Git', icon: 'commit' },
                        { value: 'script', label: 'Scripts', icon: 'play_arrow' },
                    ].map(tab => (
                        <button
                            key={tab.value}
                            onClick={() => setFilter(tab.value as any)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors
                                ${filter === tab.value
                                    ? 'bg-primary/10 text-primary border border-primary/20'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                                }`}
                        >
                            <Icon name={tab.icon} className="text-[14px]" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-4xl mx-auto p-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-surface border border-border-dim rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Icon name="today" className="text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{todayCount}</p>
                                    <p className="text-xs text-slate-500">Actions Today</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-surface border border-border-dim rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                    <Icon name="date_range" className="text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{weekCount}</p>
                                    <p className="text-xs text-slate-500">This Week</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-surface border border-border-dim rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                    <Icon name="star" className="text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white truncate" title={topProject?.[0]}>
                                        {topProject?.[0] || 'N/A'}
                                    </p>
                                    <p className="text-xs text-slate-500">Most Active Project</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Activity List */}
                    {filteredActivity.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="size-16 rounded-full bg-surface flex items-center justify-center mb-4">
                                <Icon name="history" className="text-[32px] text-slate-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">No Activity Yet</h3>
                            <p className="text-sm text-slate-500 max-w-sm">
                                Your project actions will appear here. Open a project, install dependencies, or run scripts to start tracking.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {groupedActivity.map(group => (
                                <div key={group.label}>
                                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
                                        {group.label}
                                    </h3>
                                    <div className="space-y-2">
                                        {group.items.map(item => (
                                            <div
                                                key={item.id}
                                                className="flex items-center gap-4 p-3 bg-surface border border-border-dim rounded-lg hover:border-border-dim/80 transition-colors"
                                            >
                                                <div className={`size-10 rounded-lg flex items-center justify-center ${item.iconColor}`}>
                                                    <Icon name={item.icon} className="text-[20px]" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-white">{item.description}</p>
                                                    <p className="text-xs text-slate-500 truncate">{item.projectName}</p>
                                                </div>
                                                <span className="text-xs text-slate-600 font-mono shrink-0">
                                                    {getRelativeTime(new Date(item.timestamp))}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActivityPage;
