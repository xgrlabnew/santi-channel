// 极简 sChat 客户端
class SChat {
    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.messageCount = 0;
        
        this.initElements();
        this.initEvents();
        this.connect();
    }
    
    initElements() {
        this.messagesEl = document.getElementById('messages');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.statusDot = document.getElementById('statusDot');
        this.statusText = document.getElementById('statusText');
        this.typingEl = document.getElementById('typing');
    }
    
    initEvents() {
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        this.messageInput.addEventListener('input', () => {
            this.sendBtn.disabled = !this.messageInput.value.trim() || !this.isConnected;
        });
    }
    
    connect() {
        // WebSocket 连接地址 - 连接到 Santi Channel
        const wsUrl = 'ws://localhost:3333';
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
            console.log('✅ 已连接到 Santi Channel');
            this.isConnected = true;
            this.updateStatus('已连接', true);
            this.sendBtn.disabled = false;
            
            // 发送连接通知
            this.addSystemMessage('已连接到聊天服务器');
        };
        
        this.ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                console.log('📥 收到消息:', message);
                
                if (message.type === 'ai_response') {
                    this.addMessage('ai', message.text);
                    this.hideTyping();
                } else if (message.type === 'system') {
                    this.addSystemMessage(message.text);
                }
            } catch (error) {
                console.error('❌ 消息解析错误:', error);
            }
        };
        
        this.ws.onerror = (error) => {
            console.error('❌ WebSocket 错误:', error);
            this.isConnected = false;
            this.updateStatus('连接错误', false);
            this.sendBtn.disabled = true;
        };
        
        this.ws.onclose = () => {
            console.log('⚠️ 连接断开，5秒后重连...');
            this.isConnected = false;
            this.updateStatus('连接断开', false);
            this.sendBtn.disabled = true;
            
            // 5秒后重连
            setTimeout(() => this.connect(), 5000);
        };
    }
    
    updateStatus(text, isConnected) {
        this.statusText.textContent = text;
        this.statusDot.className = isConnected ? 'status-dot' : 'status-dot disconnected';
    }
    
    sendMessage() {
        const text = this.messageInput.value.trim();
        if (!text || !this.isConnected || !this.ws) return;
        
        // 添加用户消息到界面
        this.addMessage('user', text);
        
        // 发送到服务器
        const message = {
            type: 'user_message',
            text: text,
            timestamp: Date.now(),
            id: `msg_${Date.now()}`
        };
        
        this.ws.send(JSON.stringify(message));
        
        // 清空输入框
        this.messageInput.value = '';
        this.sendBtn.disabled = true;
        
        // 显示"正在输入"状态
        this.showTyping();
    }
    
    addMessage(sender, text) {
        // 移除空状态
        const emptyState = this.messagesEl.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }
        
        const messageEl = document.createElement('div');
        messageEl.className = `message ${sender}`;
        messageEl.textContent = text;
        
        this.messagesEl.appendChild(messageEl);
        this.scrollToBottom();
    }
    
    addSystemMessage(text) {
        const messageEl = document.createElement('div');
        messageEl.className = 'message system';
        messageEl.textContent = text;
        
        this.messagesEl.appendChild(messageEl);
        this.scrollToBottom();
    }
    
    showTyping() {
        this.typingEl.style.display = 'flex';
        this.scrollToBottom();
    }
    
    hideTyping() {
        this.typingEl.style.display = 'none';
    }
    
    scrollToBottom() {
        this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    window.schat = new SChat();
});