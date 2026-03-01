# OpenClaw OpenAI兼容API适配器

这个项目提供了一个OpenAI兼容的API接口，让你可以通过标准的`/v1/chat/completions`接口调用本地的OpenClaw AI服务。

## 前提条件

1. **OpenClaw已安装并运行** - 确保OpenClaw网关正在运行（默认监听在`ws://127.0.0.1:18789`）
2. **Node.js环境** - 需要Node.js 14或更高版本

## 安装

```bash
npm install
```

## 使用方法

### 1. 启动OpenAI兼容API服务器

```bash
npm start
```

服务器将在 `http://localhost:3001` 启动，提供以下端点：

- `POST /v1/chat/completions` - 聊天补全（兼容OpenAI API）
- `GET /v1/models` - 获取可用模型列表
- `GET /health` - 健康检查

### 2. 测试API

```bash
npm test
```

这将运行一个测试脚本，验证API是否正常工作。

### 3. 直接使用适配器

```bash
npm run adapter
```

这将运行一个直接使用WebSocket适配器的示例。

## API使用示例

### 使用cURL

```bash
curl -X POST http://localhost:3001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat",
    "messages": [
      {"role": "user", "content": "你好，请介绍一下你自己"}
    ],
    "temperature": 0.7
  }'
```

### 使用Python

```python
import requests
import json

url = "http://localhost:3001/v1/chat/completions"
headers = {"Content-Type": "application/json"}
data = {
    "model": "deepseek-chat",
    "messages": [
        {"role": "user", "content": "你好，请介绍一下你自己"}
    ],
    "temperature": 0.7
}

response = requests.post(url, headers=headers, data=json.dumps(data))
print(response.json())
```

### 使用JavaScript/Node.js

```javascript
const axios = require('axios');

async function chatWithOpenClaw() {
  const response = await axios.post('http://localhost:3001/v1/chat/completions', {
    model: 'deepseek-chat',
    messages: [
      { role: 'user', content: '你好，请介绍一下你自己' }
    ],
    temperature: 0.7
  });
  
  console.log(response.data.choices[0].message.content);
}
```

## 支持的模型

通过这个适配器，你可以使用OpenClaw中配置的所有模型：

- `deepseek-chat` - DeepSeek Chat模型
- `deepseek-reasoner` - DeepSeek Reasoner模型
- `doubao-pro-32k` - 豆包 Pro 32K模型
- `doubao-lite-32k` - 豆包 Lite 32K模型

## 工作原理

这个适配器的工作原理如下：

1. **接收HTTP请求** - 接收标准的OpenAI API格式的请求
2. **转换为WebSocket消息** - 将请求转换为OpenClaw的WebSocket协议格式
3. **发送到OpenClaw网关** - 通过WebSocket发送到本地的OpenClaw网关（`ws://127.0.0.1:18789`）
4. **接收响应并转换** - 接收OpenClaw的响应，并转换回OpenAI API格式
5. **返回HTTP响应** - 返回标准的OpenAI API格式的响应

## 配置

### 修改端口

默认端口是3001，你可以通过环境变量修改：

```bash
PORT=8080 npm start
```

### 修改OpenClaw网关地址

如果需要连接到不同的OpenClaw网关，可以修改`openclaw-openai-server.js`中的`wsUrl`：

```javascript
this.wsUrl = 'ws://your-openclaw-gateway:port';
```

## 注意事项

1. **性能** - 由于需要通过WebSocket中转，可能会有一些延迟
2. **功能限制** - 只实现了OpenAI API的核心功能，一些高级功能可能不支持
3. **认证** - 当前版本没有实现API密钥认证，如果需要可以在服务器中添加
4. **错误处理** - 错误处理可能不如原生的OpenAI API完善

## 故障排除

### OpenClaw网关未运行

确保OpenClaw网关正在运行：
```bash
openclaw gateway status
```

### 端口被占用

如果3001端口被占用，可以修改端口：
```bash
PORT=3002 npm start
```

### WebSocket连接失败

检查OpenClaw网关的WebSocket地址：
```bash
tail -20 ~/.openclaw/logs/gateway.log
```

## 许可证

MIT