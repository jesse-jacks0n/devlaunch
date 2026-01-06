import React, { useState, useEffect, useMemo } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { platform } from '@tauri-apps/plugin-os';
import { FRAMEWORK_TEMPLATES, FrameworkTemplate } from '../constants';
import Icon from './Icon';

interface NewProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImportProject: () => void;
    onProjectCreated: (path: string) => void;
}

type Step = 'choose' | 'select-framework' | 'configure';
type Category = 'all' | 'web' | 'mobile' | 'backend' | 'desktop';

const CATEGORIES: { value: Category; label: string; icon: string }[] = [
    { value: 'all', label: 'All', icon: 'apps' },
    { value: 'web', label: 'Web', icon: 'language' },
    { value: 'mobile', label: 'Mobile', icon: 'phone_iphone' },
    { value: 'backend', label: 'Backend', icon: 'dns' },
    { value: 'desktop', label: 'Desktop', icon: 'desktop_windows' },
];

const NewProjectModal: React.FC<NewProjectModalProps> = ({
    isOpen,
    onClose,
    onImportProject,
    onProjectCreated,
}) => {
    const [step, setStep] = useState<Step>('choose');
    const [selectedCategory, setSelectedCategory] = useState<Category>('all');
    const [selectedTemplate, setSelectedTemplate] = useState<FrameworkTemplate | null>(null);
    const [projectName, setProjectName] = useState('');
    const [parentPath, setParentPath] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [toolInstalled, setToolInstalled] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [currentPlatform, setCurrentPlatform] = useState<string>('');

    // Get platform on mount
    useEffect(() => {
        const getPlatform = async () => {
            try {
                const os = await platform();
                setCurrentPlatform(os);
            } catch (e) {
                console.error('Failed to get platform:', e);
            }
        };
        getPlatform();
    }, []);

    // Filter templates based on platform (macOnly templates only shown on macOS)
    const platformFilteredTemplates = useMemo(() => {
        return FRAMEWORK_TEMPLATES.filter(t => {
            if (t.macOnly) {
                return currentPlatform === 'macos';
            }
            return true;
        });
    }, [currentPlatform]);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setStep('choose');
            setSelectedCategory('all');
            setSelectedTemplate(null);
            setProjectName('');
            setParentPath('');
            setError(null);
            setToolInstalled(null);
        }
    }, [isOpen]);

    // Check if required tool is installed when template is selected
    useEffect(() => {
        const checkTool = async () => {
            if (selectedTemplate?.requiresTool) {
                setToolInstalled(null);
                try {
                    const installed = await invoke<boolean>('check_tool_installed', {
                        tool: selectedTemplate.requiresTool,
                    });
                    setToolInstalled(installed);
                } catch {
                    setToolInstalled(false);
                }
            } else {
                setToolInstalled(true);
            }
        };
        checkTool();
    }, [selectedTemplate]);

    const filteredTemplates = platformFilteredTemplates.filter(
        t => selectedCategory === 'all' || t.category === selectedCategory
    );

    const handleSelectFolder = async () => {
        try {
            const selected = await open({
                directory: true,
                multiple: false,
                title: 'Select Parent Directory for New Project',
            });
            if (selected) {
                setParentPath(selected as string);
            }
        } catch (e) {
            console.error('Failed to select folder:', e);
        }
    };

    const handleCreateProject = async () => {
        if (!selectedTemplate || !projectName.trim() || !parentPath) {
            setError('Please fill in all fields');
            return;
        }

        // Validate project name (alphanumeric, hyphens, underscores)
        if (!/^[a-zA-Z0-9_-]+$/.test(projectName)) {
            setError('Project name can only contain letters, numbers, hyphens, and underscores');
            return;
        }

        setIsCreating(true);
        setError(null);

        try {
            // For Android projects that need manual setup
            if (selectedTemplate.manualSetupMessage) {
                // Just show the message and close
                alert(selectedTemplate.manualSetupMessage);
                onClose();
                return;
            }

            const projectPath = await invoke<string>('create_project_in_terminal', {
                parentPath,
                projectName,
                command: selectedTemplate.command,
            });

            // Give user a message about adding the project after creation
            setTimeout(() => {
                onProjectCreated(projectPath);
            }, 1000);

            onClose();
        } catch (e) {
            setError(`Failed to create project: ${e}`);
        } finally {
            setIsCreating(false);
        }
    };

    const handleBack = () => {
        if (step === 'configure') {
            setStep('select-framework');
            setSelectedTemplate(null);
        } else if (step === 'select-framework') {
            setStep('choose');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="modal-dialog bg-background border border-border-dim rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-slide-up overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border-dim bg-surface/50">
                    <div className="flex items-center gap-3">
                        {step !== 'choose' && (
                            <button
                                onClick={handleBack}
                                className="size-8 flex items-center justify-center rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            >
                                <Icon name="arrow_back" className="text-[20px]" />
                            </button>
                        )}
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                {step === 'choose' && 'Add New Project'}
                                {step === 'select-framework' && 'Select Framework'}
                                {step === 'configure' && `Create ${selectedTemplate?.name} Project`}
                            </h2>
                            <p className="text-xs text-slate-500">
                                {step === 'choose' && 'Import an existing project or create a new one'}
                                {step === 'select-framework' && 'Choose a framework to get started'}
                                {step === 'configure' && 'Configure your new project'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="size-8 flex items-center justify-center rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                        <Icon name="close" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Step 1: Choose Import or Create */}
                    {step === 'choose' && (
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => {
                                    onImportProject();
                                    onClose();
                                }}
                                className="flex flex-col items-center gap-4 p-8 rounded-xl border-2 border-border-dim hover:border-primary/50 bg-surface-highlight/50 hover:bg-surface-highlight transition-all group"
                            >
                                <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                    <Icon name="folder_open" className="text-[32px] text-primary" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-white font-semibold mb-1">Import Existing</h3>
                                    <p className="text-xs text-slate-500">Add an existing project folder to your library</p>
                                </div>
                            </button>

                            <button
                                onClick={() => setStep('select-framework')}
                                className="flex flex-col items-center gap-4 p-8 rounded-xl border-2 border-border-dim hover:border-emerald-500/50 bg-surface-highlight/50 hover:bg-surface-highlight transition-all group"
                            >
                                <div className="size-16 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                                    <Icon name="add_circle" className="text-[32px] text-emerald-400" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-white font-semibold mb-1">Create New</h3>
                                    <p className="text-xs text-slate-500">Start a new project from a template</p>
                                </div>
                            </button>
                        </div>
                    )}

                    {/* Step 2: Select Framework */}
                    {step === 'select-framework' && (
                        <div className="space-y-4">
                            {/* Category Filter */}
                            <div className="flex gap-2 pb-4 border-b border-border-dim">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.value}
                                        onClick={() => setSelectedCategory(cat.value)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                                            ${selectedCategory === cat.value
                                                ? 'bg-primary/20 text-primary border border-primary/30'
                                                : 'bg-surface border border-border-dim text-slate-400 hover:text-white hover:border-slate-500'
                                            }`}
                                    >
                                        <Icon name={cat.icon} className="text-[16px]" />
                                        {cat.label}
                                    </button>
                                ))}
                            </div>

                            {/* Framework Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                {filteredTemplates.map(template => (
                                    <button
                                        key={template.id}
                                        onClick={() => {
                                            setSelectedTemplate(template);
                                            setStep('configure');
                                        }}
                                        className="flex items-start gap-3 p-4 rounded-lg border border-border-dim hover:border-primary/50 bg-surface-highlight/30 hover:bg-surface-highlight transition-all text-left group"
                                    >
                                        <div className="size-10 rounded-lg bg-surface flex items-center justify-center shrink-0 border border-border-dim group-hover:border-primary/30">
                                            <Icon name={template.icon} className="text-[20px] text-slate-400 group-hover:text-primary" />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-sm font-medium text-white truncate">{template.name}</h4>
                                            <p className="text-xs text-slate-500 line-clamp-2">{template.description}</p>
                                            <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-medium uppercase
                                                ${template.category === 'web' ? 'bg-blue-500/10 text-blue-400' : ''}
                                                ${template.category === 'mobile' ? 'bg-purple-500/10 text-purple-400' : ''}
                                                ${template.category === 'backend' ? 'bg-emerald-500/10 text-emerald-400' : ''}
                                                ${template.category === 'desktop' ? 'bg-orange-500/10 text-orange-400' : ''}
                                            `}>
                                                {template.category}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Configure Project */}
                    {step === 'configure' && selectedTemplate && (
                        <div className="space-y-6">
                            {/* Template Info */}
                            <div className="flex items-center gap-4 p-4 rounded-lg bg-surface-highlight/50 border border-border-dim">
                                <div className="size-12 rounded-lg bg-surface flex items-center justify-center border border-border-dim">
                                    <Icon name={selectedTemplate.icon} className="text-[24px] text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-white font-medium">{selectedTemplate.name}</h3>
                                    <p className="text-sm text-slate-500">{selectedTemplate.description}</p>
                                </div>
                            </div>

                            {/* Manual Setup Message for Android */}
                            {selectedTemplate.manualSetupMessage && (
                                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                                    <div className="flex items-start gap-3">
                                        <Icon name="info" className="text-amber-400" />
                                        <div>
                                            <h4 className="text-sm font-medium text-amber-400 mb-1">Manual Setup Required</h4>
                                            <p className="text-sm text-slate-300">{selectedTemplate.manualSetupMessage}</p>
                                            {selectedTemplate.toolInstallUrl && (
                                                <a
                                                    href={selectedTemplate.toolInstallUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 mt-2 text-sm text-primary hover:underline"
                                                >
                                                    Download {selectedTemplate.requiresTool}
                                                    <Icon name="open_in_new" className="text-[14px]" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tool Check */}
                            {selectedTemplate.requiresTool && !selectedTemplate.manualSetupMessage && (
                                <div className={`p-4 rounded-lg border ${toolInstalled === false
                                    ? 'bg-red-500/10 border-red-500/30'
                                    : toolInstalled === true
                                        ? 'bg-emerald-500/10 border-emerald-500/30'
                                        : 'bg-slate-500/10 border-border-dim'
                                    }`}>
                                    <div className="flex items-center gap-3">
                                        {toolInstalled === null ? (
                                            <Icon name="progress_activity" className="text-slate-400 animate-spin" />
                                        ) : toolInstalled ? (
                                            <Icon name="check_circle" className="text-emerald-400" />
                                        ) : (
                                            <Icon name="error" className="text-red-400" />
                                        )}
                                        <div>
                                            <p className={`text-sm font-medium ${toolInstalled === false ? 'text-red-400' : toolInstalled ? 'text-emerald-400' : 'text-slate-400'}`}>
                                                {toolInstalled === null && `Checking for ${selectedTemplate.requiresTool}...`}
                                                {toolInstalled === true && `${selectedTemplate.requiresTool} is installed`}
                                                {toolInstalled === false && `${selectedTemplate.requiresTool} is not installed`}
                                            </p>
                                            {toolInstalled === false && selectedTemplate.toolInstallUrl && (
                                                <a
                                                    href={selectedTemplate.toolInstallUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                                                >
                                                    Install {selectedTemplate.requiresTool}
                                                    <Icon name="open_in_new" className="text-[14px]" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Project Name */}
                            {!selectedTemplate.manualSetupMessage && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Project Name
                                        </label>
                                        <input
                                            type="text"
                                            value={projectName}
                                            onChange={(e) => setProjectName(e.target.value)}
                                            placeholder="my-awesome-project"
                                            className="w-full px-4 py-2.5 bg-surface border border-border-dim rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 font-mono text-sm"
                                        />
                                    </div>

                                    {/* Parent Directory */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Parent Directory
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={parentPath}
                                                readOnly
                                                placeholder="Select a folder..."
                                                className="flex-1 px-4 py-2.5 bg-surface border border-border-dim rounded-lg text-white placeholder-slate-500 font-mono text-sm cursor-pointer"
                                                onClick={handleSelectFolder}
                                            />
                                            <button
                                                onClick={handleSelectFolder}
                                                className="px-4 py-2.5 bg-surface border border-border-dim rounded-lg text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
                                            >
                                                <Icon name="folder_open" className="text-[20px]" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Command Preview */}
                                    {selectedTemplate.command && projectName && (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Command to Run
                                            </label>
                                            <div className="p-3 bg-[#0d0f16] rounded-lg border border-border-dim">
                                                <code className="text-xs text-emerald-400 font-mono">
                                                    {selectedTemplate.command.replace('{name}', projectName)}
                                                </code>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400">
                                    {error}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {step === 'configure' && selectedTemplate && (
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-dim">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        {selectedTemplate.manualSetupMessage ? (
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                Got it
                            </button>
                        ) : (
                            <button
                                onClick={handleCreateProject}
                                disabled={isCreating || !projectName.trim() || !parentPath || toolInstalled === false}
                                className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isCreating ? (
                                    <>
                                        <Icon name="progress_activity" className="text-[18px] animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Icon name="terminal" className="text-[18px]" />
                                        Create Project
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewProjectModal;
