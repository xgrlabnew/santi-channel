#!/usr/bin/env node

// OpenClaw连接诊断工具

const WebSocket = require('ws');

console.log('🔧 OpenClaw连接诊断工具');
console.log('====================================\n');

// 测试1：检查OpenClaw Gateway基本连接
console.log('1. 测试OpenClaw Gateway基本连接:');
const testWS = new WebSocket('ws://localhost:18789');

testWS.on('open', () => {
    console.log('  ✅ WebSocket连接已建立');
    
    // 监听所有消息
    testWS.on('message', (data) => {
        try {
            const msg = JSON.parse(data.toString());
            console.log('  📥 收到消息:', JSON.stringify(msg, null, 2));
            
            if (msg.type === 'event' && msg.event === 'connect.challenge') {
                console.log('  🔐 需要响应连接挑战');
                console.log('  挑战nonce:', msg.payload.nonce);
                
                // 尝试不同的响应格式
                const responses = [
                    {
                        type: 'event',
                        event: 'connect.response',
                        payload: {
                            nonce: msg.payload.nonce,
                            ts: msg.payload.ts,
                            response: 'accepted'
                        }
                    },
                    {
                        type: 'event',
                        event: 'connect.verify',
                        payload: {
                            nonce: msg.payload.nonce,
                            signature: 'test_signature'
                        }
                    },
                    {
                        action: 'auth',
                        nonce: msg.payload.nonce,
                        ts: msg.payload.ts
                    }
                ];
                
                // 发送所有响应
                responses.forEach((resp, i) => {
                    setTimeout(() => {
                        console.log(`  📤 尝试响应格式 ${i+1}:`, JSON.stringify(resp));
                        testWS.send(JSON.stringify(resp));
                    }, i * 1000);
                });
            }
        } catch (e) {
            console.log('  ❌ 消息解析错误:', e.message);
        }
    });
    
    // 发送测试消息
    setTimeout(() => {
        const testMsg = {
            type: 'ping',
            timestamp: Date.now()
        };
        console.log('\n  📤 发送ping消息:', JSON.stringify(testMsg));
        testWS.send(JSON.stringify(testMsg));
    }, 4000);
});

testWS.on('error', (err) => {
    console.log('  ❌ 连接错误:', err.message);
});

testWS.on('close', () => {
    console.log('  🔌 连接关闭');
});

// 测试2：检查OpenClaw HTTP API
setTimeout(() => {
    console.log('\n2. 检查OpenClaw HTTP API:');
    const http = require('http');
    
    const options = {
        hostname: 'localhost',
        port: 18789,
        path: '/',
        method: 'GET'
    };
    
    const req = http.request(options, (res) => {
        console.log(`  📡 HTTP状态码: ${res.statusCode}`);
        console.log(`  📡 HTTP状态消息: ${res.statusMessage}`);
        console.log(`  📡 内容类型: ${res.headers['content-type']}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            if (data.includes('OpenClaw')) {
                console.log('  ✅ 检测到OpenClaw控制面板');
            }
            console.log('  📄 响应长度:', data.length, '字节');
        });
    });
    
    req.on('error', (err) => {
        console.log('  ❌ HTTP请求错误:', err.message);
    });
    
    req.end();
}, 8000);

// 测试3：检查OpenClaw服务状态
setTimeout(() => {
    console.log('\n3. 检查OpenClaw服务状态:');
    const { exec } = require('child_process');
    
    exec('openclaw gateway status', (error, stdout, stderr) => {
        if (error) {
            console.log('  ❌ 执行错误:', error.message);
            return;
        }
        
        console.log('  📋 OpenClaw Gateway状态:');
        const lines = stdout.split('\n');
        lines.forEach(line => {
            if (line.trim()) {
                console.log('    ', line);
            }
        });
    });
}, 12000);

setTimeout(() => {
    console.log('\n====================================');
    console.log('🔍 诊断完成');
    console.log('\n建议:');
    console.log('1. 检查OpenClaw Gateway配置');
    console.log('2. 查看OpenClaw日志: openclaw gateway logs');
    console.log('3. 尝试重启OpenClaw: openclaw gateway restart');
    console.log('4. 检查防火墙或网络设置');
    process.exit(0);
}, 15000);