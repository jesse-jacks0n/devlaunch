import { useState, useEffect, useCallback } from 'react';
import { AppSettings } from '../types';

const SETTINGS_KEY = 'devlaunch_settings';

const defaultSettings: AppSettings = {
    defaultIde: 'code',
    idePath: '',
    theme: 'dark',
    accentColor: '#1337ec',
    confirmBeforeDelete: true,
    showArchivedProjects: false,
    defaultSort: 'lastOpened',
};

export function useSettings() {
    const [settings, setSettings] = useState<AppSettings>(defaultSettings);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(SETTINGS_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setSettings({ ...defaultSettings, ...parsed });
            } catch (e) {
                console.error('Failed to parse settings:', e);
            }
        }
        setLoaded(true);
    }, []);

    useEffect(() => {
        if (loaded) {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
            // Apply theme to document
            document.documentElement.setAttribute('data-theme', settings.theme);
            // Apply accent color as CSS variable
            document.documentElement.style.setProperty('--accent-color', settings.accentColor);
        }
    }, [settings, loaded]);

    const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    }, []);

    const resetSettings = useCallback(() => {
        setSettings(defaultSettings);
    }, []);

    return {
        settings,
        updateSetting,
        resetSettings,
        loaded,
    };
}
