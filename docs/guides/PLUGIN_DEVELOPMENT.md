# Santi Channel 插件开发指南

## 🎯 概述

本指南将帮助你开发 Santi Channel 插件，扩展 Santi Channel 的功能。

## 🏗️ 插件架构

### 插件类型
1. **消息处理器插件** - 处理特定类型的消息
2. **认证插件** - 自定义认证方式
3. **存储插件** - 自定义数据存储
4. **通知插件** - 自定义通知方式
5. **AI 集成插件** - 集成其他 AI 服务
6. **第三方服务插件** - 集成外部服务

### 插件结构
```
my-santi-plugin/
├── src/
│   ├── index.ts              # 插件主入口
│   ├── types.ts              # 类型定义
│   ├── handlers/             # 处理器
│   │   ├── message.ts        # 消息处理器
│   │   └── event.ts          # 事件处理器
│   ├── services/             # 服务层
│   │   └── my-service.ts
│   └── utils/                # 工具函数
│       └── helpers.ts
├── tests/                    # 测试文件
│   └── plugin.test.ts
├── package.json              # 插件配置
├── tsconfig.json             # TypeScript 配置
├── README.md                 # 插件文档
└── plugin.config.json        # 插件配置文件
```

## 🚀 创建第一个插件

### 步骤1：初始化插件项目
```bash
# 创建插件目录
mkdir my-message-plugin
cd my-message-plugin

# 初始化 package.json
npm init -y

# 安装依赖
npm install @santi-channel/sdk typescript ts-node
npm install -D @types/node jest ts-jest

# 创建 TypeScript 配置
npx tsc --init
```

### 步骤2：创建插件配置文件
```json
// plugin.config.json
{
  "name": "my-message-plugin",
  "version": "1.0.0",
  "description": "自定义消息处理插件",
  "author": "Your Name",
  "license": "MIT",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "santi": {
    "pluginType": "message",
    "apiVersion": "1.0.0",
    "dependencies": [],
    "configSchema": {
      "type": "object",
      "properties": {
        "enabled": {
          "type": "boolean",
          "default": true
        },
        "customSetting": {
          "type": "string",
          "default": "default-value"
        }
      }
    }
  }
}
```

