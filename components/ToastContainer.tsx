import React from 'react';
import { Toast } from '../types';

interface ToastContainerProps {
    toasts: Toast[];
    onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
    const getIcon = (type: Toast['type']) => {
        switch (type) {
            case 'success': return 'check_circle';
            case 'error': return 'error';
            case 'warning': return 'warning';
            default: return 'info';
        }
    };

    const getStyles = (type: Toast['type']) => {
        switch (type) {
            case 'success': return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';
            case 'error': return 'border-red-500/30 bg-red-500/10 text-red-400';
            case 'warning': return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400';
            default: return 'border-primary/30 bg-primary/10 text-primary';
        }
    };

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-12 right-4 z-50 flex flex-col gap-2 max-w-sm">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded border backdrop-blur-md animate-slide-in ${getStyles(toast.type)}`}
                >
                    <span className={`material-symbols-outlined text-[20px]`}>
                        {getIcon(toast.type)}
                    </span>
                    <p className="text-sm flex-1">{toast.message}</p>
                    <button
                        onClick={() => onRemove(toast.id)}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
