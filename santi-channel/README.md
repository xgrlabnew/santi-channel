# Santi Channel - 极简OpenClaw插件

极简的Santi Channel插件，连接sChat客户端和OpenClaw Gateway。

## 🎯 功能

- 提供WebSocket服务器供sChat客户端连接
- 转发消息到OpenClaw Gateway
- 转发OpenClaw回复到sChat客户端
- 自动重连机制
- 无状态设计，无需数据库

## 🚀 快速开始

### 1. 安装依赖
```bash
cd santi-channel
npm install
```

### 2. 启动插件
```bash
npm start
```

### 3. 自动部署到OpenClaw
```bash
node scripts/deploy.js
```

### 4. 运行测试
```bash
npm test
```

## 📁 项目结构

```
santi-channel/
├── index.js              # 主入口文件
├── manifest.json         # OpenClaw插件声明
├── package.json          # 项目配置
├── README.md            # 说明文档
├── lib/                  # 核心库
│   └── (预留)
└── scripts/             # 工具脚本
    ├── deploy.js        # 自动部署脚本
    └── test-connection.js # 连接测试脚本
```

## 🔧 配置

### 环境变量
- `OPENCLAW_WS_URL`: OpenClaw Gateway WebSocket地址 (默认: `ws://localhost:18789`)

### 端口配置
- sChat客户端连接端口: `3001`

## 🔌 消息协议

### sChat → Santi Channel
```json
{
  "type": "user_message",
  "text": "用户消息内容",
  "timestamp": 1234567890,
  "id": "msg_123"
}
```

### Santi Channel → sChat
```json
{
  "type": "ai_response",
  "text": "AI回复内容",
  "timestamp": 1234567890
}
```

```json
{
  "type": "system",
  "text": "系统消息"
}
```

## 🧪 测试

### 连接测试
```bash
# 测试所有连接
npm test

# 手动测试WebSocket连接
node scripts/test-connection.js
```

### 手动测试
1. 使用WebSocket客户端连接到 `ws://localhost:3001`
2. 发送测试消息
3. 检查是否收到回复

## 🚢 部署

### 自动部署
```bash
node scripts/deploy.js
```

### 手动部署
1. 复制插件文件到 `~/.openclaw/plugins/santi-channel/`
2. 运行 `npm install` 安装依赖
3. 重启OpenClaw Gateway: `openclaw gateway restart`

## 🔍 故障排除

### 常见问题

1. **无法连接到OpenClaw Gateway**
   - 检查OpenClaw Gateway是否运行: `openclaw gateway status`
   - 检查WebSocket地址是否正确

2. **sChat客户端无法连接**
   - 检查Santi Channel是否运行: `node index.js`
   - 检查端口3001是否被占用

3. **消息无法转发**
   - 检查OpenClaw连接状态
   - 查看控制台日志

### 日志查看
```bash
# 查看Santi Channel日志
tail -f santi-channel.log

# 查看OpenClaw日志
openclaw gateway logs
```

## 📄 许可证

MIT License