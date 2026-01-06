use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
};
use tauri_plugin_autostart::MacosLauncher;

// Windows-specific imports for hiding console windows
#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

#[cfg(target_os = "windows")]
const CREATE_NO_WINDOW: u32 = 0x08000000;

/// Creates a Command that won't show a console window on Windows
fn silent_command(program: &str) -> Command {
    let mut cmd = Command::new(program);
    #[cfg(target_os = "windows")]
    cmd.creation_flags(CREATE_NO_WINDOW);
    cmd
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TechStack {
    name: String,
    #[serde(rename = "type")]
    tech_type: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GitStatus {
    branch: String,
    status: String,
    count: Option<i32>,
    #[serde(rename = "type")]
    status_type: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Project {
    id: String,
    name: String,
    path: String,
    icon: String,
    #[serde(rename = "techStack")]
    tech_stack: Vec<TechStack>,
    #[serde(rename = "gitStatus")]
    git_status: GitStatus,
    #[serde(rename = "lastActive")]
    last_active: String,
    storage: String,
    #[serde(rename = "buildStorage")]
    build_storage: Option<String>,
    #[serde(rename = "isArchived")]
    is_archived: Option<bool>,
    #[serde(rename = "hasNodeModules")]
    has_node_modules: bool,
    #[serde(rename = "hasBuildFolder")]
    has_build_folder: bool,
    #[serde(rename = "buildFolderName")]
    build_folder_name: Option<String>,
    #[serde(rename = "packageManager")]
    package_manager: Option<String>,
    #[serde(rename = "projectType")]
    project_type: Option<String>,
    #[serde(rename = "hasGit")]
    has_git: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectScanResult {
    project: Project,
    detected: bool,
}

fn detect_package_manager(project_path: &Path) -> Option<String> {
    if project_path.join("pnpm-lock.yaml").exists() {
        Some("pnpm".to_string())
    } else if project_path.join("yarn.lock").exists() {
        Some("yarn".to_string())
    } else if project_path.join("bun.lockb").exists() {
        Some("bun".to_string())
    } else if project_path.join("package-lock.json").exists() {
        Some("npm".to_string())
    } else if project_path.join("package.json").exists() {
        Some("npm".to_string()) // Default to npm if package.json exists
    } else {
        None
    }
}

fn detect_project_type(project_path: &Path) -> String {
    // Flutter
    if project_path.join("pubspec.yaml").exists() {
        return "flutter".to_string();
    }
    // Android
    if (project_path.join("build.gradle").exists() || project_path.join("build.gradle.kts").exists())
        && project_path.join("app").exists()
    {
        return "android".to_string();
    }
    // Python
    if project_path.join("requirements.txt").exists()
        || project_path.join("pyproject.toml").exists()
        || project_path.join("manage.py").exists()
    {
        return "python".to_string();
    }
    // Rust
    if project_path.join("Cargo.toml").exists() {
        return "rust".to_string();
    }
    // Go
    if project_path.join("go.mod").exists() {
        return "go".to_string();
    }
    // Node.js (check last as it's most common)
    if project_path.join("package.json").exists() {
        return "node".to_string();
    }
    "other".to_string()
}

fn detect_build_folder(project_path: &Path, project_type: &str) -> Option<(String, u64)> {
    // Define build folders for different project types
    let build_folders: Vec<&str> = match project_type {
        "flutter" => vec!["build"],
        "android" => vec!["app/build", "build", ".gradle"],
        "node" => vec!["dist", "build", ".next", ".nuxt", "out", ".output"],
        "python" => vec!["__pycache__", ".pytest_cache", "dist", "build", "*.egg-info", ".venv", "venv"],
        "rust" => vec!["target"],
        "go" => vec!["bin"],
        _ => vec!["build", "dist", "out"],
    };

    for folder in build_folders {
        let folder_path = project_path.join(folder);
        if folder_path.exists() && folder_path.is_dir() {
            let size = get_directory_size(&folder_path);
            if size > 0 {
                return Some((folder.to_string(), size));
            }
        }
    }
    None
}

fn get_cleanable_size(project_path: &Path, project_type: &str) -> u64 {
    let mut total_size = 0u64;

    match project_type {
        "flutter" => {
            // Flutter: build folder
            let build_path = project_path.join("build");
            if build_path.exists() {
                total_size += get_directory_size(&build_path);
            }
        }
        "android" => {
            // Android: build folders and .gradle
            for folder in &["app/build", "build", ".gradle"] {
                let folder_path = project_path.join(folder);
                if folder_path.exists() {
                    total_size += get_directory_size(&folder_path);
                }
            }
        }
        "node" => {
            // Node: node_modules is handled separately, but also check build outputs
            for folder in &["dist", "build", ".next", ".nuxt", "out", ".output"] {
                let folder_path = project_path.join(folder);
                if folder_path.exists() {
                    total_size += get_directory_size(&folder_path);
                }
            }
        }
        "rust" => {
            // Rust: target folder
            let target_path = project_path.join("target");
            if target_path.exists() {
                total_size += get_directory_size(&target_path);
            }
        }
        "python" => {
            // Python: __pycache__, .venv, etc.
            for folder in &["__pycache__", ".pytest_cache", "dist", "build", ".venv", "venv"] {
                let folder_path = project_path.join(folder);
                if folder_path.exists() {
                    total_size += get_directory_size(&folder_path);
                }
            }
        }
        _ => {}
    }

    total_size
}

fn detect_tech_stack(project_path: &Path) -> Vec<TechStack> {
    let mut stack: Vec<TechStack> = Vec::new();

    // Check package.json for dependencies
    let package_json_path = project_path.join("package.json");
    if package_json_path.exists() {
        if let Ok(content) = fs::read_to_string(&package_json_path) {
            if let Ok(json) = serde_json::from_str::<serde_json::Value>(&content) {
                let deps = json.get("dependencies").cloned().unwrap_or(serde_json::Value::Null);
                let dev_deps = json.get("devDependencies").cloned().unwrap_or(serde_json::Value::Null);

                // Check for React Native first (before React)
                if deps.get("react-native").is_some() || dev_deps.get("react-native").is_some() {
                    stack.push(TechStack { name: "React Native".to_string(), tech_type: "blue".to_string() });
                } else if deps.get("react").is_some() || dev_deps.get("react").is_some() {
                    stack.push(TechStack { name: "React".to_string(), tech_type: "default".to_string() });
                }
                
                // Check for Expo
                if deps.get("expo").is_some() || dev_deps.get("expo").is_some() {
                    stack.push(TechStack { name: "Expo".to_string(), tech_type: "default".to_string() });
                }
                
                if deps.get("vue").is_some() || dev_deps.get("vue").is_some() {
                    stack.push(TechStack { name: "Vue".to_string(), tech_type: "green".to_string() });
                }
                if deps.get("next").is_some() || dev_deps.get("next").is_some() {
                    stack.push(TechStack { name: "Next.js".to_string(), tech_type: "default".to_string() });
                }
                if deps.get("nuxt").is_some() || dev_deps.get("nuxt").is_some() {
                    stack.push(TechStack { name: "Nuxt".to_string(), tech_type: "green".to_string() });
                }
                if deps.get("svelte").is_some() || dev_deps.get("svelte").is_some() {
                    stack.push(TechStack { name: "Svelte".to_string(), tech_type: "orange".to_string() });
                }
                if deps.get("express").is_some() {
                    stack.push(TechStack { name: "Express".to_string(), tech_type: "default".to_string() });
                }
                if deps.get("fastify").is_some() {
                    stack.push(TechStack { name: "Fastify".to_string(), tech_type: "default".to_string() });
                }
                if deps.get("@tauri-apps/api").is_some() || dev_deps.get("@tauri-apps/cli").is_some() {
                    stack.push(TechStack { name: "Tauri".to_string(), tech_type: "yellow".to_string() });
                }
                if deps.get("electron").is_some() || dev_deps.get("electron").is_some() {
                    stack.push(TechStack { name: "Electron".to_string(), tech_type: "blue".to_string() });
                }
                if dev_deps.get("vite").is_some() {
                    stack.push(TechStack { name: "Vite".to_string(), tech_type: "purple".to_string() });
                }
                if dev_deps.get("typescript").is_some() {
                    stack.push(TechStack { name: "TypeScript".to_string(), tech_type: "blue".to_string() });
                }
            }
        }

        // Add package manager
        if let Some(pm) = detect_package_manager(project_path) {
            let pm_type = match pm.as_str() {
                "pnpm" => "blue",
                "yarn" => "pink",
                "bun" => "orange",
                _ => "default",
            };
            stack.push(TechStack { name: pm, tech_type: pm_type.to_string() });
        }
    }

    // Check for Flutter
    if project_path.join("pubspec.yaml").exists() {
        stack.push(TechStack { name: "Flutter".to_string(), tech_type: "blue".to_string() });
        stack.push(TechStack { name: "Dart".to_string(), tech_type: "blue".to_string() });
    }

    // Check for Android (Kotlin/Compose)
    if project_path.join("build.gradle.kts").exists() || project_path.join("build.gradle").exists() {
        let gradle_path = if project_path.join("build.gradle.kts").exists() {
            project_path.join("build.gradle.kts")
        } else {
            project_path.join("build.gradle")
        };
        
        if let Ok(content) = fs::read_to_string(&gradle_path) {
            if content.contains("com.android") || project_path.join("app/src/main/AndroidManifest.xml").exists() {
                stack.push(TechStack { name: "Android".to_string(), tech_type: "green".to_string() });
                
                if content.contains("kotlin") || project_path.join("app/src/main/java").exists() == false {
                    stack.push(TechStack { name: "Kotlin".to_string(), tech_type: "purple".to_string() });
                }
                
                if content.contains("compose") {
                    stack.push(TechStack { name: "Compose".to_string(), tech_type: "green".to_string() });
                }
            }
        }
    }

    // Check for Rust/Cargo
    if project_path.join("Cargo.toml").exists() {
        stack.push(TechStack { name: "Rust".to_string(), tech_type: "orange".to_string() });
    }

    // Check for Python frameworks
    if project_path.join("requirements.txt").exists() || project_path.join("pyproject.toml").exists() {
        stack.push(TechStack { name: "Python".to_string(), tech_type: "yellow".to_string() });
        
        // Check for specific Python frameworks
        let req_path = project_path.join("requirements.txt");
        let pyproject_path = project_path.join("pyproject.toml");
        
        let mut framework_content = String::new();
        if let Ok(content) = fs::read_to_string(&req_path) {
            framework_content.push_str(&content);
        }
        if let Ok(content) = fs::read_to_string(&pyproject_path) {
            framework_content.push_str(&content);
        }
        
        let framework_lower = framework_content.to_lowercase();
        if framework_lower.contains("django") || project_path.join("manage.py").exists() {
            stack.push(TechStack { name: "Django".to_string(), tech_type: "green".to_string() });
        }
        if framework_lower.contains("flask") {
            stack.push(TechStack { name: "Flask".to_string(), tech_type: "default".to_string() });
        }
        if framework_lower.contains("fastapi") {
            stack.push(TechStack { name: "FastAPI".to_string(), tech_type: "green".to_string() });
        }
    }

    // Check for Go
    if project_path.join("go.mod").exists() {
        stack.push(TechStack { name: "Go".to_string(), tech_type: "blue".to_string() });
    }

    stack
}

fn get_git_info(project_path: &Path) -> GitStatus {
    let git_dir = project_path.join(".git");
    if !git_dir.exists() {
        return GitStatus {
            branch: "No Git".to_string(),
            status: "N/A".to_string(),
            count: None,
            status_type: "neutral".to_string(),
        };
    }

    // Get current branch
    let branch = silent_command("git")
        .args(["rev-parse", "--abbrev-ref", "HEAD"])
        .current_dir(project_path)
        .output()
        .ok()
        .and_then(|output| {
            if output.status.success() {
                String::from_utf8(output.stdout).ok().map(|s| s.trim().to_string())
            } else {
                None
            }
        })
        .unwrap_or_else(|| "unknown".to_string());

    // Get status
    let status_output = silent_command("git")
        .args(["status", "--porcelain"])
        .current_dir(project_path)
        .output();

    let (status, count, status_type) = match status_output {
        Ok(output) if output.status.success() => {
            let stdout = String::from_utf8_lossy(&output.stdout);
            let changes: Vec<&str> = stdout.lines().collect();
            if changes.is_empty() {
                ("Clean".to_string(), None, "success".to_string())
            } else {
                ("Modified".to_string(), Some(changes.len() as i32), "warning".to_string())
            }
        }
        _ => ("Unknown".to_string(), None, "neutral".to_string()),
    };

    GitStatus {
        branch,
        status,
        count,
        status_type,
    }
}

fn get_directory_size(path: &Path) -> u64 {
    let mut size = 0u64;
    if path.is_dir() {
        if let Ok(entries) = fs::read_dir(path) {
            for entry in entries.flatten() {
                let entry_path = entry.path();
                if entry_path.is_file() {
                    size += entry.metadata().map(|m| m.len()).unwrap_or(0);
                } else if entry_path.is_dir() {
                    // Skip node_modules subdirs for speed, just estimate
                    if entry_path.file_name().map(|n| n == "node_modules").unwrap_or(false) {
                        size += get_directory_size(&entry_path);
                    } else {
                        size += get_directory_size(&entry_path);
                    }
                }
            }
        }
    }
    size
}

fn format_size(bytes: u64) -> String {
    const KB: u64 = 1024;
    const MB: u64 = KB * 1024;
    const GB: u64 = MB * 1024;

    if bytes >= GB {
        format!("{:.1} GB", bytes as f64 / GB as f64)
    } else if bytes >= MB {
        format!("{:.0} MB", bytes as f64 / MB as f64)
    } else if bytes >= KB {
        format!("{:.0} KB", bytes as f64 / KB as f64)
    } else {
        format!("{} B", bytes)
    }
}

fn get_project_icon(tech_stack: &[TechStack], path: &Path) -> String {
    // Determine icon based on tech stack or project type
    // Mobile icons have higher priority
    for tech in tech_stack {
        match tech.name.as_str() {
            "Flutter" | "React Native" | "Expo" => return "phone_iphone".to_string(),
            "Android" | "Kotlin" | "Compose" => return "phone_android".to_string(),
            _ => {}
        }
    }
    
    // Desktop apps
    for tech in tech_stack {
        match tech.name.as_str() {
            "Tauri" | "Electron" => return "desktop_windows".to_string(),
            _ => {}
        }
    }
    
    // Backend/API
    for tech in tech_stack {
        match tech.name.as_str() {
            "Django" | "Flask" | "FastAPI" | "Express" | "Fastify" => return "dns".to_string(),
            _ => {}
        }
    }
    
    // Other frameworks
    for tech in tech_stack {
        match tech.name.as_str() {
            "React" | "Vue" | "Svelte" | "Next.js" | "Nuxt" => return "code".to_string(),
            "Rust" => return "memory".to_string(),
            "Python" => return "data_object".to_string(),
            "Go" => return "speed".to_string(),
            _ => {}
        }
    }

    if path.join("pubspec.yaml").exists() {
        "phone_iphone".to_string()
    } else if path.join("Cargo.toml").exists() {
        "memory".to_string()
    } else if path.join("package.json").exists() {
        "code".to_string()
    } else if path.join("requirements.txt").exists() || path.join("manage.py").exists() {
        "data_object".to_string()
    } else {
        "folder".to_string()
    }
}

#[tauri::command]
async fn scan_project(path: String) -> Result<ProjectScanResult, String> {
    let project_path = PathBuf::from(&path);

    if !project_path.exists() {
        return Err("Path does not exist".to_string());
    }

    if !project_path.is_dir() {
        return Err("Path is not a directory".to_string());
    }

    let tech_stack = detect_tech_stack(&project_path);
    let git_status = get_git_info(&project_path);
    let has_node_modules = project_path.join("node_modules").exists();
    let package_manager = detect_package_manager(&project_path);
    let project_type = detect_project_type(&project_path);
    let has_git = project_path.join(".git").exists();

    // Detect build folder
    let (has_build_folder, build_folder_name, build_storage) = 
        if let Some((folder_name, size)) = detect_build_folder(&project_path, &project_type) {
            (true, Some(folder_name), Some(format_size(size)))
        } else {
            (false, None, None)
        };

    // Calculate total project storage (cleanable items)
    let storage = {
        let mut total_size = 0u64;
        
        // node_modules
        if has_node_modules {
            total_size += get_directory_size(&project_path.join("node_modules"));
        }
        
        // Build folders based on project type
        total_size += get_cleanable_size(&project_path, &project_type);
        
        if total_size > 0 {
            format_size(total_size)
        } else {
            "< 1 MB".to_string()
        }
    };

    let project_name = project_path
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("Unknown")
        .to_string();

    let icon = get_project_icon(&tech_stack, &project_path);

    let project = Project {
        id: uuid::Uuid::new_v4().to_string(),
        name: project_name,
        path,
        icon,
        tech_stack,
        git_status,
        last_active: "Just added".to_string(),
        storage,
        build_storage,
        is_archived: Some(false),
        has_node_modules,
        has_build_folder,
        build_folder_name,
        package_manager,
        project_type: Some(project_type),
        has_git,
    };

    Ok(ProjectScanResult {
        project,
        detected: true,
    })
}

#[tauri::command]
async fn open_in_ide(path: String, ide: String) -> Result<(), String> {
    let project_path = path.clone();
    
    // Get potential IDE executables/paths as owned Strings
    #[cfg(target_os = "windows")]
    let ide_options: Vec<String> = match ide.as_str() {
        "vscode" | "code" => {
            let local_app_data = std::env::var("LOCALAPPDATA").unwrap_or_default();
            vec![
                "code".to_string(),
                "code.cmd".to_string(),
                format!("{}\\Microsoft VS Code\\Code.exe", local_app_data),
                format!("{}\\Programs\\Microsoft VS Code\\Code.exe", local_app_data),
                "C:\\Program Files\\Microsoft VS Code\\Code.exe".to_string(),
                "C:\\Program Files (x86)\\Microsoft VS Code\\Code.exe".to_string(),
            ]
        },
        "cursor" => {
            let local_app_data = std::env::var("LOCALAPPDATA").unwrap_or_default();
            vec![
                "cursor".to_string(),
                "cursor.cmd".to_string(),
                format!("{}\\Programs\\cursor\\Cursor.exe", local_app_data),
                format!("{}\\cursor\\Cursor.exe", local_app_data),
            ]
        },
        "webstorm" => vec!["webstorm".to_string(), "webstorm64.exe".to_string()],
        "idea" => vec!["idea".to_string(), "idea64.exe".to_string()],
        "zed" => vec!["zed".to_string()],
        "android-studio" => vec![
            "C:\\Program Files\\Android\\Android Studio\\bin\\studio64.exe".to_string(),
            "C:\\Program Files (x86)\\Android\\Android Studio\\bin\\studio.exe".to_string(),
        ],
        "xcode" => vec![], // Not available on Windows
        _ => vec!["code".to_string()],
    };

    #[cfg(target_os = "macos")]
    let ide_options: Vec<String> = match ide.as_str() {
        "vscode" | "code" => {
            vec![
                "code".to_string(),
                "/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code".to_string(),
                "/usr/local/bin/code".to_string(),
            ]
        },
        "cursor" => {
            vec![
                "cursor".to_string(),
                "/Applications/Cursor.app/Contents/Resources/app/bin/cursor".to_string(),
                "/usr/local/bin/cursor".to_string(),
            ]
        },
        "webstorm" => vec![
            "webstorm".to_string(),
            "/Applications/WebStorm.app/Contents/MacOS/webstorm".to_string(),
        ],
        "idea" => vec![
            "idea".to_string(),
            "/Applications/IntelliJ IDEA.app/Contents/MacOS/idea".to_string(),
            "/Applications/IntelliJ IDEA CE.app/Contents/MacOS/idea".to_string(),
        ],
        "zed" => vec![
            "zed".to_string(),
            "/Applications/Zed.app/Contents/MacOS/zed".to_string(),
        ],
        "android-studio" => vec![
            "/Applications/Android Studio.app/Contents/MacOS/studio".to_string(),
        ],
        "xcode" => vec![
            "xed".to_string(), // Xcode command line tool
        ],
        _ => vec!["code".to_string()],
    };

    #[cfg(target_os = "linux")]
    let ide_options: Vec<String> = match ide.as_str() {
        "vscode" | "code" => vec!["code".to_string()],
        "cursor" => vec!["cursor".to_string()],
        "webstorm" => vec!["webstorm".to_string()],
        "idea" => vec!["idea".to_string()],
        "zed" => vec!["zed".to_string()],
        "android-studio" => vec!["android-studio".to_string(), "studio.sh".to_string()],
        _ => vec!["code".to_string()],
    };

    // Try each possible path/command
    let mut last_error = String::new();
    
    for ide_cmd in &ide_options {
        let is_full_path = if cfg!(target_os = "windows") {
            ide_cmd.contains('\\') || ide_cmd.contains('/')
        } else {
            ide_cmd.starts_with('/')
        };
        
        let result = if is_full_path {
            // It's a full path - check if it exists first
            let path_buf = std::path::PathBuf::from(ide_cmd);
            if path_buf.exists() {
                Command::new(ide_cmd)
                    .arg(&project_path)
                    .spawn()
            } else {
                continue; // Skip non-existent paths
            }
        } else {
            // It's a command name, try to run it
            Command::new(ide_cmd)
                .arg(&project_path)
                .spawn()
        };

        match result {
            Ok(_) => return Ok(()),
            Err(e) => {
                last_error = format!("{}", e);
                continue;
            }
        }
    }

    Err(format!("Failed to open IDE: {}. Make sure the IDE is installed.", last_error))
}

#[tauri::command]
async fn install_dependencies(path: String, package_manager: Option<String>) -> Result<String, String> {
    let project_path = PathBuf::from(&path);
    let pm = package_manager.unwrap_or_else(|| {
        detect_package_manager(&project_path).unwrap_or_else(|| "npm".to_string())
    });

    let install_cmd = match pm.as_str() {
        "yarn" => "yarn",
        "pnpm" => "pnpm",
        "bun" => "bun",
        _ => "npm",
    };

    // Open in a new terminal window so user can see progress
    #[cfg(target_os = "windows")]
    {
        let full_cmd = format!("{} install", install_cmd);
        // Try Windows Terminal first
        let wt_result = Command::new("cmd")
            .args(["/c", "wt", "-d", &path, "cmd", "/k", &full_cmd])
            .spawn();
        
        if wt_result.is_ok() {
            return Ok(format!("Installing dependencies using {}...", pm));
        }
        
        // Fall back to cmd
        Command::new("cmd")
            .args(["/c", "start", "cmd", "/k", &format!("cd /d \"{}\" && {}", path, full_cmd)])
            .spawn()
            .map_err(|e| format!("Failed to run {}: {}", install_cmd, e))?;
    }

    #[cfg(target_os = "macos")]
    {
        let script = format!("cd '{}' && {} install", path, install_cmd);
        Command::new("osascript")
            .args(["-e", &format!("tell app \"Terminal\" to do script \"{}\"", script)])
            .spawn()
            .map_err(|e| format!("Failed to run {}: {}", install_cmd, e))?;
    }

    #[cfg(target_os = "linux")]
    {
        let full_cmd = format!("cd '{}' && {} install; exec bash", path, install_cmd);
        let terminals = [
            ("gnome-terminal", vec!["--", "bash", "-c"]),
            ("konsole", vec!["-e", "bash", "-c"]),
            ("xterm", vec!["-e", "bash", "-c"]),
        ];
        
        let mut success = false;
        for (term, args) in terminals {
            let mut cmd = Command::new(term);
            for arg in &args {
                cmd.arg(arg);
            }
            if cmd.arg(&full_cmd).spawn().is_ok() {
                success = true;
                break;
            }
        }
        
        if !success {
            return Err("No terminal emulator found".to_string());
        }
    }

    Ok(format!("Installing dependencies using {}...", pm))
}

#[tauri::command]
async fn delete_node_modules(path: String) -> Result<String, String> {
    let node_modules_path = PathBuf::from(&path).join("node_modules");

    if !node_modules_path.exists() {
        return Err("node_modules directory does not exist".to_string());
    }

    fs::remove_dir_all(&node_modules_path)
        .map_err(|e| format!("Failed to delete node_modules: {}", e))?;

    Ok("node_modules deleted successfully".to_string())
}

#[tauri::command]
async fn clean_build_folder(path: String, project_type: Option<String>) -> Result<String, String> {
    let project_path = PathBuf::from(&path);
    let ptype = project_type.unwrap_or_else(|| detect_project_type(&project_path));
    
    let folders_to_clean: Vec<&str> = match ptype.as_str() {
        "flutter" => vec!["build", ".dart_tool"],
        "android" => vec!["app/build", "build", ".gradle"],
        "node" => vec!["dist", "build", ".next", ".nuxt", "out", ".output", ".cache"],
        "rust" => vec!["target"],
        "python" => vec!["__pycache__", ".pytest_cache", "dist", "build", ".eggs"],
        "go" => vec!["bin"],
        _ => vec!["build", "dist", "out"],
    };
    
    let mut cleaned_count = 0;
    let mut total_freed = 0u64;
    let mut errors = Vec::new();
    
    for folder in folders_to_clean {
        let folder_path = project_path.join(folder);
        if folder_path.exists() && folder_path.is_dir() {
            let size = get_directory_size(&folder_path);
            match fs::remove_dir_all(&folder_path) {
                Ok(_) => {
                    cleaned_count += 1;
                    total_freed += size;
                }
                Err(e) => {
                    errors.push(format!("{}: {}", folder, e));
                }
            }
        }
    }
    
    // For Python, also clean __pycache__ in subdirectories
    if ptype == "python" {
        if let Ok(entries) = fs::read_dir(&project_path) {
            for entry in entries.flatten() {
                let cache_path = entry.path().join("__pycache__");
                if cache_path.exists() {
                    if let Ok(_) = fs::remove_dir_all(&cache_path) {
                        cleaned_count += 1;
                    }
                }
            }
        }
    }
    
    if cleaned_count > 0 {
        let freed_str = format_size(total_freed);
        if errors.is_empty() {
            Ok(format!("Cleaned {} folder(s), freed {}", cleaned_count, freed_str))
        } else {
            Ok(format!("Cleaned {} folder(s), freed {}. Errors: {}", cleaned_count, freed_str, errors.join(", ")))
        }
    } else if !errors.is_empty() {
        Err(format!("Failed to clean: {}", errors.join(", ")))
    } else {
        Ok("No build folders to clean".to_string())
    }
}

#[tauri::command]
async fn reveal_in_explorer(path: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        Command::new("explorer")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open explorer: {}", e))?;
    }

    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open Finder: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open file manager: {}", e))?;
    }

    Ok(())
}

#[tauri::command]
async fn get_node_modules_size(path: String) -> Result<String, String> {
    let node_modules_path = PathBuf::from(&path).join("node_modules");

    if !node_modules_path.exists() {
        return Ok("0 B".to_string());
    }

    let size = get_directory_size(&node_modules_path);
    Ok(format_size(size))
}

#[tauri::command]
fn get_projects_from_storage() -> Vec<Project> {
    // This would typically load from a local file, but we'll handle this in the frontend
    Vec::new()
}

// ============ NEW COMMANDS ============

#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectScript {
    name: String,
    command: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HealthStatus {
    #[serde(rename = "outdatedCount")]
    outdated_count: i32,
    vulnerabilities: Vulnerabilities,
    #[serde(rename = "lastChecked")]
    last_checked: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Vulnerabilities {
    low: i32,
    moderate: i32,
    high: i32,
    critical: i32,
}

#[tauri::command]
async fn open_terminal(path: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        // Try Windows Terminal first
        let wt_result = Command::new("cmd")
            .args(["/c", "wt", "-d", &path])
            .spawn();
        
        if wt_result.is_ok() {
            return Ok(());
        }
        
        // Fall back to cmd
        Command::new("cmd")
            .args(["/c", "start", "cmd", "/k", &format!("cd /d \"{}\"", path)])
            .spawn()
            .map_err(|e| format!("Failed to open terminal: {}", e))?;
    }

    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg("-a")
            .arg("Terminal")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open terminal: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        // Try common terminal emulators
        let terminals = ["gnome-terminal", "konsole", "xterm"];
        for term in terminals {
            if Command::new(term)
                .arg("--working-directory")
                .arg(&path)
                .spawn()
                .is_ok()
            {
                return Ok(());
            }
        }
        return Err("No terminal emulator found".to_string());
    }

    Ok(())
}

#[tauri::command]
async fn get_scripts(path: String) -> Result<Vec<ProjectScript>, String> {
    let package_json_path = PathBuf::from(&path).join("package.json");
    
    if !package_json_path.exists() {
        return Ok(Vec::new());
    }

    let content = fs::read_to_string(&package_json_path)
        .map_err(|e| format!("Failed to read package.json: {}", e))?;
    
    let json: serde_json::Value = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse package.json: {}", e))?;

    let scripts = json.get("scripts")
        .and_then(|s| s.as_object())
        .map(|s| {
            s.iter()
                .map(|(name, cmd)| ProjectScript {
                    name: name.clone(),
                    command: cmd.as_str().unwrap_or("").to_string(),
                })
                .collect()
        })
        .unwrap_or_default();

    Ok(scripts)
}

#[tauri::command]
async fn run_script(path: String, script_name: String, package_manager: Option<String>) -> Result<String, String> {
    let project_path = PathBuf::from(&path);
    let pm = package_manager.unwrap_or_else(|| {
        detect_package_manager(&project_path).unwrap_or_else(|| "npm".to_string())
    });

    let full_script_cmd = match pm.as_str() {
        "yarn" => format!("yarn {}", script_name),
        "pnpm" => format!("pnpm run {}", script_name),
        "bun" => format!("bun run {}", script_name),
        _ => format!("npm run {}", script_name),
    };

    // Open in a new terminal window so user can see output
    #[cfg(target_os = "windows")]
    {
        // Try Windows Terminal first
        let wt_result = Command::new("cmd")
            .args(["/c", "wt", "-d", &path, "cmd", "/k", &full_script_cmd])
            .spawn();
        
        if wt_result.is_ok() {
            return Ok(format!("Running {}...", full_script_cmd));
        }
        
        // Fall back to cmd
        Command::new("cmd")
            .args(["/c", "start", "cmd", "/k", &format!("cd /d \"{}\" && {}", path, full_script_cmd)])
            .spawn()
            .map_err(|e| format!("Failed to run script: {}", e))?;
    }

    #[cfg(target_os = "macos")]
    {
        let script = format!("cd '{}' && {}", path, full_script_cmd);
        Command::new("osascript")
            .args(["-e", &format!("tell app \"Terminal\" to do script \"{}\"", script)])
            .spawn()
            .map_err(|e| format!("Failed to run script: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        let full_cmd = format!("cd '{}' && {}; exec bash", path, full_script_cmd);
        let terminals = [
            ("gnome-terminal", vec!["--", "bash", "-c"]),
            ("konsole", vec!["-e", "bash", "-c"]),
            ("xterm", vec!["-e", "bash", "-c"]),
        ];
        
        let mut success = false;
        for (term, args) in terminals {
            let mut cmd = Command::new(term);
            for arg in &args {
                cmd.arg(arg);
            }
            if cmd.arg(&full_cmd).spawn().is_ok() {
                success = true;
                break;
            }
        }
        
        if !success {
            return Err("No terminal emulator found".to_string());
        }
    }

    Ok(format!("Running {}...", full_script_cmd))
}

#[tauri::command]
async fn git_pull(path: String) -> Result<String, String> {
    let output = silent_command("git")
        .args(["pull"])
        .current_dir(&path)
        .output()
        .map_err(|e| format!("Failed to run git pull: {}", e))?;

    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout);
        Ok(stdout.to_string())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("Git pull failed: {}", stderr))
    }
}

