# 🤖 AI Tools System Prompts & Models - Searchable Website

A modern, fully-featured searchable web interface for browsing system prompts and models from 30+ AI coding tools.

## 🌟 Features

- **🔍 Advanced Search**: Real-time search across tool names, file names, and file paths
- **🎯 Smart Filtering**: Filter by file type (.txt prompts, .json tools, .yaml configs, documentation)
- **📊 Live Statistics**: See total tools, files, and filtered results at a glance
- **🎨 Modern UI**: Clean, responsive design that works on all devices
- **📄 File Viewer**: Click any tool to view all its files in an interactive modal
- **📑 Tabbed Interface**: Easy navigation between multiple files within a tool
- **📋 Copy to Clipboard**: One-click copy of any file content
- **🎯 File Type Badges**: Visual indicators for file types
- **⚡ Fast Performance**: Client-side search and filtering for instant results

## 🚀 Usage

### Option 1: Open Directly (Recommended)
Simply open `index.html` in your web browser:
```bash
open index.html
# or
firefox index.html
# or
chrome index.html
```

### Option 2: Use a Local Server
For the best experience, serve the files with a local HTTP server:

```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (with http-server)
npx http-server -p 8000

# PHP
php -S localhost:8000
```

Then open http://localhost:8000 in your browser.

## 📖 How to Use

1. **Browse All Tools**: The homepage displays all available AI tools with their file counts
2. **Search**: Type in the search box to find specific tools, files, or content
3. **Filter**: Click filter buttons to show only specific file types
4. **View Files**: Click on any tool card to open a modal with all its files
5. **Switch Files**: Use the tabs at the top of the modal to switch between files
6. **Copy Content**: Click the "Copy" button to copy file content to clipboard
7. **Close Modal**: Click the X button or press ESC to close the file viewer

## 🏗️ Project Structure

```
.
├── index.html      # Main HTML structure and styling
├── app.js          # Interactive functionality and UI logic
├── data.js         # Generated data index of all tools and files
└── WEBSITE.md      # This file
```

## 🔧 Updating the Data

If you add new tools or files to the repository, regenerate `data.js`:

```bash
python3 << 'EOF'
import os
import json
from pathlib import Path

def generate_index():
    base_path = Path('.')
    tools = []
    exclude_dirs = {'.git', '.github', 'assets', 'node_modules'}
    
    for item in sorted(base_path.iterdir()):
        if item.is_dir() and item.name not in exclude_dirs:
            tool_name = item.name
            files = []
            
            for file_path in sorted(item.rglob('*')):
                if file_path.is_file():
                    relative_path = str(file_path.relative_to(base_path))
                    file_type = file_path.suffix.lower()
                    
                    if file_type in ['.txt', '.json', '.md', '.yaml', '.yml', ''] or 'prompt' in file_path.name.lower():
                        files.append({
                            'name': file_path.name,
                            'path': relative_path,
                            'type': file_type if file_type else '.txt',
                            'size': file_path.stat().st_size
                        })
            
            if files:
                tools.append({
                    'name': tool_name,
                    'files': files,
                    'fileCount': len(files)
                })
    
    return {'tools': tools, 'totalTools': len(tools), 'generatedAt': '2025-11-02'}

index = generate_index()
with open('data.js', 'w') as f:
    f.write('// Auto-generated data file\n')
    f.write('// Generated on: 2025-11-02\n\n')
    f.write('const toolsData = ')
    f.write(json.dumps(index, indent=2))
    f.write(';\n')

print(f"Generated data.js with {len(index['tools'])} tools")
EOF
```

## 🎨 Customization

You can customize the appearance by modifying the CSS variables in `index.html`:

```css
:root {
    --primary-color: #2563eb;      /* Main brand color */
    --secondary-color: #1e40af;    /* Darker shade */
    --bg-color: #f8fafc;           /* Page background */
    --card-bg: #ffffff;            /* Card background */
    /* ... and more */
}
```

## 🌐 Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## 📝 Notes

- All data is loaded and processed client-side for maximum speed
- No server-side processing required
- Search is case-insensitive
- Files are loaded on-demand when you open a tool

## 🤝 Contributing

To add new AI tools to the database:
1. Create a new directory with the tool name
2. Add the prompt/tool files to that directory
3. Regenerate `data.js` using the script above
4. Refresh the webpage

## 📄 License

This project is part of the [System Prompts and Models of AI Tools](https://github.com/cbwinslow/system-prompts-and-models-of-ai-tools) repository.

---

**Built with ❤️ for the AI development community**
