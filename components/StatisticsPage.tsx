import React, { useMemo } from 'react';
import { Project } from '../types';
import Icon from './Icon';

interface StatisticsPageProps {
    projects: Project[];
    onClose: () => void;
}

// Simple donut chart component
interface DonutChartProps {
    data: { label: string; value: number; color: string }[];
    size?: number;
    strokeWidth?: number;
    title?: string;
    centerValue?: string | number;
}

const DonutChart: React.FC<DonutChartProps> = ({ data, size = 160, strokeWidth = 12, title, centerValue }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const center = size / 2;

    let accumulatedOffset = 0;

    return (
        <div className="flex flex-col items-center">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Background circle */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth={strokeWidth}
                />
                {/* Data segments */}
                {data.map((item, index) => {
                    const percentage = total > 0 ? item.value / total : 0;
                    const dashLength = percentage * circumference;
                    const dashOffset = -accumulatedOffset * circumference / total;
                    accumulatedOffset += item.value;

                    return (
                        <circle
                            key={index}
                            cx={center}
                            cy={center}
                            r={radius}
                            fill="none"
                            stroke={item.color}
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                            strokeDashoffset={circumference / 4 + dashOffset}
                            className="transition-all duration-500"
                        />
                    );
                })}
                {/* Center text */}
                <text x={center} y={center - 8} textAnchor="middle" className="chart-center-text fill-white text-2xl font-bold">
                    {centerValue !== undefined ? centerValue : total}
                </text>
                <text x={center} y={center + 12} textAnchor="middle" className="fill-slate-500 text-xs">
                    {title}
                </text>
            </svg>
        </div>
    );
};

// Parse storage string to bytes
const parseStorage = (storage: string): number => {
    const match = storage.match(/^([\d.]+)\s*(B|KB|MB|GB|TB)?$/i);
    if (!match) return 0;
    const value = parseFloat(match[1]);
    const unit = (match[2] || 'B').toUpperCase();
    const multipliers: Record<string, number> = {
        'B': 1,
        'KB': 1024,
        'MB': 1024 * 1024,
        'GB': 1024 * 1024 * 1024,
        'TB': 1024 * 1024 * 1024 * 1024,
    };
    return value * (multipliers[unit] || 1);
};

// Format bytes to human readable
const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
};