### 步骤3：实现插件主入口
```typescript
// src/index.ts
import { SantiPlugin, PluginConfig, Message, PluginContext } from '@santi-channel/sdk';

export interface MyPluginConfig {
  enabled: boolean;
  customSetting: string;
}

export class MyMessagePlugin implements SantiPlugin<MyPluginConfig> {
  name = 'my-message-plugin';
  version = '1.0.0';
  
  private config: MyPluginConfig;
  private context: PluginContext;

  async initialize(config: MyPluginConfig, context: PluginContext): Promise<void> {
    this.config = config;
    this.context = context;
    
    console.log(`插件 ${this.name} 已初始化`);
    console.log('配置:', config);
    
    // 注册消息处理器
    context.registerMessageHandler('text', this.handleTextMessage.bind(this));
    context.registerMessageHandler('file', this.handleFileMessage.bind(this));
    
    // 注册事件监听器
    context.on('user:connected', this.handleUserConnected.bind(this));
    context.on('user:disconnected', this.handleUserDisconnected.bind(this));
  }

  async start(): Promise<void> {
    console.log(`插件 ${this.name} 已启动`);
    
    // 启动定时任务
    this.startScheduledTask();
  }

  async stop(): Promise<void> {
    console.log(`插件 ${this.name} 已停止`);
    
    // 清理资源
    this.cleanup();
  }

  // 消息处理器
  private async handleTextMessage(message: Message): Promise<void> {
    if (!this.config.enabled) return;
    
    console.log('处理文本消息:', message);
    
    // 示例：自动回复特定关键词
    if (message.content?.includes('你好')) {
      const reply: Message = {
        id: this.context.generateId(),
        type: 'text',
        content: '你好！我是自动回复插件。',
        sender: {
          id: 'system',
          type: 'system',
          name: '自动回复'
        },
        receiverId: message.sender.id,
        timestamp: Date.now()
      };
      
      await this.context.sendMessage(reply);
    }
    
    // 示例：消息内容转换
    if (this.config.customSetting === 'uppercase') {
      message.content = message.content?.toUpperCase();
    }
  }

  private async handleFileMessage(message: Message): Promise<void> {
    console.log('处理文件消息:', message);
    
    // 示例：文件类型检查
    const fileType = message.metadata?.fileType;
    if (fileType === 'image') {
      // 生成缩略图
      await this.generateThumbnail(message);
    }
  }

  // 事件处理器
  private async handleUserConnected(userId: string): Promise<void> {
    console.log(`用户 ${userId} 已连接`);
    
    // 发送欢迎消息
    const welcomeMessage: Message = {
      id: this.context.generateId(),
      type: 'text',
      content: '欢迎使用 Santi Channel！',
      sender: {
        id: 'system',
        type: 'system',
        name: '系统'
      },
      receiverId: userId,
      timestamp: Date.now()
    };
    
    await this.context.sendMessage(welcomeMessage);
  }

  private async handleUserDisconnected(userId: string): Promise<void> {
    console.log(`用户 ${userId} 已断开连接`);
    
    // 清理用户相关资源
    await this.cleanupUserResources(userId);
  }

  // 定时任务
  private startScheduledTask(): void {
    setInterval(async () => {
      if (!this.config.enabled) return;
      
      // 每小时执行一次的任务
      await this.performHourlyTask();
    }, 60 * 60 * 1000); // 1小时
  }

  private async performHourlyTask(): Promise<void> {
    console.log('执行定时任务');
    
    // 示例：发送系统通知
    const notification: Message = {
      id: this.context.generateId(),
      type: 'system',
      content: '系统维护通知',
      sender: {
        id: 'system',
        type: 'system',
        name: '系统管理员'
      },
      receiverId: 'broadcast', // 广播给所有用户
      timestamp: Date.now(),
      metadata: {
        priority: 'low',
        category: 'maintenance'
      }
    };
    
    await this.context.broadcastMessage(notification);
  }

  // 工具方法
  private async generateThumbnail(message: Message): Promise<void> {
    // 实现缩略图生成逻辑
    console.log('生成缩略图:', message.id);
  }

  private async cleanupUserResources(userId: string): Promise<void> {
    // 清理用户资源
    console.log('清理用户资源:', userId);
  }

  private cleanup(): void {
    // 清理插件资源
    console.log('清理插件资源');
  }
}

// 插件工厂函数
export function createPlugin(): SantiPlugin<MyPluginConfig> {
  return new MyMessagePlugin();
}
```

### 步骤4：创建类型定义
```typescript
// src/types.ts
export interface PluginMetadata {
  name: string;
  version: string;
  description?: string;
  author?: string;
  homepage?: string;
}

export interface PluginConfig {
  enabled: boolean;
  [key: string]: any;
}

export interface PluginContext {
  // 消息相关
  sendMessage(message: Message): Promise<void>;
  broadcastMessage(message: Message): Promise<void>;
  registerMessageHandler(type: string, handler: MessageHandler): void;
  
  // 事件相关
  on(event: string, handler: EventHandler): void;
  off(event: string, handler: EventHandler): void;
  emit(event: string, data: any): void;
  
  // 工具方法
  generateId(): string;
  getConfig(): any;
  getLogger(): Logger;
  
  // 存储访问
  getStorage(): Storage;
  getDatabase(): Database;
  
  // 用户管理
  getUser(userId: string): Promise<User | null>;
  getOnlineUsers(): Promise<User[]>;
}

export type MessageHandler = (message: Message) => Promise<void>;
export type EventHandler = (data: any) => Promise<void>;
```

