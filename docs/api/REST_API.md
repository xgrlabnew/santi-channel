# Santi Channel REST API 参考

## 📋 概述

Santi Channel 提供完整的 RESTful API，用于用户管理、消息发送、文件操作等功能。所有 API 都需要认证。

## 🔐 认证

### 认证头
所有 API 请求都需要在 Header 中包含 JWT Token：

```http
Authorization: Bearer {jwt_token}
```

### 获取 Token
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应示例**：
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "username": "testuser",
      "avatar": "https://example.com/avatar.jpg",
      "status": "online"
    }
  },
  "timestamp": 1709337600000
}
```

## 👤 用户管理 API

### 1. 用户注册
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "username": "newuser",
  "avatar": "https://example.com/avatar.jpg"  # 可选
}
```

### 2. 获取当前用户信息
```http
GET /api/v1/users/me
Authorization: Bearer {jwt_token}
```

### 3. 更新用户信息
```http
PATCH /api/v1/users/me
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "username": "newname",
  "avatar": "https://new-avatar.com/image.jpg",
  "status": "away"
}
```

### 4. 搜索用户
```http
GET /api/v1/users/search?q={query}&limit=10&offset=0
Authorization: Bearer {jwt_token}
```

### 5. 获取用户详情
```http
GET /api/v1/users/{userId}
Authorization: Bearer {jwt_token}
```

## 💬 消息 API

### 1. 发送消息
```http
POST /api/v1/messages
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "content": "你好！",
  "receiverId": "550e8400-e29b-41d4-a716-446655440000",  # 一对一聊天
  "groupId": "660e8400-e29b-41d4-a716-446655440001",     # 或群组聊天
  "type": "text",  # text, file, media, location
  "metadata": {    # 可选，附加数据
    "replyTo": "消息ID",
    "mentions": ["用户ID1", "用户ID2"]
  }
}
```

### 2. 获取消息历史
```http
GET /api/v1/messages
Authorization: Bearer {jwt_token}
Query Parameters:
  - receiverId: 用户ID (一对一聊天)
  - groupId: 群组ID (群组聊天)
  - before: 时间戳 (获取此时间之前的消息)
  - after: 时间戳 (获取此时间之后的消息)
  - limit: 数量 (默认50，最大100)
  - offset: 偏移量
```

### 3. 获取单条消息
```http
GET /api/v1/messages/{messageId}
Authorization: Bearer {jwt_token}
```

### 4. 更新消息状态
```http
PATCH /api/v1/messages/{messageId}/status
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "status": "read"  # sent, delivered, read
}
```

### 5. 撤回消息
```http
DELETE /api/v1/messages/{messageId}
Authorization: Bearer {jwt_token}
```

## 📁 文件 API

### 1. 上传文件
```http
POST /api/v1/files/upload
Authorization: Bearer {jwt_token}
Content-Type: multipart/form-data

Form Data:
  - file: 文件内容
  - name: 文件名 (可选)
  - metadata: JSON字符串 (可选)
```

**响应示例**：
```json
{
  "success": true,
  "data": {
    "id": "file_123456789",
    "name": "example.jpg",
    "url": "https://cdn.example.com/files/example.jpg",
    "size": 102400,
    "mimeType": "image/jpeg",
    "thumbnailUrl": "https://cdn.example.com/files/thumbnails/example.jpg",
    "metadata": {
      "width": 1920,
      "height": 1080
    },
    "createdAt": "2026-03-01T12:00:00Z"
  }
}
```

### 2. 分块上传 (大文件)
```http
POST /api/v1/files/upload/chunk
Authorization: Bearer {jwt_token}
Content-Type: multipart/form-data

Form Data:
  - file: 文件分块
  - uploadId: 上传会话ID
  - chunkIndex: 分块索引
  - totalChunks: 总分块数
  - filename: 文件名
```

