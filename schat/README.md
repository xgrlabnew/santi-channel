# sChat - 极简Web聊天客户端

极简的Web聊天客户端，用于连接Santi Channel插件。

## 🎯 功能

- 极简聊天界面
- WebSocket实时通信
- 自动重连机制
- 响应式设计
- 无框架依赖，纯原生JavaScript

## 🚀 快速开始

### 1. 启动开发服务器
```bash
cd schat
npm start
```

### 2. 访问应用
打开浏览器访问: http://localhost:3030

### 3. 开始聊天
1. 确保Santi Channel插件正在运行
2. 在输入框中输入消息
3. 点击发送或按Enter键

## 📁 项目结构

```
schat/
├── public/              # 静态文件
│   ├── index.html      # 主页面
│   └── app.js          # 客户端脚本（构建后）
├── src/                # 源代码
│   └── app.js          # 主逻辑
├── package.json        # 项目配置
└── README.md          # 说明文档
```

## 🎨 界面说明

### 顶部状态栏
- 应用标题: Santi Chat
- 连接状态: 显示当前连接状态

### 消息区域
- 用户消息: 蓝色气泡，右侧显示
- AI回复: 灰色气泡，左侧显示
- 系统消息: 黄色气泡，居中显示
- 正在输入: 显示AI思考状态

### 输入区域
- 文本输入框: 输入聊天内容
- 发送按钮: 发送消息

## 🔧 配置

### 连接地址
默认连接到: `ws://localhost:3001`

如需修改连接地址，编辑 `src/app.js`:
```javascript
const wsUrl = 'ws://你的服务器地址:端口';
```

## 📱 响应式设计

- 桌面端: 最大宽度500px
- 移动端: 全屏宽度
- 自动适应不同屏幕尺寸

## 🔌 消息协议

### 发送消息
```javascript
{
  type: 'user_message',
  text: '消息内容',
  timestamp: 1234567890,
  id: 'msg_123'
}
```

### 接收消息
- `ai_response`: AI回复消息
- `system`: 系统消息（连接状态等）

## 🧪 测试

### 本地测试
1. 启动Santi Channel插件
2. 启动sChat: `npm start`
3. 访问 http://localhost:3030
4. 发送测试消息

### 连接测试
1. 检查浏览器控制台是否有错误
2. 查看网络面板中的WebSocket连接状态
3. 测试重连功能（断开网络后恢复）

## 🚢 部署

### 静态部署
1. 构建: `npm run build`
2. 将 `public/` 目录部署到任何静态服务器
3. 确保可以访问Santi Channel WebSocket服务器

### 常用部署平台
- **Vercel**: `vercel --prod`
- **Netlify**: `netlify deploy --prod`
- **GitHub Pages**: 上传到 `gh-pages` 分支
- **任何静态托管服务**

### 环境配置
生产环境可能需要配置CORS和WebSocket代理。

## 🔍 故障排除

### 常见问题

1. **无法连接服务器**
   - 检查Santi Channel是否运行
   - 检查WebSocket地址是否正确
   - 检查防火墙/网络设置

2. **消息发送失败**
   - 检查连接状态
   - 查看浏览器控制台错误
   - 检查消息格式

3. **界面显示异常**
   - 清除浏览器缓存
   - 检查CSS是否加载
   - 尝试其他浏览器

### 调试技巧
```javascript
// 在浏览器控制台查看连接状态
console.log(window.schat);

// 手动发送测试消息
window.schat.ws.send(JSON.stringify({
  type: 'user_message',
  text: '测试消息',
  timestamp: Date.now()
}));
```

## 📄 许可证

MIT License