# Santi Channel MVP 🚀

[![GitHub](https://img.shields.io/badge/GitHub-xgrlabnew%2Fsanti--channel-blue)](https://github.com/xgrlabnew/santi-channel)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status: MVP](https://img.shields.io/badge/Status-MVP-green)](https://github.com/xgrlabnew/santi-channel)

**极简OpenClaw聊天插件** - sChat前端 + Santi Channel后端

## 📖 项目概述

Santi Channel是一个极简的OpenClaw聊天插件MVP，包含：

- **sChat前端**: 纯HTML/CSS/JS web聊天客户端 (端口3030)
- **Santi Channel后端**: Node.js WebSocket消息转发器 (端口3333)
- **模拟AI回复**: 当OpenClaw连接不可用时提供有用的模拟回复

## 🎯 核心特性

### ✅ 已完成
- **极简架构**: 无数据库，无复杂状态，单文件设计
- **实时通信**: WebSocket双向通信，自动重连
- **完整文档**: 中文文档体系，快速开始指南
- **自动化脚本**: 一键启动，端到端测试
- **增强UI**: sChat v2带统计信息、时间戳、键盘快捷键
- **稳定连接**: 避免OpenClaw认证问题，专注核心功能测试

### 🔄 当前状态
- **OpenClaw集成**: 暂时禁用（认证协议问题）
- **模拟回复**: 提供有用的模拟AI回复
- **可测试**: 完整聊天体验，可验证消息流转

## 🚀 快速开始

### 1. 克隆仓库
```bash
git clone https://github.com/xgrlabnew/santi-channel.git
cd santi-channel
```

### 2. 一键启动所有服务
```bash
./start-all.sh
```

### 3. 访问sChat
打开浏览器访问: [http://localhost:3030](http://localhost:3030)

### 4. 开始聊天
- 输入消息并发送
- 接收模拟AI回复
- 测试所有功能

## 🏗️ 架构设计

### 系统架构
```
用户 (浏览器)
    ↓ HTTP (3030)
sChat前端 (Python HTTP服务器)
    ↓ WebSocket (3333)
Santi Channel后端 (Node.js WebSocket服务器)
    ↓ (已禁用) WebSocket (18789)
OpenClaw Gateway
```

### 端口配置
- **3030**: sChat前端 HTTP服务器
- **3333**: Santi Channel后端 WebSocket服务器
- **18789**: OpenClaw Gateway (当前禁用)

### 消息流转
```
用户消息 → sChat前端 → WebSocket → Santi Channel后端 → 模拟回复 → sChat前端 → 用户
```

## 📁 项目结构

```
santi-channel-mvp/
├── README.md                    # 项目说明
├── PROJECT_STATUS.md           # 项目状态跟踪
├── start-all.sh                # 一键启动脚本
├── test-e2e.sh                 # 端到端测试脚本
├── docs/                       # 中文文档
│   ├── 01-项目介绍.md
│   ├── 02-项目概述.md
│   ├── 03-架构设计.md
│   ├── 04-快速开始.md
│   └── 05-测试流程.md
├── santi-channel/              # Santi Channel后端
│   ├── index.js               # 主逻辑文件
│   ├── package.json
│   ├── manifest.json          # OpenClaw插件清单
│   ├── README.md
│   └── scripts/
│       ├── deploy.js          # 部署脚本
│       └── test-connection.js # 连接测试
└── schat/                      # sChat前端
    ├── public/
    │   ├── index.html         # 主页面
    │   └── app-v2.js          # 增强版客户端
    ├── src/
    │   ├── app.js             # 基础版客户端
    │   └── app-v2.js          # 增强版源码
    └── package.json
```

## 🔧 技术栈

### 前端 (sChat)
- **语言**: HTML5, CSS3, JavaScript (ES6+)
- **通信**: WebSocket API
- **服务器**: Python HTTP服务器
- **特性**: 实时消息、自动重连、统计信息、键盘快捷键

### 后端 (Santi Channel)
- **语言**: Node.js (JavaScript)
- **框架**: 原生WebSocket (ws库)
- **协议**: 自定义JSON消息协议
- **特性**: 消息转发、连接管理、模拟回复

## 🧪 测试

### 端到端测试
```bash
./test-e2e.sh
```

### 手动测试
1. 启动所有服务: `./start-all.sh`
2. 访问: [http://localhost:3030](http://localhost:3030)
3. 发送测试消息
4. 验证回复和连接状态

### 测试用例
- ✅ 端口监听检查
- ✅ sChat网页可访问性
- ✅ WebSocket连接
- ✅ 消息发送/接收
- ✅ 自动重连机制

## 📊 功能对比

| 功能 | sChat v1 | sChat v2 | 状态 |
|------|----------|----------|------|
| 基本聊天 | ✅ | ✅ | 完成 |
| 消息时间戳 | ❌ | ✅ | 完成 |
| 连接统计 | ❌ | ✅ | 完成 |
| 自动重连 | 基础 | 增强(指数退避) | 完成 |
| 键盘快捷键 | ❌ | ✅ | 完成 |
| 清除聊天 | ❌ | ✅ | 完成 |
| 心跳机制 | ❌ | ✅ | 完成 |

## 🔍 技术细节

### WebSocket消息格式
```json
{
  "type": "user_message",
  "text": "用户消息内容",
  "timestamp": 1772332126737,
  "sessionId": "session_1772332126737"
}
```

### 模拟回复逻辑
当OpenClaw连接不可用时，Santi Channel提供有用的模拟回复：
```javascript
{
  "type": "ai_response",
  "text": "你好！我是AI助手。你刚才说：\"用户消息\"\n\n（这是模拟回复，OpenClaw连接状态：未连接）",
  "timestamp": 1772332126737,
  "isSimulated": true
}
```

### 重连机制
- **最大尝试次数**: 10次
- **重连策略**: 指数退避 (1s, 2s, 4s, ... 最多10s)
- **心跳间隔**: 30秒

## 🚨 已知问题

### OpenClaw集成问题
- **问题**: OpenClaw Gateway认证协议不匹配
- **症状**: `connect.challenge`响应格式错误，连接被拒绝 (code: 1008)
- **临时解决方案**: 禁用OpenClaw连接，使用模拟回复
- **根本解决**: 需要研究OpenClaw插件开发文档

### 端口冲突
- **解决方案**: 使用3030/3333端口，避免与santi-sophon冲突
- **验证**: `./test-e2e.sh`检查端口占用

## 📈 开发路线图

### Phase 1: MVP完成 (当前)
- ✅ 极简架构设计
- ✅ 基础聊天功能
- ✅ 完整文档
- ✅ Git仓库建立

### Phase 2: 功能增强
- [ ] 消息历史存储 (localStorage)
- [ ] 用户身份管理
- [ ] 文件上传支持
- [ ] 主题切换

### Phase 3: OpenClaw集成
- [ ] 研究OpenClaw插件协议
- [ ] 实现正确认证
- [ ] 真实AI回复集成
- [ ] 插件部署脚本

### Phase 4: 生产就绪
- [ ] 错误监控
- [ ] 性能优化
- [ ] 安全加固
- [ ] 部署指南

## 🤝 贡献指南

### 开发流程
1. Fork仓库
2. 创建功能分支: `git checkout -b feature/新功能`
3. 提交更改: `git commit -m '添加新功能'`
4. 推送到分支: `git push origin feature/新功能`
5. 创建Pull Request

### 代码规范
- 使用有意义的提交信息
- 保持代码简洁
- 添加必要的注释
- 更新相关文档

## 📚 文档

完整中文文档位于 `docs/` 目录：

- [01-项目介绍.md](docs/01-项目介绍.md) - 项目背景和目标
- [02-项目概述.md](docs/02-项目概述.md) - 功能特性概述
- [03-架构设计.md](docs/03-架构设计.md) - 技术架构详解
- [04-快速开始.md](docs/04-快速开始.md) - 安装和使用指南
- [05-测试流程.md](docs/05-测试流程.md) - 测试方法和流程

## 📞 支持与反馈

### 问题报告
发现bug或有功能建议？请[创建Issue](https://github.com/xgrlabnew/santi-channel/issues)。

### 开发讨论
欢迎参与讨论和贡献代码！

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

感谢所有为这个项目做出贡献的人！

---

**最后更新**: 2026年3月1日  
**当前版本**: MVP v1.0  
**状态**: 🟢 可测试运行