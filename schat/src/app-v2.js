// 增强版 sChat 客户端 v2
class SChatV2 {
    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.messageCount = 0;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.sessionId = 'session_' + Date.now();
        
        this.initElements();
        this.initEvents();
        this.connect();
        this.startHeartbeat();
    }
    
    initElements() {
        this.messagesEl = document.getElementById('messages');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.statusDot = document.getElementById('statusDot');
        this.statusText = document.getElementById('statusText');
        this.typingEl = document.getElementById('typing');
        
        // 创建统计信息显示
        this.statsEl = document.createElement('div');
        this.statsEl.className = 'stats';
        this.statsEl.innerHTML = `
            <div class="stat">消息: <span id="msgCount">0</span></div>
            <div class="stat">会话: <span id="sessionId">${this.sessionId.substring(0, 8)}</span></div>
            <div class="stat">重连: <span id="reconnectCount">0</span></div>
        `;
        document.querySelector('.header').appendChild(this.statsEl);
    }
    
    initEvents() {
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        this.messageInput.addEventListener('input', () => {
            this.sendBtn.disabled = !this.messageInput.value.trim() || !this.isConnected;
        });
        
        // 添加清除聊天按钮
        const clearBtn = document.createElement('button');
        clearBtn.textContent = '清除聊天';
        clearBtn.className = 'clear-btn';
        clearBtn.addEventListener('click', () => this.clearChat());
        document.querySelector('.input-area').appendChild(clearBtn);
    }
    
    connect() {
        // WebSocket 连接地址 - 连接到 Santi Channel
        const wsUrl = 'ws://localhost:3333';
        console.log(`🔗 正在连接到: ${wsUrl}`);
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
            console.log('✅ 已连接到 Santi Channel');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.updateStatus('已连接到AI助手', true);
            this.sendBtn.disabled = false;
            this.updateStats();
            
            // 发送连接信息
            this.ws.send(JSON.stringify({
                type: 'system',
                action: 'connect',
                sessionId: this.sessionId,
                timestamp: Date.now()
            }));
            
            this.addSystemMessage('连接已建立，可以开始聊天');
        };
        
        this.ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                console.log('📥 收到消息:', message);
                
                this.messageCount++;
                this.updateStats();
                
                if (message.type === 'ai_response') {
                    this.addMessage('ai', message.text, message.timestamp);
                    this.hideTyping();
                    
                    // 检查是否是模拟回复
                    if (message.isSimulated) {
                        this.addSystemMessage('⚠️ 当前使用模拟AI回复');
                    } else if (message.source === 'openclaw') {
                        this.addSystemMessage('✅ 收到OpenClaw真实回复');
                    }
                } else if (message.type === 'system') {
                    this.addSystemMessage(message.text);
                }
            } catch (error) {
                console.error('❌ 消息解析错误:', error);
                this.addSystemMessage('消息解析错误: ' + error.message);
            }
        };
        
        this.ws.onerror = (error) => {
            console.error('❌ WebSocket 错误:', error);
            this.isConnected = false;
            this.updateStatus('连接错误', false);
            this.sendBtn.disabled = true;
            this.addSystemMessage('连接发生错误');
        };
        
        this.ws.onclose = () => {
            console.log('⚠️ 连接断开');
            this.isConnected = false;
            this.updateStatus('连接断开', false);
            this.sendBtn.disabled = true;
            
            // 自动重连
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnectAttempts++;
                this.updateStats();
                const delay = Math.min(1000 * this.reconnectAttempts, 10000);
                this.addSystemMessage(`连接断开，${delay/1000}秒后重连... (尝试 ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                
                setTimeout(() => this.connect(), delay);
            } else {
                this.addSystemMessage('重连次数已达上限，请刷新页面');
            }
        };
    }
    
    updateStatus(text, isConnected) {
        this.statusText.textContent = text;
        this.statusDot.className = isConnected ? 'status-dot' : 'status-dot disconnected';
    }
    
    updateStats() {
        const msgCountEl = document.getElementById('msgCount');
        const reconnectCountEl = document.getElementById('reconnectCount');
        const sessionIdEl = document.getElementById('sessionId');
        
        if (msgCountEl) msgCountEl.textContent = this.messageCount;
        if (reconnectCountEl) reconnectCountEl.textContent = this.reconnectAttempts;
        if (sessionIdEl) sessionIdEl.textContent = this.sessionId.substring(0, 8);
    }
    
    sendMessage() {
        const text = this.messageInput.value.trim();
        if (!text || !this.isConnected || !this.ws) return;
        
        // 添加用户消息到界面
        this.addMessage('user', text, Date.now());
        
        // 发送到服务器
        const message = {
            type: 'user_message',
            text: text,
            timestamp: Date.now(),
            id: `msg_${Date.now()}`,
            sessionId: this.sessionId
        };
        
        this.ws.send(JSON.stringify(message));
        console.log('📤 发送消息:', message);
        
        // 清空输入框
        this.messageInput.value = '';
        this.sendBtn.disabled = true;
        
        // 显示"正在输入"状态
        this.showTyping();
    }
    
    addMessage(sender, text, timestamp) {
        // 移除空状态
        const emptyState = this.messagesEl.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }
        
        const messageEl = document.createElement('div');
        messageEl.className = `message ${sender}`;
        
        const timeStr = new Date(timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
        
        messageEl.innerHTML = `
            <div class="message-header">
                <span class="message-sender">${sender === 'user' ? '我' : 'AI'}</span>
                <span class="message-time">${timeStr}</span>
            </div>
            <div class="message-content">${this.escapeHtml(text)}</div>
        `;
        
        this.messagesEl.appendChild(messageEl);
        this.scrollToBottom();
    }
    
    addSystemMessage(text) {
        const messageEl = document.createElement('div');
        messageEl.className = 'message system';
        messageEl.textContent = `📢 ${text}`;
        
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
    
    clearChat() {
        if (confirm('确定要清除所有聊天记录吗？')) {
            this.messagesEl.innerHTML = `
                <div class="empty-state">
                    <h2>💬 开始聊天</h2>
                    <p>输入消息开始与AI对话</p>
                </div>
            `;
            this.messageCount = 0;
            this.updateStats();
            this.addSystemMessage('聊天记录已清除');
        }
    }
    
    scrollToBottom() {
        this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    }
    
    startHeartbeat() {
        // 每30秒发送心跳
        setInterval(() => {
            if (this.isConnected && this.ws) {
                this.ws.send(JSON.stringify({
                    type: 'heartbeat',
                    timestamp: Date.now(),
                    sessionId: this.sessionId
                }));
            }
        }, 30000);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    window.schat = new SChatV2();
    
    // 添加键盘快捷键
    document.addEventListener('keydown', (e) => {
        // Ctrl+Enter 发送
        if (e.ctrlKey && e.key === 'Enter') {
            window.schat.sendMessage();
        }
        // Esc 清除输入
        if (e.key === 'Escape') {
            window.schat.messageInput.value = '';
            window.schat.sendBtn.disabled = true;
        }
    });
    
    console.log('🚀 sChat v2 已启动');
});