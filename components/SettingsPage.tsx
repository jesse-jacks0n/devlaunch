import React, { useState, useEffect, useMemo } from 'react';
import { AppSettings, SortOption } from '../types';
import { platform } from '@tauri-apps/plugin-os';
import Icon from './Icon';

declare global {
    interface Window {
        __TAURI__?: {
            invoke: (cmd: string, args?: any) => Promise<any>;
        };
    }
}

interface SettingsPageProps {
    settings: AppSettings;
    onUpdateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
    onResetSettings: () => void;
    onClose: () => void;
}

const allIdeOptions = [
    { value: 'code', label: 'VS Code', icon: 'code' },
    { value: 'cursor', label: 'Cursor', icon: 'edit' },
    { value: 'webstorm', label: 'WebStorm', icon: 'web' },
    { value: 'idea', label: 'IntelliJ IDEA', icon: 'code_blocks' },
    { value: 'zed', label: 'Zed', icon: 'flash_on' },
    { value: 'xcode', label: 'Xcode', icon: 'phone_iphone', macOnly: true },
    { value: 'android-studio', label: 'Android Studio', icon: 'phone_android' },
];

const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'lastOpened', label: 'Last Opened' },
    { value: 'name', label: 'Name' },
    { value: 'mostUsed', label: 'Most Used' },
    { value: 'storage', label: 'Storage' },
    { value: 'lastActive', label: 'Last Active' },
];

const accentColors = [
    { value: '#1337ec', label: 'Blue', class: 'bg-[#1337ec]' },
    { value: '#8b5cf6', label: 'Purple', class: 'bg-purple-500' },
    { value: '#f59e0b', label: 'Amber', class: 'bg-amber-500' },
];

