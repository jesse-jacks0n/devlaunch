import React from 'react';
import {
    FolderOpen, Activity, PieChart, Settings, HelpCircle, Sun, Moon,
    X, Tag, Save, Monitor, Folder, HardDrive, Package, Code,
    ChartPie, CircleDot, Archive, Database, Check, Star, FileText,
    GitBranch, ArrowUp, ExternalLink, MoreVertical, Pencil, Terminal,
    Play, Download, Trash2, Shield, Sparkles, CloudDownload, RefreshCw,
    Eye, EyeOff, MinusCircle, ArrowLeft, Calendar, CalendarDays,
    History, Plus, Search, Grid, List, ChevronDown, FolderX, Cpu,
    Loader2, Info, AlertTriangle, CheckCircle, XCircle, PlusCircle,
    Clock, Palette, SlidersHorizontal, User, Boxes, SearchX, FileCode,
    ArchiveRestore, CheckSquare, Smartphone, Server, Zap, Globe,
    Coffee, GitBranch as Git, FileJson, Braces, Pin, PinOff, Hexagon,
    GitCommitHorizontal
} from 'lucide-react';

// Custom SVG Icons for programming languages/tools
const NodeJsIcon: React.FC<{ className?: string; size?: number }> = ({ className, size = 20 }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor">
        <path d="M12 1.85c-.27 0-.55.07-.78.2l-7.44 4.3c-.48.28-.78.8-.78 1.36v8.58c0 .56.3 1.08.78 1.36l1.95 1.12c.95.46 1.27.46 1.71.46 1.4 0 2.21-.85 2.21-2.33V8.44c0-.12-.1-.22-.22-.22H8.5c-.13 0-.23.1-.23.22v8.47c0 .66-.68 1.31-1.77.76L4.45 16.5a.26.26 0 0 1-.12-.21V7.71c0-.09.04-.17.12-.21l7.44-4.29c.08-.05.18-.05.25 0l7.44 4.29c.07.04.11.12.11.21v8.58c0 .08-.04.16-.11.21l-7.44 4.29a.24.24 0 0 1-.26 0L10 19.65c-.06-.03-.14-.05-.2-.02-.55.24-.66.27-1.17.41-.13.04-.32.1.07.29l2.48 1.47c.24.13.5.2.78.2.27 0 .54-.07.78-.2l7.44-4.29c.48-.28.78-.8.78-1.36V7.71c0-.56-.3-1.08-.78-1.36l-7.44-4.3c-.23-.13-.5-.2-.78-.2zm2.18 5.53c-2.14 0-3.46.9-3.46 2.42 0 1.64 1.28 2.09 3.36 2.29 2.5.24 2.69.6 2.69 1.08 0 .83-.67 1.18-2.24 1.18-1.98 0-2.41-.49-2.56-1.47a.22.22 0 0 0-.22-.19h-.93c-.12 0-.22.1-.22.22 0 1.28.7 2.81 3.93 2.81 2.35 0 3.7-.93 3.7-2.55 0-1.61-1.1-2.04-3.4-2.34-2.33-.31-2.57-.46-2.57-1.01 0-.45.2-1.05 1.92-1.05 1.54 0 2.11.33 2.35 1.37.02.1.11.18.22.18h.93c.06 0 .12-.03.16-.08.04-.05.06-.11.05-.17-.15-1.74-1.32-2.55-3.71-2.55z" />
    </svg>
);

const PythonIcon: React.FC<{ className?: string; size?: number }> = ({ className, size = 20 }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor">
        <path d="M11.914 0C5.82 0 6.2 2.656 6.2 2.656l.007 2.752h5.814v.826H3.9S0 5.789 0 11.969c0 6.18 3.403 5.96 3.403 5.96h2.03v-2.867s-.109-3.42 3.35-3.42h5.766s3.24.052 3.24-3.148V3.202S18.28 0 11.913 0zM8.708 1.85c.578 0 1.046.47 1.046 1.052 0 .581-.468 1.051-1.046 1.051-.578 0-1.046-.47-1.046-1.051 0-.582.468-1.052 1.046-1.052z" />
        <path d="M12.087 24c6.093 0 5.713-2.656 5.713-2.656l-.007-2.752h-5.814v-.826h8.121s3.9.445 3.9-5.735c0-6.18-3.403-5.96-3.403-5.96h-2.03v2.867s.109 3.42-3.35 3.42H9.451s-3.24-.052-3.24 3.148v5.292S5.72 24 12.087 24zm3.206-1.85c-.578 0-1.046-.47-1.046-1.052 0-.581.468-1.051 1.046-1.051.578 0 1.046.47 1.046 1.051 0 .582-.468 1.052-1.046 1.052z" />
    </svg>
);