#[tauri::command]
async fn git_fetch(path: String) -> Result<String, String> {
    let output = silent_command("git")
        .args(["fetch", "--all"])
        .current_dir(&path)
        .output()
        .map_err(|e| format!("Failed to run git fetch: {}", e))?;

    if output.status.success() {
        Ok("Fetch completed successfully".to_string())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("Git fetch failed: {}", stderr))
    }
}

#[tauri::command]
async fn git_status_detailed(path: String) -> Result<GitStatus, String> {
    Ok(get_git_info(Path::new(&path)))
}

#[tauri::command]
async fn check_health(path: String) -> Result<HealthStatus, String> {
    let project_path = PathBuf::from(&path);
    let pm = detect_package_manager(&project_path).unwrap_or_else(|| "npm".to_string());
    
    // Check for outdated packages
    let outdated_output = silent_command(&pm)
        .args(["outdated", "--json"])
        .current_dir(&path)
        .output();

    let outdated_count = outdated_output
        .ok()
        .and_then(|o| {
            let stdout = String::from_utf8_lossy(&o.stdout);
            serde_json::from_str::<serde_json::Value>(&stdout).ok()
        })
        .and_then(|json| json.as_object().map(|o| o.len() as i32))
        .unwrap_or(0);

    // Run npm audit for vulnerabilities
    let audit_output = silent_command("npm")
        .args(["audit", "--json"])
        .current_dir(&path)
        .output();

    let vulnerabilities = audit_output
        .ok()
        .and_then(|o| {
            let stdout = String::from_utf8_lossy(&o.stdout);
            serde_json::from_str::<serde_json::Value>(&stdout).ok()
        })
        .and_then(|json| {
            json.get("metadata")
                .and_then(|m| m.get("vulnerabilities"))
                .map(|v| Vulnerabilities {
                    low: v.get("low").and_then(|x| x.as_i64()).unwrap_or(0) as i32,
                    moderate: v.get("moderate").and_then(|x| x.as_i64()).unwrap_or(0) as i32,
                    high: v.get("high").and_then(|x| x.as_i64()).unwrap_or(0) as i32,
                    critical: v.get("critical").and_then(|x| x.as_i64()).unwrap_or(0) as i32,
                })
        })
        .unwrap_or(Vulnerabilities {
            low: 0,
            moderate: 0,
            high: 0,
            critical: 0,
        });

    Ok(HealthStatus {
        outdated_count,
        vulnerabilities,
        last_checked: Some(chrono::Local::now().format("%Y-%m-%d %H:%M").to_string()),
    })
}