const SettingsPage: React.FC<SettingsPageProps> = ({
    settings,
    onUpdateSetting,
    onResetSettings,
    onClose,
}) => {
    const [autostartEnabled, setAutostartEnabled] = useState(false);
    const [autostartLoading, setAutostartLoading] = useState(true);
    const [currentPlatform, setCurrentPlatform] = useState<string>('');

    useEffect(() => {
        // Check autostart status and platform on mount
        const init = async () => {
            if (window.__TAURI__) {
                try {
                    const enabled = await window.__TAURI__.invoke('get_autostart_status');
                    setAutostartEnabled(enabled);
                } catch (e) {
                    console.error('Failed to get autostart status:', e);
                }
                try {
                    const os = await platform();
                    setCurrentPlatform(os);
                } catch (e) {
                    console.error('Failed to get platform:', e);
                }
            }
            setAutostartLoading(false);
        };
        init();
    }, []);

    // Filter IDE options based on platform
    const ideOptions = useMemo(() => {
        return allIdeOptions.filter(ide => {
            if ('macOnly' in ide && ide.macOnly) {
                return currentPlatform === 'macos';
            }
            return true;
        });
    }, [currentPlatform]);

    const toggleAutostart = async () => {
        if (window.__TAURI__) {
            try {
                const newValue = !autostartEnabled;
                await window.__TAURI__.invoke('set_autostart', { enabled: newValue });
                setAutostartEnabled(newValue);
            } catch (e) {
                console.error('Failed to set autostart:', e);
            }
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-white">Settings</h2>
                        <p className="text-sm text-slate-500 mt-1">Configure your DevLaunch preferences</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex items-center justify-center size-8 rounded hover:bg-surface text-slate-400 hover:text-white transition-colors"
                    >
                        <Icon name="close" />
                    </button>
                </div>

                {/* IDE Settings */}
                <section className="mb-8">
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Icon name="code" className="text-[18px] text-primary" />
                        IDE Configuration
                    </h3>
                    <div className="bg-surface border border-border-dim rounded-lg p-4 space-y-4">
                        <div>
                            <label className="block text-sm text-slate-300 mb-2">Default IDE</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {ideOptions.map(ide => (
                                    <button
                                        key={ide.value}
                                        onClick={() => onUpdateSetting('defaultIde', ide.value)}
                                        className={`flex items-center gap-2 px-4 py-3 rounded border transition-all
                                            ${settings.defaultIde === ide.value
                                                ? 'bg-primary/10 border-primary/30 text-white'
                                                : 'bg-surface-highlight border-border-dim text-slate-400 hover:text-white hover:border-border-dim/80'
                                            }`}
                                    >
                                        <Icon name={ide.icon} className="text-[18px]" />
                                        <span className="text-sm font-medium">{ide.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-slate-300 mb-2">Custom IDE Path (Optional)</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={settings.idePath}
                                    onChange={(e) => onUpdateSetting('idePath', e.target.value)}
                                    placeholder="e.g., C:\Program Files\IDE\ide.exe"
                                    className="flex-1 px-3 py-2 bg-background-dark border border-border-dim rounded text-sm text-white placeholder-slate-600 font-mono focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50"
                                />
                                <button
                                    onClick={() => {
                                        // Trigger a visual save confirmation
                                        const btn = document.getElementById('save-path-btn');
                                        if (btn) {
                                            btn.textContent = 'Saved!';
                                            btn.classList.add('bg-green-500/20', 'text-green-400', 'border-green-500/30');
                                            setTimeout(() => {
                                                btn.textContent = 'Save';
                                                btn.classList.remove('bg-green-500/20', 'text-green-400', 'border-green-500/30');
                                            }, 1500);
                                        }
                                    }}
                                    id="save-path-btn"
                                    className="px-4 py-2 text-sm font-medium text-primary border border-primary/30 rounded hover:bg-primary/10 transition-colors"
                                >
                                    Save
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Leave empty to use system PATH</p>
                        </div>
                    </div>
                </section>

                {/* Appearance Settings */}
                <section className="mb-8">
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Icon name="palette" className="text-[18px] text-primary" />
                        Appearance
                    </h3>
                    <div className="bg-surface border border-border-dim rounded-lg p-4 space-y-6">
                        {/* Theme Toggle */}
                        <div>
                            <label className="block text-sm text-slate-300 mb-3">Theme</label>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => onUpdateSetting('theme', 'dark')}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded border transition-all
                                        ${settings.theme === 'dark'
                                            ? 'bg-primary/10 border-primary/30 text-white'
                                            : 'bg-surface-highlight border-border-dim text-slate-400 hover:text-white hover:border-border-dim/80'
                                        }`}
                                >
                                    <Icon name="dark_mode" className="text-[18px]" />
                                    <span className="text-sm font-medium">Dark</span>
                                </button>
                                <button
                                    onClick={() => onUpdateSetting('theme', 'light')}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded border transition-all
                                        ${settings.theme === 'light'
                                            ? 'bg-primary/10 border-primary/30 text-white'
                                            : 'bg-surface-highlight border-border-dim text-slate-400 hover:text-white hover:border-border-dim/80'
                                        }`}
                                >
                                    <Icon name="light_mode" className="text-[18px]" />
                                    <span className="text-sm font-medium">Light</span>
                                </button>
                            </div>
                        </div>

                        {/* Accent Color */}
                        <div>
                            <label className="block text-sm text-slate-300 mb-3">Accent Color</label>
                            <div className="flex gap-2 flex-wrap">
                                {accentColors.map(color => (
                                    <button
                                        key={color.value}
                                        onClick={() => onUpdateSetting('accentColor', color.value)}
                                        className={`size-10 rounded-lg transition-all ${color.class} hover:scale-110
                                            ${settings.accentColor === color.value
                                                ? 'ring-2 ring-white ring-offset-2 ring-offset-surface'
                                                : 'opacity-70 hover:opacity-100'
                                            }`}
                                        title={color.label}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Default Sort */}
                        <div>
                            <label className="block text-sm text-slate-300 mb-3">Default Sort Order</label>
                            <select
                                value={settings.defaultSort}
                                onChange={(e) => onUpdateSetting('defaultSort', e.target.value as SortOption)}
                                className="w-full px-3 py-2 bg-background-dark border border-border-dim rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50"
                            >
                                {sortOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </section>

                {/* Behavior Settings */}
                <section className="mb-8">
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Icon name="tune" className="text-[18px] text-primary" />
                        Behavior
                    </h3>
                    <div className="bg-surface border border-border-dim rounded-lg divide-y divide-border-dim">
                        <div className="flex items-center justify-between p-4">
                            <div>
                                <p className="text-sm text-white">Confirm before deleting node_modules</p>
                                <p className="text-xs text-slate-500 mt-0.5">Show a confirmation dialog before deleting</p>
                            </div>
                            <button
                                onClick={() => onUpdateSetting('confirmBeforeDelete', !settings.confirmBeforeDelete)}
                                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0
                                    ${settings.confirmBeforeDelete ? 'bg-primary' : 'bg-surface-highlight border border-border-dim'}`}
                            >
                                <span
                                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200"
                                    style={{ left: settings.confirmBeforeDelete ? '22px' : '4px' }}
                                />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4">
                            <div>
                                <p className="text-sm text-white">Show archived projects</p>
                                <p className="text-xs text-slate-500 mt-0.5">Display archived projects in the library</p>
                            </div>
                            <button
                                onClick={() => onUpdateSetting('showArchivedProjects', !settings.showArchivedProjects)}
                                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0
                                    ${settings.showArchivedProjects ? 'bg-primary' : 'bg-surface-highlight border border-border-dim'}`}
                            >
                                <span
                                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200"
                                    style={{ left: settings.showArchivedProjects ? '22px' : '4px' }}
                                />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4">
                            <div>
                                <p className="text-sm text-white">Launch at startup</p>
                                <p className="text-xs text-slate-500 mt-0.5">Automatically start DevLaunch when you log in</p>
                            </div>
                            <button
                                onClick={toggleAutostart}
                                disabled={autostartLoading}
                                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0
                                    ${autostartEnabled ? 'bg-primary' : 'bg-surface-highlight border border-border-dim'}
                                    ${autostartLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <span
                                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200"
                                    style={{ left: autostartEnabled ? '22px' : '4px' }}
                                />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="mb-8">
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Icon name="warning" className="text-[18px] text-red-400" />
                        Danger Zone
                    </h3>
                    <div className="bg-surface border border-red-500/20 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-white">Reset all settings</p>
                                <p className="text-xs text-slate-500 mt-0.5">Restore settings to default values</p>
                            </div>
                            <button
                                onClick={onResetSettings}
                                className="px-4 py-2 text-sm font-medium text-red-400 border border-red-500/30 rounded hover:bg-red-500/10 transition-colors"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </section>

                {/* About */}
                <section>
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Icon name="info" className="text-[18px] text-primary" />
                        About
                    </h3>
                    <div className="bg-surface border border-border-dim rounded-lg p-4 space-y-4">
                        <div className="flex items-center gap-4">

                            <div>
                                <p className="text-sm font-bold text-white">DevLaunch</p>
                                <p className="text-xs text-slate-500 font-mono">v3.0.1-beta</p>
                                <p className="text-xs text-slate-500 mt-1">A fast, opinionated project launcher for developers</p>
                            </div>
                        </div>
                        <div className="pt-3 border-t border-border-dim">
                            <p className="text-xs text-slate-500 mb-2">Created by</p>
                            <div className="flex items-center gap-3">
                                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Icon name="person" className="text-[16px] text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">Jesse Jackson</p>
                                    <a
                                        href="https://github.com/jesse-jacks0n"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-primary hover:underline flex items-center gap-1"
                                    >
                                        <svg className="size-3" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                        </svg>
                                        github.com/jesse-jacks0n
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SettingsPage;