const JavaIcon: React.FC<{ className?: string; size?: number }> = ({ className, size = 20 }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor">
        <path d="M8.851 18.56s-.917.534.653.714c1.902.218 2.874.187 4.969-.211 0 0 .552.346 1.321.646-4.699 2.013-10.633-.118-6.943-1.149M8.276 15.933s-1.028.761.542.924c2.032.209 3.636.227 6.413-.308 0 0 .384.389.987.602-5.679 1.661-12.007.13-7.942-1.218M13.116 11.475c1.158 1.333-.304 2.533-.304 2.533s2.939-1.518 1.589-3.418c-1.261-1.772-2.228-2.652 3.007-5.688 0-.001-8.216 2.051-4.292 6.573M19.33 20.504s.679.559-.747.991c-2.712.822-11.288 1.069-13.669.033-.856-.373.75-.89 1.254-.998.527-.114.828-.93.828-.093-953-.671-6.156 1.317-2.643 1.887 9.58 1.553 17.462-.7 14.977-1.82M9.292 13.21s-4.362 1.036-1.544 1.412c1.189.159 3.561.123 5.77-.062 1.806-.152 3.618-.477 3.618-.477s-.637.272-1.098.587c-4.429 1.165-12.986.623-10.522-.568 2.082-1.006 3.776-.892 3.776-.892M17.116 17.584c4.503-2.34 2.421-4.589.968-4.285-.355.074-.515.138-.515.138s.132-.207.385-.297c2.875-1.011 5.086 2.981-.928 4.562 0-.001.07-.062.09-.118M14.401 0s2.494 2.494-2.365 6.33c-3.896 3.077-.888 4.832-.001 6.836-2.274-2.053-3.943-3.858-2.824-5.539 1.644-2.469 6.197-3.665 5.19-7.627M9.734 23.924c4.322.277 10.959-.153 11.116-2.198 0 0-.302.775-3.572 1.391-3.688.694-8.239.613-10.937.168 0-.001.553.457 3.393.639" />
    </svg>
);

const FlutterIcon: React.FC<{ className?: string; size?: number }> = ({ className, size = 20 }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor">
        <path d="M14.314 0L2.3 12 6 15.7 21.684.013h-7.357L14.314 0zm.014 11.072L7.857 17.53l6.47 6.47H21.7l-6.46-6.468 6.46-6.46h-7.37z" />
    </svg>
);

