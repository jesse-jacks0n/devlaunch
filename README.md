<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# DevLaunch

A fast, opinionated project launcher for developers. Manage all your projects in one place with quick access to IDEs, terminals, and common tasks.

## Features

- 🚀 Quick project launching in your favorite IDE (VS Code, Cursor, WebStorm, Xcode, etc.)
- 📁 Automatic tech stack detection
- 🧹 Clean up node_modules and build folders to save disk space
- 📊 Project statistics and activity tracking
- 🏷️ Tags and notes for organization
- 🔧 Run npm/yarn/pnpm scripts directly
- 🖥️ System tray for quick access
- 🌙 Beautiful dark UI

## Requirements

### Windows

- Windows 10/11
- [Node.js](https://nodejs.org/) 18+ (for development)
- [Rust](https://rustup.rs/) (for building)
- [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with C++ workload

### macOS

- macOS 10.13 (High Sierra) or later
- [Node.js](https://nodejs.org/) 18+
- [Rust](https://rustup.rs/)
- Xcode Command Line Tools:
  ```bash
  xcode-select --install
  ```

### Linux

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://rustup.rs/)
- System dependencies:
  ```bash
  # Debian/Ubuntu
  sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libssl-dev libayatana-appindicator3-dev librsvg2-dev
  
  # Fedora
  sudo dnf install webkit2gtk4.1-devel openssl-devel curl wget file libappindicator-gtk3-devel librsvg2-devel
  
  # Arch
  sudo pacman -S webkit2gtk-4.1 base-devel curl wget file openssl appmenu-gtk-module libappindicator-gtk3 librsvg
  ```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run tauri dev
```

## Building

### Windows

```bash
# Build MSI and NSIS installers
npm run tauri build
```

Output: `src-tauri/target/release/bundle/msi/` and `src-tauri/target/release/bundle/nsis/`

### macOS

```bash
# Build DMG and .app bundle
npm run tauri build
```

Output:
- `src-tauri/target/release/bundle/dmg/DevLaunch_<version>_<arch>.dmg`
- `src-tauri/target/release/bundle/macos/DevLaunch.app`

**Note:** macOS builds can only be created on macOS due to Apple's toolchain requirements.

#### Code Signing (Optional)

For distribution outside the Mac App Store, you can sign your app:

```bash
# Set your signing identity
export APPLE_SIGNING_IDENTITY="Developer ID Application: Your Name (XXXXXXXXXX)"

# Build with signing
npm run tauri build
```

### Linux

```bash
# Build AppImage and deb package
npm run tauri build
```

Output: `src-tauri/target/release/bundle/appimage/` and `src-tauri/target/release/bundle/deb/`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build frontend |
| `npm run tauri dev` | Run app in development mode |
| `npm run tauri build` | Build production app |

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS
- **Backend:** Tauri 2, Rust
- **Build:** Vite

## License

MIT
