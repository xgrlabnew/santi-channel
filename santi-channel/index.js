#!/usr/bin/env node

// Santi Channel - 极简OpenClaw插件
// 功能：连接sChat客户端和OpenClaw Gateway

const WebSocket = require('ws');
const path = require('path');

// 配置
const CONFIG = {
    // sChat客户端连接端口
    SCHAT_WS_PORT: 3333,
    
    // OpenClaw Gateway WebSocket地址
    OPENCLAW_WS_URL: process.env.OPENCLAW_WS_URL || 'ws://localhost:18789',
    
    // 插件信息
    PLUGIN_NAME: 'santi-channel',
    VERSION: '0.1.0'
};

console.log(`🚀 启动 ${CONFIG.PLUGIN_NAME} v${CONFIG.VERSION}`);

// 连接到OpenClaw Gateway
let openclawWS = null;
let isOpenClawConnected = false;

// sChat客户端连接
const sChatClients = new Set();

// 启动WebSocket服务器（供sChat连接）
const wss = new WebSocket.Server({ port: CONFIG.SCHAT_WS_PORT });

console.log(`🔌 sChat WebSocket服务器运行在 ws://localhost:${CONFIG.SCHAT_WS_PORT}`);

// 连接OpenClaw Gateway
function connectToOpenClaw() {
    console.log(`🔗 正在连接 OpenClaw Gateway: ${CONFIG.OPENCLAW_WS_URL}`);
    
    // 暂时禁用OpenClaw连接，专注测试sChat
    console.log('⚠️ OpenClaw连接已禁用，使用模拟回复模式');
    isOpenClawConnected = false;
    
    // 通知所有sChat客户端
    broadcastToSChat({
        type: 'system',
        text: 'AI助手连接已禁用，使用模拟回复模式'
    });
    
    return;
    
    // 以下为原始连接代码（已禁用）
    openclawWS = new WebSocket(CONFIG.OPENCLAW_WS_URL);
    
    openclawWS.on('open', () => {
        console.log('✅ 已连接到 OpenClaw Gateway');
        isOpenClawConnected = true;
        
        // 通知所有sChat客户端
        broadcastToSChat({
            type: 'system',
            text: '已连接到AI助手'
        });
    });
    
    openclawWS.on('message', (data) => {
        try {
            const message = JSON.parse(data.toString());
            
            // 处理连接挑战
            if (message.type === 'event' && message.event === 'connect.challenge') {
                console.log('🔐 收到连接挑战，发送响应...');
                
                // 响应挑战
                const challengeResponse = {
                    type: 'event',
                    event: 'connect.response',
                    payload: {
                        nonce: message.payload.nonce,
                        ts: message.payload.ts,
                        response: 'accepted'
                    }
                };
                
                openclawWS.send(JSON.stringify(challengeResponse));
                console.log('✅ 已发送挑战响应');
                return;
            }
            
            handleOpenClawMessage(message);
        } catch (error) {
            console.error('❌ OpenClaw消息解析错误:', error);
        }
    });
    
    openclawWS.on('error', (error) => {
        console.error('❌ OpenClaw连接错误:', error.message);
        isOpenClawConnected = false;
    });
    
    openclawWS.on('close', () => {
        console.log('⚠️ OpenClaw连接断开，3秒后重连...');
        isOpenClawConnected = false;
        
        // 通知所有sChat客户端
        broadcastToSChat({
            type: 'system',
            text: 'AI助手连接断开，正在重连...'
        });
        
        // 3秒后重连
        setTimeout(connectToOpenClaw, 3000);
    });
}