### 3. 完成分块上传
```http
POST /api/v1/files/upload/complete
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "uploadId": "upload_123456789",
  "filename": "large-video.mp4",
  "totalChunks": 10
}
```

### 4. 获取文件信息
```http
GET /api/v1/files/{fileId}
Authorization: Bearer {jwt_token}
```

### 5. 删除文件
```http
DELETE /api/v1/files/{fileId}
Authorization: Bearer {jwt_token}
```

## 👥 联系人 API

### 1. 获取联系人列表
```http
GET /api/v1/contacts
Authorization: Bearer {jwt_token}
Query Parameters:
  - group: 分组名称
  - search: 搜索关键词
```

### 2. 添加联系人
```http
POST /api/v1/contacts
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "alias": "好友昵称",  # 可选
  "group": "朋友"      # 可选
}
```

### 3. 更新联系人
```http
PATCH /api/v1/contacts/{contactId}
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "alias": "新的昵称",
  "group": "家人"
}
```

### 4. 删除联系人
```http
DELETE /api/v1/contacts/{contactId}
Authorization: Bearer {jwt_token}
```

## 🏢 群组 API

### 1. 创建群组
```http
POST /api/v1/groups
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "name": "开发团队",
  "description": "项目开发讨论群",
  "avatar": "https://example.com/group-avatar.jpg",
  "members": ["用户ID1", "用户ID2", "用户ID3"],
  "isPublic": false,
  "settings": {
    "allowMemberInvite": true,
    "requireApproval": false
  }
}
```

### 2. 获取群组列表
```http
GET /api/v1/groups
Authorization: Bearer {jwt_token}
Query Parameters:
  - type: joined, owned, public
  - search: 搜索关键词
```

### 3. 获取群组详情
```http
GET /api/v1/groups/{groupId}
Authorization: Bearer {jwt_token}
```

### 4. 更新群组信息
```http
PATCH /api/v1/groups/{groupId}
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "name": "新群组名称",
  "description": "新的描述",
  "avatar": "新的头像URL",
  "settings": {
    "allowMemberInvite": false
  }
}
```

### 5. 添加群组成员
```http
POST /api/v1/groups/{groupId}/members
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "userId": "新成员用户ID",
  "role": "member"  # member, admin
}
```

### 6. 移除群组成员
```http
DELETE /api/v1/groups/{groupId}/members/{userId}
Authorization: Bearer {jwt_token}
```

### 7. 退出群组
```http
DELETE /api/v1/groups/{groupId}/members/me
Authorization: Bearer {jwt_token}
```

## 🤖 AI 助手 API

### 1. 获取可用 AI 助手
```http
GET /api/v1/ai/assistants
Authorization: Bearer {jwt_token}
```

### 2. 与 AI 对话
```http
POST /api/v1/ai/conversations
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "assistantId": "claude-3-5-sonnet",  # 或 gpt-4, gemini-pro 等
  "message": "你好，AI助手！",
  "context": {  # 可选，对话上下文
    "previousMessages": [
      {"role": "user", "content": "之前的问题"},
      {"role": "assistant", "content": "之前的回答"}
    ]
  },
  "settings": {  # 可选，AI设置
    "temperature": 0.7,
    "maxTokens": 1000
  }
}
```

### 3. 流式 AI 响应
```http
POST /api/v1/ai/conversations/stream
Authorization: Bearer {jwt_token}
Content-Type: application/json
Accept: text/event-stream

{
  "assistantId": "claude-3-5-sonnet",
  "message": "写一个关于AI的故事"
}
```

**SSE 响应格式**：
```
event: chunk
data: {"content": "从前", "chunkId": 1}

event: chunk
data: {"content": "有一个", "chunkId": 2}

event: complete
data: {"messageId": "msg_123", "totalChunks": 10}
```

### 4. 获取对话历史
```http
GET /api/v1/ai/conversations/{conversationId}/messages
Authorization: Bearer {jwt_token}
Query Parameters:
  - limit: 数量
  - before: 时间戳
```