### 步骤5：构建插件
```json
// package.json 构建脚本
{
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "jest",
    "lint": "eslint src/**/*.ts",
    "prepublishOnly": "npm run build && npm test"
  }
}
```

```bash
# 构建插件
npm run build

# 输出到 dist 目录
```

## 🔌 插件配置

### 配置文件示例
```yaml
# santi-config.yaml
plugins:
  my-message-plugin:
    enabled: true
    customSetting: "uppercase"
    # 其他插件特定配置
```

### 环境变量配置
```bash
# 插件配置可以通过环境变量覆盖
export SANTI_PLUGIN_MY_MESSAGE_PLUGIN_ENABLED=true
export SANTI_PLUGIN_MY_MESSAGE_PLUGIN_CUSTOM_SETTING=uppercase
```

## 🧪 测试插件

### 单元测试
```typescript
// tests/plugin.test.ts
import { MyMessagePlugin } from '../src/index';
import { PluginContext } from '@santi-channel/sdk';

describe('MyMessagePlugin', () => {
  let plugin: MyMessagePlugin;
  let mockContext: jest.Mocked<PluginContext>;

  beforeEach(() => {
    plugin = new MyMessagePlugin();
    mockContext = {
      sendMessage: jest.fn(),
      registerMessageHandler: jest.fn(),
      on: jest.fn(),
      generateId: jest.fn().mockReturnValue('test-id')
    } as any;
  });

  test('应该正确初始化', async () => {
    const config = { enabled: true, customSetting: 'test' };
    await plugin.initialize(config, mockContext);
    
    expect(mockContext.registerMessageHandler).toHaveBeenCalledWith(
      'text',
      expect.any(Function)
    );
  });

  test('应该处理文本消息', async () => {
    const config = { enabled: true, customSetting: 'uppercase' };
    await plugin.initialize(config, mockContext);
    
    const message = {
      id: 'msg-1',
      type: 'text' as const,
      content: 'hello world',
      sender: { id: 'user-1', type: 'user' as const },
      receiverId: 'user-2',
      timestamp: Date.now()
    };
    
    // 调用消息处理器
    const handler = mockContext.registerMessageHandler.mock.calls[0][1];
    await handler(message);
    
    // 验证消息被处理
    expect(message.content).toBe('HELLO WORLD');
  });
});
```

### 集成测试
```typescript
// tests/integration.test.ts
import { SantiServer } from '@santi-channel/server';
import { MyMessagePlugin } from '../src/index';

describe('插件集成测试', () => {
  let server: SantiServer;

  beforeAll(async () => {
    server = new SantiServer({
      port: 3000,
      plugins: [
        {
          name: 'my-message-plugin',
          plugin: MyMessagePlugin,
          config: { enabled: true }
        }
      ]
    });
    
    await server.start();
  });

  afterAll(async () => {
    await server.stop();
  });

  test('插件应该与服务器正常集成', async () => {
    // 测试插件功能
    const response = await fetch('http://localhost:3000/api/v1/plugins');
    const plugins = await response.json();
    
    expect(plugins).toContainEqual(
      expect.objectContaining({
        name: 'my-message-plugin',
        enabled: true
      })
    );
  });
});
```

## 📦 发布插件

### 1. 准备发布
```bash
# 更新版本号
npm version patch  # 或 minor, major

# 运行测试
npm test

# 构建
npm run build

# 检查包内容
npm pack --dry-run
```

### 2. 发布到 npm
```bash
# 登录 npm
npm login

# 发布
npm publish

# 或发布到私有仓库
npm publish --registry https://your-registry.com
```

### 3. 发布到 Santi 插件市场
```json
// 创建插件清单
{
  "name": "my-message-plugin",
  "displayName": "我的消息插件",
  "description": "一个自定义消息处理插件",
  "version": "1.0.0",
  "author": "Your Name",
  "repository": "https://github.com/yourname/my-message-plugin",
  "keywords": ["santi", "plugin", "message"],
  "category": "message",
  "compatibility": {
    "santi": "^1.0.0"
  }
}
```

