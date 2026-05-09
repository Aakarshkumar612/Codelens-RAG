/**
 * CodeLens RAG - Dashboard Logic
 * Synchronizes the beautiful UI with the FastAPI backend.
 */

class CodeLensApp {
    constructor() {
        this.ws = null;
        this.currentRepo = null;
        this.currentFile = null;
        this.init();
    }

    init() {
        console.log("🚀 CodeLens Logic Initializing...");
        this.setupEventListeners();
        this.checkStatus();
        this.setupChat();
    }

    setupEventListeners() {
        // Index Repository Button
        const indexBtn = document.querySelector('button:contains("Index Repository")') || document.querySelector('button.bg-primary');
        if (indexBtn) {
            indexBtn.onclick = () => window.location.href = '/ingest-page';
        }

        // Chat Input
        const chatInput = document.querySelector('input[placeholder="Ask about your codebase..."]');
        const sendBtn = document.querySelector('button span[data-icon="send"]')?.parentElement;

        if (chatInput && sendBtn) {
            sendBtn.onclick = () => this.sendMessage(chatInput.value);
            chatInput.onkeypress = (e) => {
                if (e.key === 'Enter') this.sendMessage(chatInput.value);
            };
        }
    }

    async checkStatus() {
        try {
            const res = await fetch('/status');
            const data = await res.json();
            if (data.indexed) {
                this.currentRepo = data.url;
                this.updateUIWithRepo(data);
                this.loadTree();
            }
        } catch (err) {
            console.error("Failed to check status", err);
        }
    }

    updateUIWithRepo(data) {
        const sessionTitle = document.querySelector('header h2');
        if (sessionTitle) sessionTitle.innerText = `Session: ${data.url.split('/').pop()}`;
        
        const repoChip = document.querySelector('button:contains("repo-core")') || document.querySelector('.bg-surface-container.px-2.py-1');
        if (repoChip) repoChip.innerHTML = `<span class="material-symbols-outlined text-primary" style="font-size: 14px;">folder_open</span> ${data.url.split('/').pop()}`;
    }

    async loadTree() {
        try {
            const res = await fetch('/tree');
            const data = await res.json();
            this.renderTree(data.tree);
        } catch (err) {
            console.error("Failed to load tree", err);
        }
    }

    renderTree(tree) {
        // For now, we'll just log it and find a way to inject it into the UI
        console.log("Tree loaded:", tree);
        // We'll implement a proper recursive tree renderer if needed, 
        // but for now let's focus on the core chat and file view.
    }

    async loadFile(path) {
        try {
            const res = await fetch(`/file?path=${encodeURIComponent(path)}`);
            const data = await res.json();
            this.renderFile(path, data.content);
        } catch (err) {
            console.error("Failed to load file", err);
        }
    }

    renderFile(path, content) {
        const codeArea = document.querySelector('.ml-8.pl-4.pt-0.select-text');
        const lineNumbers = document.querySelector('.absolute.left-0.top-0.bottom-0.w-10');
        const breadcrumbs = document.querySelector('header .flex.items-center.text-code-sm');

        if (codeArea) {
            codeArea.textContent = content; // Simple text for now
            this.currentFile = path;
        }

        if (breadcrumbs) {
            const parts = path.split('/');
            const fileName = parts.pop();
            let html = `<span class="text-primary cursor-pointer hover:underline">${this.currentRepo.split('/').pop()}</span>`;
            parts.forEach(p => {
                html += `<span class="material-symbols-outlined mx-1 text-outline" style="font-size: 14px;">chevron_right</span><span class="cursor-pointer hover:text-on-surface">${p}</span>`;
            });
            html += `<span class="material-symbols-outlined mx-1 text-outline" style="font-size: 14px;">chevron_right</span><span class="text-on-surface font-bold flex items-center gap-1"><span class="material-symbols-outlined text-secondary" style="font-size: 14px;">description</span>${fileName}</span>`;
            breadcrumbs.innerHTML = html;
        }
    }

    setupChat() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        this.ws = new WebSocket(`${protocol}//${window.location.host}/chat`);

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.token) {
                this.appendToken(data.token);
            } else if (data.done) {
                this.finalizeMessage();
                if (data.highlight_file) {
                    this.loadFile(data.highlight_file);
                }
            } else if (data.error) {
                this.appendMessage("AI", `Error: ${data.error}`, true);
            }
        };

        this.ws.onopen = () => this.updateWsStatus(true);
        this.ws.onclose = () => this.updateWsStatus(false);
    }

    updateWsStatus(connected) {
        const statusEl = document.querySelector('.flex.items-center.gap-1.text-code-sm.text-outline-variant');
        if (statusEl) {
            statusEl.innerHTML = `<div class="w-2 h-2 rounded-full ${connected ? 'bg-primary' : 'bg-error'} shadow-[0_0_5px_rgba(0,200,255,0.8)] ${connected ? 'animate-pulse' : ''}"></div> WebSocket: ${connected ? 'Connected' : 'Disconnected'}`;
        }
    }

    sendMessage(text) {
        if (!text.trim() || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        
        this.appendMessage("User", text);
        this.ws.send(JSON.stringify({ query: text }));
        
        const chatInput = document.querySelector('input[placeholder="Ask about your codebase..."]');
        if (chatInput) chatInput.value = '';

        // Add placeholder for AI response
        this.currentAiMessage = this.createMessageElement("AI", "");
        document.querySelector('.flex-1.overflow-y-auto.p-6.space-y-6').appendChild(this.currentAiMessage);
    }

    createMessageElement(role, text) {
        const div = document.createElement('div');
        div.className = role === "User" ? "flex justify-end" : "flex justify-start";
        
        if (role === "User") {
            div.innerHTML = `
                <div class="max-w-[80%] bg-surface-container-high border border-outline-variant/30 p-4 rounded-lg rounded-tr-none shadow-sm">
                    <p class="font-body-md text-on-surface">${text}</p>
                </div>
            `;
        } else {
            div.innerHTML = `
                <div class="max-w-[85%] bg-[#152035]/80 backdrop-blur-[12px] border border-primary p-5 rounded-lg rounded-tl-none shadow-[0_0_20px_rgba(0,200,255,0.05)]">
                    <div class="flex items-center gap-2 mb-3 text-primary font-code-md">
                        <span class="material-symbols-outlined" style="font-size: 18px;">smart_toy</span>
                        <span class="font-bold">CodeLens AI</span>
                    </div>
                    <p class="font-body-md text-on-surface ai-content">${text}</p>
                </div>
            `;
        }
        return div;
    }

    appendMessage(role, text, isError = false) {
        const chatContainer = document.querySelector('.flex-1.overflow-y-auto.p-6.space-y-6');
        const msgEl = this.createMessageElement(role, text);
        if (isError) msgEl.querySelector('p').classList.add('text-error');
        chatContainer.appendChild(msgEl);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    appendToken(token) {
        if (this.currentAiMessage) {
            const contentEl = this.currentAiMessage.querySelector('.ai-content');
            contentEl.textContent += token;
            const chatContainer = document.querySelector('.flex-1.overflow-y-auto.p-6.space-y-6');
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }

    finalizeMessage() {
        this.currentAiMessage = null;
    }
}

// Global custom :contains selector for convenience (simple version)
window.addEventListener('DOMContentLoaded', () => {
    window.app = new CodeLensApp();
});
