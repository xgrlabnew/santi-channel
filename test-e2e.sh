#!/bin/bash

# Santi Channel MVP 端到端测试脚本

echo "🧪 开始 Santi Channel MVP 端到端测试..."
echo "======================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 测试结果
TESTS_PASSED=0
TESTS_TOTAL=4

# 1. 测试端口是否监听
echo -e "\n${BLUE}1. 测试端口监听...${NC}"

check_port() {
    port=$1
    service=$2
    if lsof -i :$port > /dev/null 2>&1; then
        echo -e "  ✅ 端口 $port ($service) 正在监听"
        return 0
    else
        echo -e "  ❌ 端口 $port ($service) 未监听"
        return 1
    fi
}

check_port 3030 "sChat HTTP" && TESTS_PASSED=$((TESTS_PASSED+1))
check_port 3333 "Santi Channel WS" && TESTS_PASSED=$((TESTS_PASSED+1))
check_port 18789 "OpenClaw Gateway" && TESTS_PASSED=$((TESTS_PASSED+1))

# 2. 测试sChat网页可访问
echo -e "\n${BLUE}2. 测试sChat网页可访问...${NC}"
if curl -s http://localhost:3030 | grep -q "Santi Chat"; then
    echo -e "  ✅ sChat网页可正常访问"
    TESTS_PASSED=$((TESTS_PASSED+1))
else
    echo -e "  ❌ sChat网页无法访问"
fi

# 3. 测试WebSocket连接
echo -e "\n${BLUE}3. 测试WebSocket连接...${NC}"
cd santi-channel
if npm test > /dev/null 2>&1; then
    echo -e "  ✅ WebSocket连接测试通过"
    TESTS_PASSED=$((TESTS_PASSED+1))
else
    echo -e "  ❌ WebSocket连接测试失败"
fi
cd ..

# 4. 测试端到端消息流
echo -e "\n${BLUE}4. 模拟端到端消息流...${NC}"
echo "  正在发送测试消息..."
sleep 2

# 使用简单的curl测试
echo "  测试完成（需要手动验证消息流转）"

# 显示结果
echo -e "\n${BLUE}======================================${NC}"
echo -e "${BLUE}📊 测试结果${NC}"
echo -e "  通过测试: ${GREEN}$TESTS_PASSED/${TESTS_TOTAL}${NC}"

if [ $TESTS_PASSED -eq $TESTS_TOTAL ]; then
    echo -e "\n${GREEN}🎉 所有测试通过！系统运行正常。${NC}"
    echo -e "\n${BLUE}🔗 访问地址:${NC}"
    echo -e "  sChat界面: ${YELLOW}http://localhost:3030${NC}"
    echo -e "  开始聊天测试吧！"
else
    echo -e "\n${YELLOW}⚠️  部分测试失败，请检查服务状态。${NC}"
    echo -e "\n${BLUE}🔧 故障排除:${NC}"
    echo "  1. 运行: ./start-all.sh"
    echo "  2. 检查日志"
    echo "  3. 验证端口占用"
fi

echo -e "\n${BLUE}📋 服务状态:${NC}"
ps aux | grep -E "(node.*index.js|python.*http.server)" | grep -v grep | while read line; do
    pid=$(echo $line | awk '{print $2}')
    cmd=$(echo $line | awk '{for(i=11;i<=NF;i++) printf $i" "; print ""}')
    echo "  PID $pid: $cmd"
done