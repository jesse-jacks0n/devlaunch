// App constants
export const APP_NAME = 'DevLaunch';
export const APP_VERSION = '3.0.1-beta';

// Storage keys
export const STORAGE_KEYS = {
    PROJECTS: 'devlaunch_projects',
    SETTINGS: 'devlaunch_settings',
} as const;

// IDE options
export const IDE_OPTIONS = [
    { value: 'code', label: 'VS Code', command: 'code' },
    { value: 'cursor', label: 'Cursor', command: 'cursor' },
    { value: 'webstorm', label: 'WebStorm', command: 'webstorm' },
    { value: 'idea', label: 'IntelliJ IDEA', command: 'idea' },
    { value: 'zed', label: 'Zed', command: 'zed' },
    { value: 'xcode', label: 'Xcode', command: 'xed', macOnly: true },
    { value: 'android-studio', label: 'Android Studio', command: 'android-studio' },
] as const;

// Tech stack colors
export const TECH_COLORS: Record<string, string> = {
    'React': 'blue',
    'React Native': 'blue',
    'Vue': 'green',
    'Svelte': 'orange',
    'Next.js': 'default',
    'Nuxt': 'green',
    'TypeScript': 'blue',
    'Vite': 'purple',
    'Tauri': 'yellow',
    'Electron': 'blue',
    'Rust': 'orange',
    'Python': 'yellow',
    'Django': 'green',
    'Flask': 'default',
    'FastAPI': 'green',
    'Flutter': 'blue',
    'Dart': 'blue',
    'Kotlin': 'purple',
    'Compose': 'green',
    'Android': 'green',
    'Go': 'blue',
    'Java': 'red',
    'pnpm': 'blue',
    'yarn': 'pink',
    'npm': 'default',
    'bun': 'orange',
} as const;

// Project categories for icons
export const PROJECT_CATEGORIES = {
    MOBILE: ['Flutter', 'React Native', 'Kotlin', 'Compose', 'Android'],
    WEB: ['React', 'Vue', 'Svelte', 'Next.js', 'Nuxt', 'Vite'],
    BACKEND: ['Django', 'Flask', 'FastAPI', 'Express', 'Fastify', 'Go'],
    DESKTOP: ['Tauri', 'Electron'],
} as const;

// Framework templates for project creation
export interface FrameworkTemplate {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'web' | 'mobile' | 'backend' | 'desktop';
    command: string;
    requiresTool?: string;
    toolInstallUrl?: string;
    manualSetupMessage?: string;
    macOnly?: boolean;
}