#[tauri::command]
async fn create_project_from_template(path: String, template: String, project_name: String) -> Result<String, String> {
    let full_path = PathBuf::from(&path).join(&project_name);
    
    let (cmd, args): (&str, Vec<String>) = match template.as_str() {
        "vite-react" => ("npm", vec!["create".to_string(), "vite@latest".to_string(), project_name.clone(), "--".to_string(), "--template".to_string(), "react-ts".to_string()]),
        "vite-vue" => ("npm", vec!["create".to_string(), "vite@latest".to_string(), project_name.clone(), "--".to_string(), "--template".to_string(), "vue-ts".to_string()]),
        "nextjs" => ("npx", vec!["create-next-app@latest".to_string(), project_name.clone(), "--typescript".to_string(), "--eslint".to_string(), "--app".to_string()]),
        "nuxt" => ("npx", vec!["nuxi@latest".to_string(), "init".to_string(), project_name.clone()]),
        "express" => ("npx", vec!["express-generator".to_string(), project_name.clone()]),
        "tauri" => ("npm", vec!["create".to_string(), "tauri-app@latest".to_string(), project_name.clone()]),
        _ => return Err(format!("Unknown template: {}", template)),
    };

    // Project creation needs to show the terminal for user interaction
    let output = Command::new(cmd)
        .args(&args)
        .current_dir(&path)
        .output()
        .map_err(|e| format!("Failed to create project: {}", e))?;

    if output.status.success() || full_path.exists() {
        Ok(full_path.to_string_lossy().to_string())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("Project creation failed: {}", stderr))
    }
}

