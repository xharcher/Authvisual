#!/bin/bash

# vite 构建问题快速修复脚本
# 专为 "vite: command not found" 错误设计

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  vite 构建问题快速修复${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ 错误: Node.js 未安装${NC}"
    echo ""
    echo "请先安装 Node.js 18 或更高版本："
    echo "  curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -"
    echo "  sudo dnf install -y nodejs"
    exit 1
fi

echo -e "${GREEN}✅ Node.js 版本: $(node --version)${NC}"
echo -e "${GREEN}✅ npm 版本: $(npm --version)${NC}"
echo ""

# 清理
echo -e "${YELLOW}🧹 步骤 1/5: 清理旧文件...${NC}"
rm -rf node_modules package-lock.json dist
echo -e "${GREEN}✅ 清理完成${NC}"
echo ""

# 配置镜像
echo -e "${YELLOW}🌐 步骤 2/5: 配置 npm 镜像...${NC}"
npm config set registry https://registry.npmmirror.com
echo -e "${GREEN}✅ 已切换到淘宝镜像${NC}"
echo ""

# 清理缓存
echo -e "${YELLOW}🗑️  步骤 3/5: 清理 npm 缓存...${NC}"
npm cache clean --force
echo -e "${GREEN}✅ 缓存已清理${NC}"
echo ""

# 安装依赖
echo -e "${YELLOW}📦 步骤 4/5: 安装依赖（这可能需要几分钟）...${NC}"
if npm install; then
    echo -e "${GREEN}✅ 依赖安装成功${NC}"
else
    echo -e "${RED}❌ 依赖安装失败${NC}"
    exit 1
fi
echo ""

# 验证 vite
echo -e "${YELLOW}🔍 验证 vite 安装...${NC}"
if npx vite --version &> /dev/null; then
    VITE_VERSION=$(npx vite --version)
    echo -e "${GREEN}✅ vite 已安装: $VITE_VERSION${NC}"
else
    echo -e "${RED}❌ vite 验证失败${NC}"
    exit 1
fi
echo ""

# 构建
echo -e "${YELLOW}🔨 步骤 5/5: 构建项目...${NC}"
export NODE_OPTIONS="--max-old-space-size=4096"

if npm run build; then
    echo -e "${GREEN}✅ 构建成功！${NC}"
else
    echo -e "${RED}❌ 构建失败${NC}"
    exit 1
fi
echo ""

# 验证结果
if [ -f "dist/index.html" ]; then
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  修复成功！✅${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo "📁 构建产物位置: $(pwd)/dist"
    echo "📊 构建产物大小: $(du -sh dist | cut -f1)"
    echo ""
    echo "🚀 后续步骤："
    echo "  1. 部署: sudo cp -r dist/* /var/www/html/"
    echo "  2. 或使用: ./deploy.sh"
    echo ""
else
    echo -e "${RED}❌ 构建产物验证失败${NC}"
    exit 1
fi