## 🔧 调试插件

### 开发模式
```bash
# 使用 nodemon 自动重启
npm install -D nodemon

# package.json
{
  "scripts": {
    "dev": "nodemon --watch src --ext ts --exec 'ts-node src/index.ts'"
  }
}
```

### 调试配置
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "调试插件",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/src/index.ts",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "runtimeArgs": ["-r", "ts-node/register"],
      "env": {
        "NODE_ENV": "development",
        "DEBUG": "santi:*"
      }
    }
  ]
}
```

### 日志调试
```typescript
// 在插件中使用日志
import { createLogger } from '@santi-channel/sdk';

const logger = createLogger('my-plugin');

logger.info('插件初始化');
logger.debug('配置信息:', config);
logger.error('处理消息失败:', error);
```

## 🎨 插件示例

### 示例1：天气插件
```typescript
export class WeatherPlugin implements SantiPlugin {
  async handleTextMessage(message: Message): Promise<void> {
    if (message.content?.startsWith('天气')) {
      const city = message.content.replace('天气', '').trim();
      const weather = await this.getWeather(city);
      
      const reply: Message = {
        type: 'text',
        content: `${city}的天气：${weather}`,
        sender: { id: 'weather-bot', type: 'bot' },
        receiverId: message.sender.id
      };
      
      await this.context.sendMessage(reply);
    }
  }
  
  private async getWeather(city: string): Promise<string> {
    // 调用天气 API
    return '晴，25°C';
  }
}
```

### 示例2：翻译插件
```typescript
export class TranslationPlugin implements SantiPlugin {
  async handleTextMessage(message: Message): Promise<void> {
    if (message.metadata?.translate) {
      const translated = await this.translate(
        message.content,
        message.metadata.targetLang
      );
      
      message.content = translated;
    }
  }
}
```

### 示例3：自动 moderation 插件
```typescript
export class ModerationPlugin implements SantiPlugin {
  async handleTextMessage(message: Message): Promise<void> {
    const isInappropriate = await this.checkContent(message.content);
    
    if (isInappropriate) {
      // 删除不当消息
      await this.context.deleteMessage(message.id);
      
      // 警告用户
      await this.context.sendWarning(message.sender.id);
    }
  }
}
```

## 📚 最佳实践

### 1. 错误处理
```typescript
try {
  await this.processMessage(message);
} catch (error) {
  this.logger.error('处理消息失败:', error);
  
  // 发送错误通知
  await this.context.sendErrorNotification({
    plugin: this.name,
    error: error.message,
    messageId: message.id
  });
  
  // 不阻断消息流
  throw error;
}
```

### 2. 性能优化
```typescript
// 使用缓存
private cache = new Map<string, any>();

async getCachedData(key: string, fetcher: () => Promise<any>): Promise<any> {
  if (this.cache.has(key)) {
    return this.cache.get(key);
  }
  
  const data = await fetcher();
  this.cache.set(key, data);
  
  // 设置缓存过期
  setTimeout(() => this.cache.delete(key), 5 * 60 * 1000);
  
  return data;
}
```

### 3. 资源管理
```typescript
private resources: Set<any> = new Set();

async initialize() {
  // 创建资源
  const resource = await this.createResource();
  this.resources.add(resource);
}

async stop() {
  // 清理所有资源
  for (const resource of this.resources) {
    await this.cleanupResource(resource);
  }
  this.resources.clear();
}
```

## 🔗 更多资源

- [插件 API 参考](../api/PLUGIN_API.md)
- [插件配置规范](../specs/PLUGIN_SPEC.md)
- [插件示例代码](../examples/)
- [插件开发模板](https://github.com/santi-channel/