#[tauri::command]
async fn bulk_delete_node_modules(paths: Vec<String>) -> Result<Vec<String>, String> {
    let mut results = Vec::new();
    
    for path in paths {
        let node_modules_path = PathBuf::from(&path).join("node_modules");
        if node_modules_path.exists() {
            match fs::remove_dir_all(&node_modules_path) {
                Ok(_) => results.push(format!("✓ {}", path)),
                Err(e) => results.push(format!("✗ {}: {}", path, e)),
            }
        }
    }
    
    Ok(results)
}

// ============ TOOL VERSION DETECTION ============

#[derive(Debug, Serialize, Deserialize)]
pub struct ToolVersion {
    name: String,
    version: Option<String>,
    installed: bool,
    icon: String,
}

fn get_command_version(cmd: &str, args: &[&str]) -> Option<String> {
    silent_command(cmd)
        .args(args)
        .output()
        .ok()
        .and_then(|output| {
            if output.status.success() {
                let stdout = String::from_utf8_lossy(&output.stdout);
                let stderr = String::from_utf8_lossy(&output.stderr);
                // Some tools output version to stderr
                let version_str = if stdout.trim().is_empty() { stderr } else { stdout };
                // Extract version number (common patterns)
                let version = version_str
                    .lines()
                    .next()
                    .map(|line| {
                        // Remove common prefixes and extract version
                        line.replace("node ", "")
                            .replace("v", "")
                            .replace("Python ", "")
                            .replace("java ", "")
                            .replace("Flutter ", "")
                            .replace("Dart SDK version: ", "")
                            .replace("rustc ", "")
                            .replace("cargo ", "")
                            .split_whitespace()
                            .next()
                            .unwrap_or("")
                            .to_string()
                    })
                    .filter(|v| !v.is_empty());
                version
            } else {
                None
            }
        })
}

