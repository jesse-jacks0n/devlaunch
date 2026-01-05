import React, { useState, useEffect, useRef } from 'react';

interface NotesModalProps {
    isOpen: boolean;
    projectName: string;
    initialNotes: string;
    onSave: (notes: string) => void;
    onClose: () => void;
}

const NotesModal: React.FC<NotesModalProps> = ({
    isOpen,
    projectName,
    initialNotes,
    onSave,
    onClose,
}) => {
    const [notes, setNotes] = useState(initialNotes);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isOpen) {
            setNotes(initialNotes);
            setTimeout(() => textareaRef.current?.focus(), 100);
        }
    }, [isOpen, initialNotes]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            return () => document.removeEventListener('keydown', handleEsc);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(notes.trim());
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            handleSave();
        }
    };

    const hasChanges = notes.trim() !== initialNotes.trim();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="modal-dialog w-full max-w-lg bg-background border border-border-dim rounded-xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border-dim bg-surface/50">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[24px] text-primary">note</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Project Notes</h2>
                            <p className="text-xs text-slate-500 font-mono">{projectName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="size-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <textarea
                        ref={textareaRef}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Add notes, reminders, or TODOs for this project..."
                        className="w-full h-48 px-4 py-3 bg-surface border border-border-dim rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 resize-none custom-scrollbar"
                    />
                    <p className="mt-2 text-xs text-slate-500">
                        {notes.length} characters • Supports markdown formatting
                    </p>
                </div>

                {/* Quick Templates */}
                <div className="px-6 pb-4">
                    <p className="text-xs text-slate-500 mb-2">Quick templates:</p>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { label: 'TODO', template: '## TODO\n- [ ] ' },
                            { label: 'Bug', template: '## Bug\n**Issue:** \n**Steps:** \n**Expected:** ' },
                            { label: 'Feature', template: '## Feature\n**Goal:** \n**Notes:** ' },
                        ].map(({ label, template }) => (
                            <button
                                key={label}
                                onClick={() => setNotes(prev => prev + (prev ? '\n\n' : '') + template)}
                                className="px-2 py-1 bg-surface border border-border-dim rounded text-xs text-slate-400 hover:text-white hover:border-primary/50 transition-colors"
                            >
                                + {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border-dim bg-surface/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-600">Press</span>
                        <kbd className="px-1.5 py-0.5 bg-surface border border-border-dim rounded text-[10px] font-mono text-slate-400">Ctrl+Enter</kbd>
                        <span className="text-xs text-slate-600">to save</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!hasChanges}
                            className="btn-primary px-4 py-2 bg-primary hover:bg-primary/80 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[16px]">save</span>
                            Save Notes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotesModal;
