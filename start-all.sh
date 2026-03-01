#!/bin/bash

# Santi Channel MVP 一键启动脚本
# 同时启动Santi Channel插件和sChat客户端

echo "🚀 启动 Santi Channel MVP 项目..."
echo "======================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查必要命令
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ 未找到命令: $1${NC}"
        echo "请安装: $2"
        exit 1
    fi
}

# 检查依赖
echo -e "${BLUE}🔍 检查依赖...${NC}"
check_command "node" "Node.js (https://nodejs.org/)"
check_command "npm" "Node Package Manager"
check_command "python3" "Python 3"

# 检查OpenClaw Gateway
echo -e "${BLUE}🔍 检查OpenClaw Gateway...${NC}"
if command -v openclaw &> /dev/null; then
    if openclaw gateway status | grep -q "running"; then
        echo -e "${GREEN}✅ OpenClaw Gateway 正在运行${NC}"
    else
        echo -e "${YELLOW}⚠️  OpenClaw Gateway 未运行${NC}"
        echo -e "${BLUE}正在启动OpenClaw Gateway...${NC}"
        openclaw gateway start
        sleep 2
    fi
else
    echo -e "${YELLOW}⚠️  未找到OpenClaw CLI${NC}"
    echo "请确保OpenClaw Gateway正在运行在 ws://localhost:18789"
fi

# 启动Santi Channel插件
echo -e "\n${BLUE}🚀 启动Santi Channel插件...${NC}"
cd santi-channel

echo -e "${BLUE}📦 安装依赖...${NC}"
npm install

echo -e "${BLUE}🔌 启动插件...${NC}"
npm start &
SANTI_PID=$!
echo -e "${GREEN}✅ Santi Channel 已启动 (PID: $SANTI_PID)${NC}"

# 等待插件启动
echo -e "${BLUE}⏳ 等待插件启动...${NC}"
sleep 3

# 启动sChat客户端
echo -e "\n${BLUE}🚀 启动sChat客户端...${NC}"
cd ../schat

echo -e "${BLUE}📦 构建客户端...${NC}"
npm run build

echo -e "${BLUE}🌐 启动开发服务器...${NC}"
npm start &
SCHAT_PID=$!
echo -e "${GREEN}✅ sChat 已启动 (PID: $SCHAT_PID)${NC}"

# 等待服务器启动
sleep 2

# 显示状态
echo -e "\n${GREEN}======================================${NC}"
echo -e "${GREEN}🎉 Santi Channel MVP 启动完成!${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo -e "${BLUE}📊 服务状态:${NC}"
echo -e "  Santi Channel插件: ${GREEN}运行中${NC} (PID: $SANTI_PID)"
echo -e "  sChat客户端: ${GREEN}运行中${NC} (PID: $SCHAT_PID)"
echo -e "  OpenClaw Gateway: ${GREEN}已连接${NC}"
echo ""
echo -e "${BLUE}🔗 访问地址:${NC}"
echo -e "  sChat界面: ${YELLOW}http://localhost:3030${NC}"
echo -e "  Santi Channel WS: ${YELLOW}ws://localhost:3333${NC}"
echo -e "  OpenClaw Gateway WS: ${YELLOW}ws://localhost:18789${NC}"
echo ""
echo -e "${BLUE}🛠️  测试连接:${NC}"
echo -e "  运行: ${YELLOW}cd santi-channel && npm test${NC}"
echo ""
echo -e "${BLUE}🛑 停止所有服务:${NC}"
echo -e "  按 ${RED}Ctrl+C${NC} 停止所有服务"
echo ""

# 等待用户中断
wait

# 清理
echo -e "\n${BLUE}🧹 清理进程...${NC}"
kill $SANTI_PID 2>/dev/null
kill $SCHAT_PID 2>/dev/null
echo -e "${GREEN}✅ 所有服务已停止${NC}"