const RustIcon: React.FC<{ className?: string; size?: number }> = ({ className, size = 20 }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor">
        <path d="M23.687 11.709l-.995-.616a13.559 13.559 0 0 0-.028-.29l.855-.797a.344.344 0 0 0-.114-.571l-1.093-.409a8.392 8.392 0 0 0-.086-.282l.682-.947a.344.344 0 0 0-.208-.536l-1.152-.222a7.544 7.544 0 0 0-.14-.264l.477-1.063a.344.344 0 0 0-.294-.477l-1.167-.027a9.633 9.633 0 0 0-.186-.236l.251-1.135a.344.344 0 0 0-.37-.397l-1.137.173a8.757 8.757 0 0 0-.225-.197l.012-1.162a.344.344 0 0 0-.432-.296l-1.064.367a7.212 7.212 0 0 0-.257-.144l-.23-1.138a.344.344 0 0 0-.48-.18l-.95.55a9.755 9.755 0 0 0-.282-.09l-.462-1.066a.344.344 0 0 0-.512-.062l-.805.704a6.47 6.47 0 0 0-.29-.026l-.67-.944a.344.344 0 0 0-.52.062l-.63.826a9.62 9.62 0 0 0-.29.035l-.853-.755a.344.344 0 0 0-.507.142l-.431.94a7.63 7.63 0 0 0-.282.097l-1.004-.527a.344.344 0 0 0-.471.217l-.216 1.014a6.47 6.47 0 0 0-.26.158l-1.107-.269a.344.344 0 0 0-.413.282l.003 1.038a8.084 8.084 0 0 0-.228.213l-1.164.006a.344.344 0 0 0-.333.335l.216 1.018a9.13 9.13 0 0 0-.185.26l-1.166.284a.344.344 0 0 0-.235.373l.422.961a6.238 6.238 0 0 0-.132.295l-1.114.555a.344.344 0 0 0-.122.395l.61.864a7.537 7.537 0 0 0-.073.318l-1.006.81a.344.344 0 0 0 0 .399l.783.778a7.212 7.212 0 0 0-.015.327l-.848 1.042a.344.344 0 0 0 .122.495l.93.49a9.62 9.62 0 0 0 .045.323l-.644 1.238a.344.344 0 0 0 .235.482l1.04.194a8.084 8.084 0 0 0 .104.308l-.404 1.39a.344.344 0 0 0 .333.438l1.103-.113a7.63 7.63 0 0 0 .16.282l-.14 1.485a.344.344 0 0 0 .413.365l1.11-.418a6.47 6.47 0 0 0 .21.244l.14 1.521a.344.344 0 0 0 .471.273l1.066-.703a9.755 9.755 0 0 0 .254.192l.414 1.487a.344.344 0 0 0 .512.163l.97-.958a9.62 9.62 0 0 0 .29.126l.66 1.388a.344.344 0 0 0 .52.034l.824-1.167a7.212 7.212 0 0 0 .316.046l.876 1.216a.344.344 0 0 0 .507-.086l.639-1.326a6.47 6.47 0 0 0 .332-.044l1.053.975a.344.344 0 0 0 .48-.19l.424-1.426a9.755 9.755 0 0 0 .338-.11l1.186.669a.344.344 0 0 0 .432-.296l.18-1.476a7.63 7.63 0 0 0 .329-.184l1.267.324a.344.344 0 0 0 .37-.397l-.07-1.472a8.757 8.757 0 0 0 .304-.261l1.291-.063a.344.344 0 0 0 .294-.477l-.32-1.407a7.544 7.544 0 0 0 .262-.337l1.258-.437a.344.344 0 0 0 .208-.536l-.558-1.276a8.392 8.392 0 0 0 .203-.405l1.166-.788a.344.344 0 0 0 .114-.571l-.772-1.086a13.559 13.559 0 0 0 .128-.459l1.018-1.108a.344.344 0 0 0-.001-.478l-.958-.934a13.546 13.546 0 0 0 .042-.477l.816-1.387a.344.344 0 0 0-.114-.479zM12 18.508c-3.594 0-6.508-2.914-6.508-6.508 0-3.594 2.914-6.508 6.508-6.508 3.594 0 6.508 2.914 6.508 6.508 0 3.594-2.914 6.508-6.508 6.508z" />
    </svg>
);

const GitIconCustom: React.FC<{ className?: string; size?: number }> = ({ className, size = 20 }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor">
        <path d="M23.546 10.93L13.067.452a1.55 1.55 0 0 0-2.188 0L8.708 2.627l2.76 2.76a1.838 1.838 0 0 1 2.327 2.341l2.658 2.66a1.838 1.838 0 0 1 1.9 3.039 1.837 1.837 0 0 1-2.6 0 1.846 1.846 0 0 1-.404-1.996L12.86 8.955v6.525a1.844 1.844 0 0 1 .5.344 1.844 1.844 0 0 1 0 2.603 1.843 1.843 0 0 1-2.609 0 1.843 1.843 0 0 1 0-2.603c.179-.18.387-.316.614-.406V8.835a1.834 1.834 0 0 1-.614-.406 1.848 1.848 0 0 1-.404-2.002L7.654 3.752.452 10.93a1.551 1.551 0 0 0 0 2.188l10.48 10.477a1.545 1.545 0 0 0 2.186 0l10.428-10.477a1.545 1.545 0 0 0 0-2.187z" />
    </svg>
);

