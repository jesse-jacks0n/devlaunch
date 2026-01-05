import React from 'react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'danger',
    onConfirm,
    onCancel,
}) => {
    if (!isOpen) return null;

    const getVariantStyles = () => {
        switch (variant) {
            case 'danger': return {
                iconBg: 'bg-red-500/10',
                iconColor: 'text-red-400',
                buttonBg: 'bg-red-500 hover:bg-red-600',
            };
            case 'warning': return {
                iconBg: 'bg-yellow-500/10',
                iconColor: 'text-yellow-400',
                buttonBg: 'bg-yellow-500 hover:bg-yellow-600',
            };
            default: return {
                iconBg: 'bg-primary/10',
                iconColor: 'text-primary',
                buttonBg: 'bg-primary hover:bg-primary/80',
            };
        }
    };

    const styles = getVariantStyles();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Dialog */}
            <div className="modal-dialog relative bg-surface border border-border-dim rounded-lg shadow-2xl w-full max-w-md mx-4 animate-scale-in">
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`size-10 rounded-full ${styles.iconBg} flex items-center justify-center shrink-0`}>
                            <span className={`material-symbols-outlined ${styles.iconColor}`}>
                                {variant === 'danger' ? 'delete_forever' : variant === 'warning' ? 'warning' : 'info'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-white">{title}</h3>
                            <p className="text-sm text-slate-400 mt-1 whitespace-pre-line">{message}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-dim bg-surface-highlight/50 rounded-b-lg">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded transition-colors"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`btn-primary px-4 py-2 text-sm font-medium text-white rounded transition-colors ${styles.buttonBg}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