#[tauri::command]
async fn get_tool_versions() -> Vec<ToolVersion> {
    let mut tools = Vec::new();
    
    // Node.js
    let node_version = get_command_version("node", &["--version"]);
    tools.push(ToolVersion {
        name: "Node.js".to_string(),
        version: node_version.clone(),
        installed: node_version.is_some(),
        icon: "javascript".to_string(),
    });
    
    // Python
    let python_version = get_command_version("python", &["--version"])
        .or_else(|| get_command_version("python3", &["--version"]));
    tools.push(ToolVersion {
        name: "Python".to_string(),
        version: python_version.clone(),
        installed: python_version.is_some(),
        icon: "code".to_string(),
    });
    
    // Java
    let java_version = silent_command("java")
        .args(["-version"])
        .output()
        .ok()
        .and_then(|output| {
            // Java outputs version to stderr
            let stderr = String::from_utf8_lossy(&output.stderr);
            stderr.lines()
                .next()
                .and_then(|line| {
                    // Extract version from "java version "X.X.X"" or "openjdk version "X.X.X""
                    line.split('"').nth(1).map(|s| s.to_string())
                })
        });
    tools.push(ToolVersion {
        name: "Java".to_string(),
        version: java_version.clone(),
        installed: java_version.is_some(),
        icon: "coffee".to_string(),
    });
    
    // Flutter
    let flutter_version = silent_command("flutter")
        .args(["--version"])
        .output()
        .ok()
        .and_then(|output| {
            if output.status.success() {
                let stdout = String::from_utf8_lossy(&output.stdout);
                stdout.lines()
                    .find(|line| line.starts_with("Flutter"))
                    .and_then(|line| {
                        line.split_whitespace().nth(1).map(|s| s.to_string())
                    })
            } else {
                None
            }
        });
    tools.push(ToolVersion {
        name: "Flutter".to_string(),
        version: flutter_version.clone(),
        installed: flutter_version.is_some(),
        icon: "phone_iphone".to_string(),
    });
    
    // Rust/Cargo
    let rust_version = get_command_version("rustc", &["--version"]);
    tools.push(ToolVersion {
        name: "Rust".to_string(),
        version: rust_version.clone(),
        installed: rust_version.is_some(),
        icon: "memory".to_string(),
    });
    
    // Git
    let git_version = get_command_version("git", &["--version"])
        .map(|v| v.replace("git version ", "").split_whitespace().next().unwrap_or("").to_string());
    tools.push(ToolVersion {
        name: "Git".to_string(),
        version: git_version.clone(),
        installed: git_version.is_some(),
        icon: "git".to_string(),
    });
    
    tools
}