// Map of Material Symbols names to Lucide icons
const iconMap: Record<string, React.FC<{ className?: string; size?: number }>> = {
    // Navigation
    'folder_open': FolderOpen,
    'monitoring': Activity,
    'pie_chart': PieChart,
    'settings': Settings,
    'help': HelpCircle,
    'light_mode': Sun,
    'dark_mode': Moon,

    // Actions
    'close': X,
    'label': Tag,
    'save': Save,
    'check': Check,
    'star': Star,
    'note': FileText,
    'edit': Pencil,
    'terminal': Terminal,
    'pin': Pin,
    'pin_off': PinOff,
    'star_outline': Star,
    'play_arrow': Play,
    'download': Download,
    'cloud_download': CloudDownload,
    'delete_sweep': Trash2,
    'health_and_safety': Shield,
    'cleaning_services': Sparkles,
    'refresh': RefreshCw,
    'remove_circle': MinusCircle,
    'add': Plus,
    'add_circle': PlusCircle,
    'search': Search,
    'arrow_back': ArrowLeft,
    'arrow_upward': ArrowUp,
    'open_in_new': ExternalLink,
    'more_vert': MoreVertical,
    'expand_more': ChevronDown,

    // Status
    'check_circle': CheckCircle,
    'error': XCircle,
    'info': Info,
    'warning': AlertTriangle,
    'progress_activity': Loader2,

    // Views
    'list': List,
    'grid_view': Grid,

    // Files & Folders
    'folder': Folder,
    'folder_off': FolderX,
    'hard_drive': HardDrive,
    'inventory_2': Package,
    'inventory': Archive,
    'storage': Database,
    'code': Code,
    'code_off': FileCode,

    // Data & Charts
    'donut_large': CircleDot,

    // Git
    'call_split': GitBranch,

    // Time
    'today': Calendar,
    'date_range': CalendarDays,
    'history': History,
    'schedule': Clock,

    // System
    'desktop_windows': Monitor,
    'memory': Cpu,

    // Settings
    'palette': Palette,
    'tune': SlidersHorizontal,
    'person': User,

    // Visibility
    'visibility': Eye,
    'visibility_off': EyeOff,

    // Search
    'search_off': SearchX,

    // Archive
    'archive': Archive,
    'unarchive': ArchiveRestore,

    // Checkbox
    'check_box': CheckSquare,

    // Packages
    'deployed_code': Boxes,

    // Mobile/Phone
    'phone_iphone': Smartphone,
    'phone_android': Smartphone,
    'smartphone': Smartphone,

    // Backend/Server
    'dns': Server,
    'bolt': Zap,

    // Web
    'web': Globe,
    'language': Globe,

    // Languages/Tools from Rust backend
    'javascript': Braces,
    'coffee': Coffee,
    'git': GitIconCustom,
    'json': FileJson,
    'hexagon': Hexagon,
    'commit': GitCommitHorizontal,

    // Custom tool icons for status bar
    'nodejs': NodeJsIcon,
    'python': PythonIcon,
    'java': JavaIcon,
    'flutter': FlutterIcon,
    'rust': RustIcon,
    'git_logo': GitIconCustom,
};

interface IconProps {
    name: string;
    className?: string;
    size?: number;
    title?: string;
}

export const Icon: React.FC<IconProps> = ({ name, className = '', size, title }) => {
    const IconComponent = iconMap[name];

    if (!IconComponent) {
        console.warn(`Icon "${name}" not found in iconMap`);
        return <span className={className}>?</span>;
    }

    // Parse size from className if not provided directly
    let iconSize = size;
    if (!iconSize) {
        const sizeMatch = className.match(/text-\[(\d+)px\]/);
        if (sizeMatch) {
            iconSize = parseInt(sizeMatch[1], 10);
        } else {
            iconSize = 20; // default size
        }
    }

    // Remove text-[Xpx] from className since we handle size separately
    const cleanClassName = className.replace(/text-\[\d+px\]/g, '').trim();

    return (
        <IconComponent
            className={cleanClassName}
            size={iconSize}
            aria-label={title}
        />
    );
};

export default Icon;