## 📊 统计 API

### 1. 用户统计
```http
GET /api/v1/stats/users
Authorization: Bearer {jwt_token}
```

**响应示例**：
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "activeToday": 45,
    "newThisWeek": 23,
    "onlineNow": 12
  }
}
```

### 2. 消息统计
```http
GET /api/v1/stats/messages
Authorization: Bearer {jwt_token}
Query Parameters:
  - period: day, week, month, year
  - startDate: 开始日期
  - endDate: 结束日期
```

### 3. 系统健康状态
```http
GET /api/v1/health
```

## ⚙️ 设置 API

### 1. 获取用户设置
```http
GET /api/v1/settings
Authorization: Bearer {jwt_token}
```

### 2. 更新用户设置
```http
PUT /api/v1/settings
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "notifications": {
    "message": true,
    "group": true,
    "mention": true,
    "sound": false
  },
  "privacy": {
    "onlineStatus": "contacts",  # everyone, contacts, none
    "readReceipts": true,
    "typingIndicator": true
  },
  "appearance": {
    "theme": "dark",
    "language": "zh-CN",
    "fontSize": "medium"
  }
}
```

## 🔔 通知 API

### 1. 获取未读通知
```http
GET /api/v1/notifications
Authorization: Bearer {jwt_token}
Query Parameters:
  - unreadOnly: true/false
  - limit: 数量
```

### 2. 标记通知为已读
```http
PATCH /api/v1/notifications/{notificationId}/read
Authorization: Bearer {jwt_token}
```

### 3. 标记所有通知为已读
```http
POST /api/v1/notifications/read-all
Authorization: Bearer {jwt_token}
```

## 🚨 错误处理

### 错误响应格式
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "请求参数验证失败",
    "details": {
      "email": ["邮箱格式不正确"],
      "password": ["密码长度至少8位"]
    },
    "timestamp": 1709337600000
  }
}
```

### 常见错误码
| 错误码 | HTTP 状态 | 描述 |
|--------|-----------|------|
| `AUTH_REQUIRED` | 401 | 需要认证 |
| `INVALID_TOKEN` | 401 | Token无效或已过期 |
| `PERMISSION_DENIED` | 403 | 权限不足 |
| `RESOURCE_NOT_FOUND` | 404 | 资源不存在 |
| `VALIDATION_ERROR` | 422 | 参数验证失败 |
| `RATE_LIMIT_EXCEEDED` | 429 | 请求频率超限 |
| `INTERNAL_ERROR` | 500 | 服务器内部错误 |

## 📝 请求限制

### 速率限制
- 认证 API: 10次/分钟
- 消息 API: 60次/分钟
- 文件 API: 20次/分钟
- 其他 API: 30次/分钟

### 文件大小限制
- 图片: 10MB
- 文档: 50MB
- 音频: 100MB
- 视频: 500MB

### 消息长度限制
- 文字消息: 10,000字符
- 群组名称: 100字符
- 用户昵称: 50字符

## 🔗 WebSocket 集成

REST API 与 WebSocket 紧密集成。通过 REST API 发送的消息会实时推送到相关用户的 WebSocket 连接。

### 消息推送示例
```javascript
// WebSocket 接收的消息格式
{
  "type": "message",
  "payload": {
    "id": "msg_123456789",
    "content": "你好！",
    "sender": {
      "id": "user_123",
      "username": "发送者",
      "avatar": "https://..."
    },
    "receiverId": "user_456",
    "timestamp": 1709337600000,
    "status": "sent"
  }
}
```

## 📚 更多资源

- [WebSocket API 文档](./WEBSOCKET_API.md)
- [消息格式规范](./MESSAGE_FORMAT.md)
- [客户端 SDK 文档](../guides/CLIENT_INTEGRATION.md)
- [API 测试工具](../examples/API_TESTING.md)

---

*API 文档版本: v0.1.0 | 最后更新: 2026年3月1日*