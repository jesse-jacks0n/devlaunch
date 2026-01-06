import React, { useState, useEffect, useRef } from 'react';
import Icon from './Icon';

interface TagsModalProps {
    isOpen: boolean;
    projectName: string;
    currentTags: string[];
    allTags: string[];
    onSave: (tags: string[]) => void;
    onClose: () => void;
}

const TAG_COLORS = [
    { name: 'violet', bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400' },
    { name: 'blue', bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
    { name: 'cyan', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400' },
    { name: 'emerald', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
    { name: 'amber', bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400' },
    { name: 'orange', bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400' },
    { name: 'pink', bg: 'bg-pink-500/10', border: 'border-pink-500/20', text: 'text-pink-400' },
];

const getTagColor = (tag: string) => {
    const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return TAG_COLORS[hash % TAG_COLORS.length];
};

const TagsModal: React.FC<TagsModalProps> = ({
    isOpen,
    projectName,
    currentTags,
    allTags,
    onSave,
    onClose,
}) => {
    const [tags, setTags] = useState<string[]>(currentTags);
    const [newTag, setNewTag] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTags(currentTags);
            setNewTag('');
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, currentTags]);

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

    const handleAddTag = (tag: string) => {
        const trimmed = tag.trim().toLowerCase();
        if (trimmed && !tags.includes(trimmed)) {
            setTags([...tags, trimmed]);
        }
        setNewTag('');
    };

    const handleRemoveTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newTag.trim()) {
            e.preventDefault();
            handleAddTag(newTag);
        } else if (e.key === 'Backspace' && !newTag && tags.length > 0) {
            handleRemoveTag(tags[tags.length - 1]);
        }
    };

    const handleSave = () => {
        onSave(tags);
        onClose();
    };

    // Filter existing tags for suggestions
    const suggestions = allTags.filter(
        tag => !tags.includes(tag) && tag.toLowerCase().includes(newTag.toLowerCase())
    ).slice(0, 5);

    const hasChanges = JSON.stringify(tags.sort()) !== JSON.stringify([...currentTags].sort());

    const presetTags = ['frontend', 'backend', 'fullstack', 'personal', 'work', 'client', 'experiment', 'learning'];
    const availablePresets = presetTags.filter(t => !tags.includes(t));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="modal-dialog w-full max-w-lg bg-background border border-border-dim rounded-xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border-dim bg-surface/50">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <Icon name="label" className="text-[24px] text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Manage Tags</h2>
                            <p className="text-xs text-slate-500 font-mono">{projectName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="size-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                    >
                        <Icon name="close" className="text-[20px]" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Current Tags */}
                    <div className="flex flex-wrap items-center gap-2 min-h-[40px] p-3 bg-surface border border-border-dim rounded-lg">
                        {tags.map(tag => {
                            const color = getTagColor(tag);
                            return (
                                <span
                                    key={tag}
                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${color.bg} ${color.border} ${color.text}`}
                                >
                                    {tag}
                                    <button
                                        onClick={() => handleRemoveTag(tag)}
                                        className="hover:text-white transition-colors"
                                    >
                                        <Icon name="close" className="text-[14px]" />
                                    </button>
                                </span>
                            );
                        })}
                        <input
                            ref={inputRef}
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={tags.length === 0 ? "Type to add tags..." : "Add more..."}
                            className="flex-1 min-w-[100px] bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                        />
                    </div>

                    {/* Suggestions */}
                    {newTag && suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            <span className="text-xs text-slate-500">Suggestions:</span>
                            {suggestions.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => handleAddTag(tag)}
                                    className="px-2 py-1 bg-surface border border-border-dim rounded text-xs text-slate-400 hover:text-white hover:border-primary/50 transition-colors"
                                >
                                    + {tag}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Preset Tags */}
                    {!newTag && availablePresets.length > 0 && (
                        <div>
                            <p className="text-xs text-slate-500 mb-2">Quick add:</p>
                            <div className="flex flex-wrap gap-2">
                                {availablePresets.slice(0, 6).map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => handleAddTag(tag)}
                                        className="px-2 py-1 bg-surface border border-border-dim rounded text-xs text-slate-400 hover:text-white hover:border-primary/50 transition-colors"
                                    >
                                        + {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* All existing tags */}
                    {!newTag && allTags.filter(t => !tags.includes(t)).length > 0 && (
                        <div>
                            <p className="text-xs text-slate-500 mb-2">Existing tags:</p>
                            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto custom-scrollbar">
                                {allTags.filter(t => !tags.includes(t)).map(tag => {
                                    const color = getTagColor(tag);
                                    return (
                                        <button
                                            key={tag}
                                            onClick={() => handleAddTag(tag)}
                                            className={`px-2 py-1 rounded text-xs font-medium border transition-all hover:scale-105 ${color.bg} ${color.border} ${color.text}`}
                                        >
                                            {tag}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border-dim bg-surface/30 flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                        {tags.length} tag{tags.length !== 1 ? 's' : ''} selected
                    </p>
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
                            <Icon name="save" className="text-[16px]" />
                            Save Tags
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TagsModal;