export const FRAMEWORK_TEMPLATES: FrameworkTemplate[] = [
    // Web Frameworks
    {
        id: 'vite-react',
        name: 'React (Vite)',
        description: 'React with Vite, TypeScript ready',
        icon: 'code',
        category: 'web',
        command: 'npm create vite@latest {name} -- --template react-ts',
        requiresTool: 'node',
    },
    {
        id: 'vite-vue',
        name: 'Vue (Vite)',
        description: 'Vue 3 with Vite and TypeScript',
        icon: 'code',
        category: 'web',
        command: 'npm create vite@latest {name} -- --template vue-ts',
        requiresTool: 'node',
    },
    {
        id: 'vite-svelte',
        name: 'Svelte (Vite)',
        description: 'Svelte with Vite and TypeScript',
        icon: 'code',
        category: 'web',
        command: 'npm create vite@latest {name} -- --template svelte-ts',
        requiresTool: 'node',
    },
    {
        id: 'nextjs',
        name: 'Next.js',
        description: 'React framework with SSR/SSG',
        icon: 'code',
        category: 'web',
        command: 'npx create-next-app@latest {name} --typescript --tailwind --app',
        requiresTool: 'node',
    },
    {
        id: 'nuxt',
        name: 'Nuxt',
        description: 'Vue framework with SSR/SSG',
        icon: 'code',
        category: 'web',
        command: 'npx nuxi@latest init {name}',
        requiresTool: 'node',
    },
    // Mobile Frameworks
    {
        id: 'flutter',
        name: 'Flutter',
        description: 'Cross-platform mobile/web/desktop',
        icon: 'phone_iphone',
        category: 'mobile',
        command: 'flutter create {name}',
        requiresTool: 'flutter',
        toolInstallUrl: 'https://docs.flutter.dev/get-started/install',
    },
    {
        id: 'react-native',
        name: 'React Native',
        description: 'React for mobile apps',
        icon: 'phone_iphone',
        category: 'mobile',
        command: 'npx react-native@latest init {name}',
        requiresTool: 'node',
    },
    {
        id: 'expo',
        name: 'Expo (React Native)',
        description: 'React Native with Expo tooling',
        icon: 'phone_iphone',
        category: 'mobile',
        command: 'npx create-expo-app@latest {name}',
        requiresTool: 'node',
    },
    {
        id: 'android-compose',
        name: 'Android (Compose)',
        description: 'Native Android with Jetpack Compose',
        icon: 'phone_android',
        category: 'mobile',
        manualSetupMessage: 'To create a new Android Compose project, please open Android Studio and select "New Project" > "Empty Compose Activity". Make sure you have Android Studio installed.',
        command: '',
        requiresTool: 'android-studio',
        toolInstallUrl: 'https://developer.android.com/studio',
    },
    {
        id: 'android-kotlin',
        name: 'Android (Kotlin)',
        description: 'Native Android with Kotlin',
        icon: 'phone_android',
        category: 'mobile',
        manualSetupMessage: 'To create a new Android Kotlin project, please open Android Studio and select "New Project" > "Empty Views Activity". Make sure you have Android Studio installed.',
        command: '',
        requiresTool: 'android-studio',
        toolInstallUrl: 'https://developer.android.com/studio',
    },
    {
        id: 'ios-swift',
        name: 'iOS (Swift)',
        description: 'Native iOS app with Swift',
        icon: 'phone_iphone',
        category: 'mobile',
        manualSetupMessage: 'To create a new iOS project, please open Xcode and select "Create New Project" > "App". This requires macOS with Xcode installed.',
        command: '',
        requiresTool: 'xcode',
        toolInstallUrl: 'https://developer.apple.com/xcode/',
        macOnly: true,
    },
    {
        id: 'ios-swiftui',
        name: 'iOS (SwiftUI)',
        description: 'Native iOS with SwiftUI',
        icon: 'phone_iphone',
        category: 'mobile',
        manualSetupMessage: 'To create a new SwiftUI project, please open Xcode and select "Create New Project" > "App" with SwiftUI interface. This requires macOS with Xcode installed.',
        command: '',
        requiresTool: 'xcode',
        toolInstallUrl: 'https://developer.apple.com/xcode/',
        macOnly: true,
    },
    // Backend Frameworks
    {
        id: 'django',
        name: 'Django',
        description: 'Python web framework',
        icon: 'dns',
        category: 'backend',
        command: 'pip install django && django-admin startproject {name}',
        requiresTool: 'python',
        toolInstallUrl: 'https://www.python.org/downloads/',
    },
    {
        id: 'flask',
        name: 'Flask',
        description: 'Lightweight Python web framework',
        icon: 'dns',
        category: 'backend',
        command: 'mkdir {name} && cd {name} && pip install flask && echo from flask import Flask > app.py && echo app = Flask(__name__) >> app.py',
        requiresTool: 'python',
        toolInstallUrl: 'https://www.python.org/downloads/',
    },
    {
        id: 'fastapi',
        name: 'FastAPI',
        description: 'Modern Python API framework',
        icon: 'bolt',
        category: 'backend',
        command: 'mkdir {name} && cd {name} && pip install fastapi uvicorn && echo from fastapi import FastAPI > main.py && echo app = FastAPI() >> main.py',
        requiresTool: 'python',
        toolInstallUrl: 'https://www.python.org/downloads/',
    },
    {
        id: 'express',
        name: 'Express.js',
        description: 'Node.js web framework',
        icon: 'dns',
        category: 'backend',
        command: 'mkdir {name} && cd {name} && npm init -y && npm install express',
        requiresTool: 'node',
    },
    // Desktop
    {
        id: 'tauri',
        name: 'Tauri',
        description: 'Rust-powered desktop apps',
        icon: 'desktop_windows',
        category: 'desktop',
        command: 'npm create tauri-app@latest {name}',
        requiresTool: 'node',
    },
    {
        id: 'electron',
        name: 'Electron',
        description: 'Cross-platform desktop apps',
        icon: 'desktop_windows',
        category: 'desktop',
        command: 'npm init electron-app@latest {name}',
        requiresTool: 'node',
    },
];