// 处理OpenClaw消息
function handleOpenClawMessage(message) {
    console.log('📥 收到OpenClaw消息类型:', message.type || 'unknown');
    
    // 检查是否是AI回复
    if (message.type === 'ai_response' || message.content) {
        console.log('✅ 这是AI回复消息');
        const response = {
            type: 'ai_response',
            text: message.content || 'AI已回复',
            timestamp: Date.now(),
            source: 'openclaw'
        };
        broadcastToSChat(response);
    } else if (message.type === 'event') {
        console.log('ℹ️ 系统事件:', message.event || 'unknown');
        // 如果是连接成功事件，更新状态
        if (message.event === 'connect.established') {
            console.log('🎉 OpenClaw连接已建立');
            isOpenClawConnected = true;
            broadcastToSChat({
                type: 'system',
                text: 'AI助手连接已建立'
            });
        }
        // 其他系统事件不转发给用户
    } else if (message.text) {
        console.log('💬 文本消息:', message.text.substring(0, 50) + '...');
        const response = {
            type: 'ai_response',
            text: message.text,
            timestamp: Date.now(),
            source: 'openclaw'
        };
        broadcastToSChat(response);
    } else {
        console.log('⚠️ 未知消息类型，结构:', Object.keys(message).join(', '));
        // 不发送默认回复，避免混淆
    }
}

// 处理sChat消息
function handleSChatMessage(client, message) {
    console.log('📤 收到sChat消息:', message.type);
    
    if (message.type === 'user_message') {
        // 转发给OpenClaw
        if (isOpenClawConnected && openclawWS) {
            const openclawMessage = {
                type: 'user_message',
                content: message.text,
                channel: 'santi',
                timestamp: Date.now()
            };
            
            openclawWS.send(JSON.stringify(openclawMessage));
            console.log('↪️ 已转发消息到OpenClaw');
        } else {
            // OpenClaw未连接，模拟AI回复（用于测试）
            console.log('⚠️ OpenClaw未连接，发送模拟AI回复');
            const simulatedResponse = {
                type: 'ai_response',
                text: `你好！我是AI助手。你刚才说："${message.text}"\n\n（这是模拟回复，OpenClaw连接状态：${isOpenClawConnected ? '已连接' : '未连接'}）`,
                timestamp: Date.now(),
                isSimulated: true
            };
            
            client.send(JSON.stringify(simulatedResponse));
        }
    }
}

// 广播消息给所有sChat客户端
function broadcastToSChat(message) {
    const messageStr = JSON.stringify(message);
    
    sChatClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(messageStr);
        }
    });
}

// sChat WebSocket服务器事件
wss.on('connection', (client) => {
    console.log('👤 sChat客户端已连接');
    sChatClients.add(client);
    
    // 发送欢迎消息
    client.send(JSON.stringify({
        type: 'system',
        text: '欢迎使用Santi Chat!'
    }));
    
    // 发送连接状态
    client.send(JSON.stringify({
        type: 'system',
        text: isOpenClawConnected ? 'AI助手已就绪' : '正在连接AI助手...'
    }));
    
    // 处理消息
    client.on('message', (data) => {
        try {
            const message = JSON.parse(data.toString());
            handleSChatMessage(client, message);
        } catch (error) {
            console.error('❌ sChat消息解析错误:', error);
        }
    });
    
    // 处理断开连接
    client.on('close', () => {
        console.log('👤 sChat客户端已断开');
        sChatClients.delete(client);
    });
    
    client.on('error', (error) => {
        console.error('❌ sChat客户端错误:', error);
    });
});

// 启动OpenClaw连接
connectToOpenClaw();

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n🛑 正在关闭Santi Channel...');
    
    // 关闭所有连接
    if (openclawWS) {
        openclawWS.close();
    }
    
    wss.close();
    
    // 通知客户端
    broadcastToSChat({
        type: 'system',
        text: '服务器正在关闭...'
    });
    
    setTimeout(() => {
        console.log('👋 Santi Channel已关闭');
        process.exit(0);
    }, 1000);
});

console.log('✅ Santi Channel启动完成');
console.log('📋 使用说明:');
console.log('  1. 启动sChat: cd schat && npm start');
console.log('  2. 访问 http://localhost:8080');
console.log('  3. 确保OpenClaw Gateway正在运行');