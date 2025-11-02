// Main application logic
class AIToolsExplorer {
    constructor() {
        this.tools = [];
        this.filteredTools = [];
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.currentTool = null;
        this.currentFileIndex = 0;
        this.totalFiles = 0;
        
        this.init();
    }

    init() {
        // Load data
        this.tools = toolsData.tools;
        this.filteredTools = this.tools;
        
        // Calculate total files once
        this.totalFiles = this.tools.reduce((sum, tool) => sum + tool.fileCount, 0);
        
        // Update stats
        this.updateStats();
        
        // Render tools
        this.renderTools();
        
        // Setup event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Search box
        const searchBox = document.getElementById('searchBox');
        searchBox.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.filterTools();
        });

        // Filter buttons
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.filterTools();
            });
        });

        // Modal close
        const closeModal = document.getElementById('closeModal');
        closeModal.addEventListener('click', () => {
            this.closeModal();
        });

        // Close modal on outside click
        const modal = document.getElementById('fileModal');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });

        // Copy button
        const copyBtn = document.getElementById('copyBtn');
        copyBtn.addEventListener('click', () => {
            this.copyContent();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    updateStats() {
        document.getElementById('totalTools').textContent = this.tools.length;
        document.getElementById('totalFiles').textContent = this.totalFiles;
        document.getElementById('displayedTools').textContent = this.filteredTools.length;
    }

    filterTools() {
        this.filteredTools = this.tools.filter(tool => {
            // Search filter
            const matchesSearch = this.searchTerm === '' || 
                tool.name.toLowerCase().includes(this.searchTerm) ||
                tool.files.some(file => 
                    file.name.toLowerCase().includes(this.searchTerm) ||
                    file.path.toLowerCase().includes(this.searchTerm)
                );

            // Type filter
            let matchesType = true;
            if (this.currentFilter !== 'all') {
                matchesType = tool.files.some(file => file.type === this.currentFilter);
            }

            return matchesSearch && matchesType;
        });

        this.updateStats();
        this.renderTools();
    }

    renderTools() {
        const grid = document.getElementById('toolsGrid');
        const noResults = document.getElementById('noResults');

        if (this.filteredTools.length === 0) {
            grid.innerHTML = '';
            noResults.style.display = 'block';
            return;
        }

        noResults.style.display = 'none';
        grid.innerHTML = this.filteredTools.map(tool => this.createToolCard(tool)).join('');

        // Add click listeners to cards
        document.querySelectorAll('.tool-card').forEach((card, index) => {
            card.addEventListener('click', () => {
                this.openToolModal(this.filteredTools[index]);
            });
        });
    }

    createToolCard(tool) {
        const fileTypes = [...new Set(tool.files.map(f => f.type))];
        const fileTypeText = fileTypes.filter(t => t).join(', ') || 'various';
        
        // Group files by type for display
        const filesByType = {};
        tool.files.forEach(file => {
            const type = file.type || 'other';
            if (!filesByType[type]) filesByType[type] = [];
            filesByType[type].push(file);
        });

        const fileListHTML = Object.entries(filesByType)
            .sort((a, b) => b[1].length - a[1].length)
            .slice(0, 5)
            .map(([type, files]) => {
                const displayFiles = files.slice(0, 3);
                return displayFiles.map(file => `
                    <li class="file-item">
                        <span class="file-name" title="${file.name}">${file.name}</span>
                        <span class="file-type">${type}</span>
                    </li>
                `).join('');
            }).join('');

        const moreFiles = tool.fileCount > 5 ? `<li class="file-item" style="color: var(--text-secondary); font-style: italic;">... and ${tool.fileCount - 5} more files</li>` : '';

        return `
            <div class="tool-card" data-tool="${tool.name}">
                <div class="tool-header">
                    <div>
                        <div class="tool-name">${tool.name}</div>
                        <div class="file-count">📁 ${tool.fileCount} file${tool.fileCount !== 1 ? 's' : ''}</div>
                    </div>
                    <div class="tool-badge">${fileTypeText}</div>
                </div>
                <ul class="file-list">
                    ${fileListHTML}
                    ${moreFiles}
                </ul>
            </div>
        `;
    }

    async openToolModal(tool) {
        this.currentTool = tool;
        this.currentFileIndex = 0;

        const modal = document.getElementById('fileModal');
        const modalTitle = document.getElementById('modalTitle');
        const fileTabs = document.getElementById('fileTabs');

        modalTitle.textContent = tool.name;

        // Create file tabs
        fileTabs.innerHTML = tool.files.map((file, index) => `
            <button class="file-tab ${index === 0 ? 'active' : ''}" data-index="${index}">
                ${file.name}
            </button>
        `).join('');

        // Add tab click listeners
        document.querySelectorAll('.file-tab').forEach((tab, index) => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.file-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentFileIndex = index;
                this.loadFileContent(tool.files[index]);
            });
        });

        // Load first file
        await this.loadFileContent(tool.files[0]);

        // Show modal
        modal.classList.add('active');
    }

    async loadFileContent(file) {
        const fileContent = document.getElementById('fileContent');
        fileContent.innerHTML = '<div class="loading">Loading file content...</div>';

        try {
            const response = await fetch(file.path);
            if (!response.ok) throw new Error('File not found');
            
            const content = await response.text();
            
            // Format based on file type
            let formattedContent = content;
            
            if (file.type === '.json') {
                try {
                    const jsonObj = JSON.parse(content);
                    formattedContent = JSON.stringify(jsonObj, null, 2);
                } catch (e) {
                    // If JSON parsing fails, use original content
                }
            }

            fileContent.innerHTML = `<pre>${this.escapeHtml(formattedContent)}</pre>`;

            // Highlight search terms
            if (this.searchTerm) {
                this.highlightSearchTerms();
            }
        } catch (error) {
            fileContent.innerHTML = `
                <div class="loading" style="color: var(--warning-color);">
                    ⚠️ Unable to load file content<br>
                    <small>${error.message}</small>
                </div>
            `;
        }
    }

    highlightSearchTerms() {
        const fileContent = document.getElementById('fileContent');
        const pre = fileContent.querySelector('pre');
        if (!pre || !this.searchTerm) return;

        const content = pre.textContent;
        const escapedContent = this.escapeHtml(content);
        const regex = new RegExp(`(${this.escapeRegex(this.escapeHtml(this.searchTerm))})`, 'gi');
        const highlighted = escapedContent.replace(regex, '<span class="highlight">$1</span>');
        pre.innerHTML = highlighted;
    }

    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    closeModal() {
        const modal = document.getElementById('fileModal');
        modal.classList.remove('active');
        this.currentTool = null;
    }

    async copyContent() {
        const fileContent = document.getElementById('fileContent');
        const pre = fileContent.querySelector('pre');
        
        if (!pre) return;

        try {
            await navigator.clipboard.writeText(pre.textContent);
            const copyBtn = document.getElementById('copyBtn');
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✅ Copied!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
            alert('Failed to copy content to clipboard');
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AIToolsExplorer();
});