const StatisticsPage: React.FC<StatisticsPageProps> = ({ projects, onClose }) => {
    // Calculate storage statistics
    const storageStats = useMemo(() => {
        const projectStorage = projects.map(p => ({
            name: p.name,
            bytes: parseStorage(p.storage),
            storage: p.storage,
            hasNodeModules: p.hasNodeModules,
        })).sort((a, b) => b.bytes - a.bytes);

        const totalStorage = projectStorage.reduce((sum, p) => sum + p.bytes, 0);
        const withNodeModules = projects.filter(p => p.hasNodeModules).length;
        const withoutNodeModules = projects.length - withNodeModules;

        return { projectStorage, totalStorage, withNodeModules, withoutNodeModules };
    }, [projects]);

    // Calculate tech stack statistics
    const techStackStats = useMemo(() => {
        const techCount: Record<string, { count: number; color: string }> = {};

        projects.forEach(project => {
            project.techStack.forEach(tech => {
                if (!techCount[tech.name]) {
                    const colorMap: Record<string, string> = {
                        'blue': '#3b82f6',
                        'pink': '#ec4899',
                        'orange': '#f97316',
                        'purple': '#a855f7',
                        'yellow': '#eab308',
                        'green': '#22c55e',
                        'red': '#ef4444',
                        'default': '#64748b',
                    };
                    techCount[tech.name] = { count: 0, color: colorMap[tech.type] || '#64748b' };
                }
                techCount[tech.name].count++;
            });
        });

        return Object.entries(techCount)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.count - a.count);
    }, [projects]);

    // Top storage consumers donut data
    const storageDonutData = useMemo(() => {
        const colors = ['#3b82f6', '#a855f7', '#22c55e', '#f97316', '#ec4899', '#eab308', '#ef4444', '#64748b'];
        const top5 = storageStats.projectStorage.slice(0, 5);
        const others = storageStats.projectStorage.slice(5);
        const othersTotal = others.reduce((sum, p) => sum + p.bytes, 0);

        const data = top5.map((p, i) => ({
            label: p.name,
            value: p.bytes,
            color: colors[i % colors.length],
        }));

        if (othersTotal > 0) {
            data.push({
                label: 'Others',
                value: othersTotal,
                color: '#374151',
            });
        }

        return data;
    }, [storageStats]);

    // Tech stack donut data
    const techDonutData = useMemo(() => {
        return techStackStats.slice(0, 8).map(tech => ({
            label: tech.name,
            value: tech.count,
            color: tech.color,
        }));
    }, [techStackStats]);

    // node_modules donut data
    const nodeModulesDonutData = useMemo(() => [
        { label: 'With node_modules', value: storageStats.withNodeModules, color: '#f97316' },
        { label: 'Without node_modules', value: storageStats.withoutNodeModules, color: '#22c55e' },
    ], [storageStats]);

    return (
        <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-white">Statistics</h2>
                        <p className="text-sm text-slate-500 mt-1">Overview of your project analytics and storage usage</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex items-center justify-center size-8 rounded hover:bg-surface text-slate-400 hover:text-white transition-colors"
                    >
                        <Icon name="close" />
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-surface border border-border-dim rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-lg bg-primary/20 flex items-center justify-center">
                                <Icon name="folder" className="text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{projects.length}</p>
                                <p className="text-xs text-slate-500">Total Projects</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-surface border border-border-dim rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-lg bg-primary/20 flex items-center justify-center">
                                <Icon name="hard_drive" className="text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{formatBytes(storageStats.totalStorage)}</p>
                                <p className="text-xs text-slate-500">Total Storage</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-surface border border-border-dim rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                <Icon name="inventory_2" className="text-orange-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{storageStats.withNodeModules}</p>
                                <p className="text-xs text-slate-500">With node_modules</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-surface border border-border-dim rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-lg bg-primary/20 flex items-center justify-center">
                                <Icon name="code" className="text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{techStackStats.length}</p>
                                <p className="text-xs text-slate-500">Unique Tech Stacks</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Storage by Project */}
                    <div className="bg-surface border border-border-dim rounded-lg p-6">
                        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                            <Icon name="pie_chart" className="text-[18px] text-primary" />
                            Storage by Project
                        </h3>
                        <div className="flex flex-col items-center">
                            <DonutChart data={storageDonutData} title="projects" centerValue={storageStats.projectStorage.length} />
                            <div className="mt-4 space-y-2 w-full">
                                {storageDonutData.slice(0, 5).map((item, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="size-3 rounded-sm" style={{ backgroundColor: item.color }}></div>
                                            <span className="text-slate-300 truncate max-w-[100px]">{item.label}</span>
                                        </div>
                                        <span className="text-slate-500 font-mono">{formatBytes(item.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Tech Stack Usage */}
                    <div className="bg-surface border border-border-dim rounded-lg p-6">
                        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                            <Icon name="donut_large" className="text-[18px] text-primary" />
                            Tech Stack Usage
                        </h3>
                        <div className="flex flex-col items-center">
                            <DonutChart data={techDonutData} title="technologies" />
                            <div className="mt-4 space-y-2 w-full">
                                {techDonutData.slice(0, 5).map((item, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="size-3 rounded-sm" style={{ backgroundColor: item.color }}></div>
                                            <span className="text-slate-300">{item.label}</span>
                                        </div>
                                        <span className="text-slate-500 font-mono">{item.value} projects</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* node_modules Status */}
                    <div className="bg-surface border border-border-dim rounded-lg p-6">
                        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                            <Icon name="inventory" className="text-[18px] text-primary" />
                            Dependencies Status
                        </h3>
                        <div className="flex flex-col items-center">
                            <DonutChart data={nodeModulesDonutData} title="projects" />
                            <div className="mt-4 space-y-2 w-full">
                                {nodeModulesDonutData.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="size-3 rounded-sm" style={{ backgroundColor: item.color }}></div>
                                            <span className="text-slate-300">{item.label}</span>
                                        </div>
                                        <span className="text-slate-500 font-mono">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Storage Breakdown Table */}
                <div className="bg-surface border border-border-dim rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-border-dim">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                            <Icon name="storage" className="text-[18px] text-primary" />
                            Storage Breakdown
                        </h3>
                    </div>
                    <div className="divide-y divide-border-dim max-h-[300px] overflow-y-auto custom-scrollbar">
                        {storageStats.projectStorage.length === 0 ? (
                            <div className="px-6 py-8 text-center text-slate-500 text-sm">
                                No projects yet. Add a project to see storage statistics.
                            </div>
                        ) : (
                            storageStats.projectStorage.map((project, index) => (
                                <div key={index} className="storage-item px-6 py-3 flex items-center justify-between hover:bg-surface-highlight transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-slate-500 font-mono w-6">{index + 1}.</span>
                                        <div>
                                            <p className="text-sm text-white">{project.name}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                {project.hasNodeModules && (
                                                    <span className="text-[10px] text-orange-400 font-mono flex items-center gap-1">
                                                        <Icon name="folder" className="text-[10px]" />
                                                        node_modules
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-32 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${storageStats.totalStorage > 0 ? (project.bytes / storageStats.totalStorage) * 100 : 0}%`,
                                                    background: 'linear-gradient(to right, var(--accent-color), color-mix(in srgb, var(--accent-color), #ffffff 40%))'
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm font-mono text-slate-300 w-20 text-right">{project.storage}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatisticsPage;
