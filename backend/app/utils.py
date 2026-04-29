from pathlib import Path

# Directories to skip while walking the repo
SKIP_DIRS: frozenset[str] = frozenset({
    ".git", ".github", ".svn",
    "node_modules", ".pnpm",
    "__pycache__", ".mypy_cache", ".pytest_cache", ".ruff_cache",
    ".next", ".nuxt", ".svelte-kit",
    "dist", "build", "out", "target",
    ".turbo", "coverage", ".nyc_output",
    "vendor", "venv", ".venv", "env", ".env",
    "eggs", ".eggs",
    ".idea", ".vscode",
})

# File extensions to skip (binary / generated / lock files)
SKIP_EXTENSIONS: frozenset[str] = frozenset({
    # Images
    ".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg", ".webp", ".bmp", ".tiff",
    # Fonts
    ".woff", ".woff2", ".ttf", ".eot", ".otf",
    # Media
    ".mp4", ".mp3", ".wav", ".avi", ".mov", ".mkv",
    # Archives
    ".zip", ".tar", ".gz", ".rar", ".7z", ".bz2",
    # Binaries
    ".exe", ".dll", ".so", ".dylib", ".bin", ".obj", ".a",
    # Documents
    ".pdf", ".docx", ".xlsx", ".pptx",
    # Compiled
    ".pyc", ".pyo", ".class", ".o",
    # Map / sourcemap
    ".map",
})

# Specific filenames to skip regardless of extension
SKIP_FILES: frozenset[str] = frozenset({
    "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
    "poetry.lock", "Cargo.lock", "go.sum", "Gemfile.lock",
    "composer.lock", "Pipfile.lock",
    ".DS_Store", "Thumbs.db",
})

LANGUAGE_MAP: dict[str, str] = {
    # Python
    ".py": "python", ".pyi": "python",
    # JavaScript
    ".js": "javascript", ".mjs": "javascript", ".cjs": "javascript",
    # TypeScript
    ".ts": "typescript", ".mts": "typescript", ".cts": "typescript",
    ".tsx": "typescriptreact",
    ".jsx": "javascriptreact",
    # Web
    ".html": "html", ".htm": "html",
    ".css": "css", ".scss": "scss", ".sass": "scss", ".less": "less",
    ".vue": "vue",
    ".svelte": "html",
    # Data
    ".json": "json", ".jsonc": "json",
    ".yaml": "yaml", ".yml": "yaml",
    ".toml": "toml",
    ".xml": "xml",
    ".csv": "plaintext",
    # Docs
    ".md": "markdown", ".mdx": "markdown",
    ".rst": "restructuredtext",
    # Shell
    ".sh": "bash", ".bash": "bash", ".zsh": "bash", ".fish": "bash",
    # Systems / compiled
    ".go": "go",
    ".rs": "rust",
    ".c": "c", ".h": "c",
    ".cpp": "cpp", ".cc": "cpp", ".cxx": "cpp", ".hpp": "cpp",
    ".cs": "csharp",
    ".java": "java",
    ".kt": "kotlin", ".kts": "kotlin",
    ".swift": "swift",
    ".dart": "dart",
    # Scripting
    ".rb": "ruby",
    ".php": "php",
    ".lua": "lua",
    ".r": "r",
    # DB
    ".sql": "sql",
    # Config / infra
    ".ini": "ini", ".cfg": "ini", ".conf": "ini",
    ".env": "ini",
    ".tf": "hcl", ".hcl": "hcl",
    ".graphql": "graphql", ".gql": "graphql",
    # Misc
    ".txt": "plaintext",
    ".log": "plaintext",
}

# Special whole-filename matches
FILENAME_LANGUAGE: dict[str, str] = {
    "Dockerfile": "dockerfile",
    "Makefile": "makefile",
    "Justfile": "makefile",
    "CMakeLists.txt": "cmake",
    ".gitignore": "plaintext",
    ".dockerignore": "plaintext",
}


def detect_language(filename: str) -> str:
    name = Path(filename).name
    if name in FILENAME_LANGUAGE:
        return FILENAME_LANGUAGE[name]
    suffix = Path(filename).suffix.lower()
    return LANGUAGE_MAP.get(suffix, "plaintext")


def build_file_tree(repo_path: Path) -> list[dict]:
    """Recursively build a JSON-serialisable file tree."""

    def _walk(path: Path) -> list[dict]:
        nodes: list[dict] = []
        try:
            entries = sorted(path.iterdir(), key=lambda p: (p.is_file(), p.name.lower()))
        except PermissionError:
            return nodes

        for entry in entries:
            if entry.name.startswith(".") or entry.name in SKIP_DIRS:
                continue
            rel = str(entry.relative_to(repo_path)).replace("\\", "/")
            if entry.is_dir():
                children = _walk(entry)
                if children:
                    nodes.append({"name": entry.name, "path": rel, "type": "folder", "children": children})
            else:
                nodes.append({
                    "name": entry.name,
                    "path": rel,
                    "type": "file",
                    "language": detect_language(entry.name),
                })
        return nodes

    return _walk(repo_path)