#[tauri::command]
async fn create_project_in_terminal(
    parent_path: String,
    project_name: String,
    command: String,
) -> Result<String, String> {
    let full_command = command.replace("{name}", &project_name);
    let project_path = PathBuf::from(&parent_path).join(&project_name);
    
    #[cfg(target_os = "windows")]
    {
        // Try Windows Terminal first
        let wt_result = Command::new("cmd")
            .args(["/c", "wt", "-d", &parent_path, "cmd", "/k", &full_command])
            .spawn();
        
        if wt_result.is_ok() {
            return Ok(project_path.to_string_lossy().to_string());
        }
        
        // Fall back to cmd
        Command::new("cmd")
            .args(["/c", "start", "cmd", "/k", &format!("cd /d \"{}\" && {}", parent_path, full_command)])
            .spawn()
            .map_err(|e| format!("Failed to create project: {}", e))?;
    }

    #[cfg(target_os = "macos")]
    {
        let script = format!("cd '{}' && {}", parent_path, full_command);
        Command::new("osascript")
            .args(["-e", &format!("tell app \"Terminal\" to do script \"{}\"", script)])
            .spawn()
            .map_err(|e| format!("Failed to create project: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        let full_cmd = format!("cd '{}' && {}; exec bash", parent_path, full_command);
        let terminals = [
            ("gnome-terminal", vec!["--", "bash", "-c"]),
            ("konsole", vec!["-e", "bash", "-c"]),
            ("xterm", vec!["-e", "bash", "-c"]),
        ];
        
        let mut success = false;
        for (term, args) in terminals {
            let mut cmd = Command::new(term);
            for arg in &args {
                cmd.arg(arg);
            }
            if cmd.arg(&full_cmd).spawn().is_ok() {
                success = true;
                break;
            }
        }
        
        if !success {
            return Err("No terminal emulator found".to_string());
        }
    }

    Ok(project_path.to_string_lossy().to_string())
}

#[tauri::command]
async fn check_tool_installed(tool: String) -> bool {
    let (cmd, args): (&str, &[&str]) = match tool.as_str() {
        "node" => ("node", &["--version"]),
        "python" => ("python", &["--version"]),
        "flutter" => ("flutter", &["--version"]),
        "java" => ("java", &["-version"]),
        "rust" | "cargo" => ("cargo", &["--version"]),
        "git" => ("git", &["--version"]),
        "android-studio" => {
            #[cfg(target_os = "windows")]
            {
                let paths = [
                    "C:\\Program Files\\Android\\Android Studio\\bin\\studio64.exe",
                    "C:\\Program Files (x86)\\Android\\Android Studio\\bin\\studio.exe",
                ];
                for path in paths {
                    if PathBuf::from(path).exists() {
                        return true;
                    }
                }
                return false;
            }
            #[cfg(target_os = "macos")]
            {
                return PathBuf::from("/Applications/Android Studio.app").exists();
            }
            #[cfg(target_os = "linux")]
            {
                // Check common Linux paths for Android Studio
                let paths = [
                    "/opt/android-studio/bin/studio.sh",
                    "/usr/local/android-studio/bin/studio.sh",
                ];
                for path in paths {
                    if PathBuf::from(path).exists() {
                        return true;
                    }
                }
                // Also try the command
                return Command::new("android-studio")
                    .arg("--version")
                    .output()
                    .map(|o| o.status.success())
                    .unwrap_or(false);
            }
        }
        "xcode" => {
            #[cfg(target_os = "macos")]
            {
                // Check if Xcode is installed via xcode-select
                return Command::new("xcode-select")
                    .args(["-p"])
                    .output()
                    .map(|o| o.status.success())
                    .unwrap_or(false);
            }
            #[cfg(not(target_os = "macos"))]
            {
                return false;
            }
        }
        _ => return false,
    };
    
    Command::new(cmd)
        .args(args)
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false)
}

fn load_projects_for_tray() -> Vec<(String, String, String)> {
    // Load projects from storage for tray menu
    let app_data_dir = dirs::data_dir()
        .map(|p| p.join("com.devlaunch.app"))
        .unwrap_or_else(|| PathBuf::from("."));
    
    let storage_path = app_data_dir.join("projects.json");
    
    if let Ok(content) = fs::read_to_string(&storage_path) {
        if let Ok(projects) = serde_json::from_str::<Vec<serde_json::Value>>(&content) {
            return projects
                .iter()
                .filter(|p| !p.get("isArchived").and_then(|v| v.as_bool()).unwrap_or(false))
                .take(10) // Limit to 10 recent projects
                .filter_map(|p| {
                    let id = p.get("id")?.as_str()?.to_string();
                    let name = p.get("name")?.as_str()?.to_string();
                    let path = p.get("path")?.as_str()?.to_string();
                    Some((id, name, path))
                })
                .collect();
        }
    }
    Vec::new()
}

fn open_project_in_ide_from_tray(path: &str, ide: &str) {
    #[cfg(target_os = "windows")]
    let ide_commands: Vec<(&str, Vec<&str>)> = match ide {
        "cursor" => vec![
            ("cursor", vec![path]),
            ("cursor.cmd", vec![path]),
        ],
        _ => vec![
            ("code", vec![path]),
            ("code.cmd", vec![path]),
        ],
    };

    #[cfg(target_os = "macos")]
    let ide_commands: Vec<(&str, Vec<&str>)> = match ide {
        "cursor" => vec![
            ("cursor", vec![path]),
            ("/Applications/Cursor.app/Contents/Resources/app/bin/cursor", vec![path]),
        ],
        _ => vec![
            ("code", vec![path]),
            ("/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code", vec![path]),
        ],
    };

    #[cfg(target_os = "linux")]
    let ide_commands: Vec<(&str, Vec<&str>)> = match ide {
        "cursor" => vec![
            ("cursor", vec![path]),
        ],
        _ => vec![
            ("code", vec![path]),
        ],
    };
    
    for (cmd, args) in ide_commands {
        if Command::new(cmd)
            .args(&args)
            .spawn()
            .is_ok()
        {
            break;
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec!["--minimized"]),
        ))
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // Build tray menu
            let projects = load_projects_for_tray();
            
            let quit = MenuItem::with_id(app, "quit", "Quit DevLaunch", true, None::<&str>)?;
            let show = MenuItem::with_id(app, "show", "Show Window", true, None::<&str>)?;
            let separator = PredefinedMenuItem::separator(app)?;
            let header = MenuItem::with_id(app, "header", "── Quick Open ──", false, None::<&str>)?;
            let sep1 = PredefinedMenuItem::separator(app)?;
            
            // Build menu based on projects
            let menu = if projects.is_empty() {
                let no_projects = MenuItem::with_id(app, "no_projects", "No projects yet", false, None::<&str>)?;
                Menu::with_items(app, &[
                    &header,
                    &sep1,
                    &no_projects,
                    &separator,
                    &show,
                    &quit,
                ])?
            } else {
                // Create a simple menu with project items (no submenus for simplicity)
                let menu_builder = Menu::new(app)?;
                menu_builder.append(&header)?;
                menu_builder.append(&sep1)?;
                
                for (_id, name, path) in &projects {
                    let item = MenuItem::with_id(
                        app,
                        &format!("open:{}", path),
                        &format!("📁 {}", name),
                        true,
                        None::<&str>,
                    )?;
                    menu_builder.append(&item)?;
                }
                
                menu_builder.append(&separator)?;
                menu_builder.append(&show)?;
                menu_builder.append(&quit)?;
                menu_builder
            };

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .show_menu_on_left_click(true)
                .on_menu_event(|app, event| {
                    let id = event.id.as_ref();
                    
                    if id == "quit" {
                        app.exit(0);
                    } else if id == "show" {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    } else if id.starts_with("open:") {
                        let path = &id[5..];
                        open_project_in_ide_from_tray(path, "code");
                    }
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            scan_project,
            open_in_ide,
            install_dependencies,
            delete_node_modules,
            reveal_in_explorer,
            get_node_modules_size,
            get_projects_from_storage,
            open_terminal,
            get_scripts,
            run_script,
            git_pull,
            git_fetch,
            git_status_detailed,
            check_health,
            create_project_from_template,
            bulk_delete_node_modules,
            get_autostart_status,
            set_autostart,
            get_tool_versions,
            create_project_in_terminal,
            check_tool_installed,
            clean_build_folder,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
async fn get_autostart_status(app: tauri::AppHandle) -> Result<bool, String> {
    use tauri_plugin_autostart::ManagerExt;
    app.autolaunch()
        .is_enabled()
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn set_autostart(app: tauri::AppHandle, enabled: bool) -> Result<(), String> {
    use tauri_plugin_autostart::ManagerExt;
    let autostart = app.autolaunch();
    
    if enabled {
        autostart.enable().map_err(|e| e.to_string())
    } else {
        autostart.disable().map_err(|e| e.to_string())
    }
}
