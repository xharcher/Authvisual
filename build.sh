#!/bin/bash

# 权限管理系统构建脚本
# 适用于 RockyLinux / CentOS / Ubuntu 等 Linux 系统

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 错误处理
trap 'print_error "构建失败！请查看上面的错误信息。"' ERR

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  权限管理系统 - 构建脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 1. 检查 Node.js
print_info "检查 Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js 未安装"
    echo ""
    echo "请安装 Node.js 18 或更高版本："
    echo "  curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -"
    echo "  sudo dnf install -y nodejs"
    exit 1
fi

NODE_VERSION=$(node --version)
print_success "Node.js 版本: $NODE_VERSION"

# 检查 Node.js 版本
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_MAJOR" -lt 18 ]; then
    print_error "Node.js 版本太低（需要 >= 18.0.0）"
    exit 1
fi

# 2. 检查 npm
if ! command -v npm &> /dev/null; then
    print_error "npm 未安装"
    exit 1
fi

NPM_VERSION=$(npm --version)
print_success "npm 版本: $NPM_VERSION"

# 3. 检查磁盘空间
print_info "检查磁盘空间..."
AVAILABLE_SPACE=$(df -BG . | tail -1 | awk '{print $4}' | sed 's/G//')
if [ "$AVAILABLE_SPACE" -lt 2 ]; then
    print_warning "磁盘空间不足 2GB，可能导致构建失败"
fi

# 4. 清理旧文件
print_info "清理旧的构建文件..."
rm -rf dist

# 询问是否清理 node_modules
if [ -d "node_modules" ]; then
    print_warning "检测到 node_modules 目录已存在"
    read -p "是否删除并重新安装依赖？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "清理 node_modules..."
        rm -rf node_modules package-lock.json
    fi
fi

# 5. 检查网络（可选）
print_info "测试 npm 仓库连接..."
if ! npm ping &> /dev/null; then
    print_warning "npm 仓库连接失败，尝试使用国内镜像..."
    npm config set registry https://registry.npmmirror.com
    print_success "已切换到淘宝镜像"
fi

# 6. 安装依赖
print_info "安装项目依赖（这可能需要几分钟）..."
if npm install; then
    print_success "依赖安装成功"
else
    print_error "依赖安装失败"
    echo ""
    echo "请尝试以下解决方案："
    echo "  1. 清理 npm 缓存: npm cache clean --force"
    echo "  2. 删除 node_modules: rm -rf node_modules package-lock.json"
    echo "  3. 使用国内镜像: npm config set registry https://registry.npmmirror.com"
    exit 1
fi

# 7. 验证 vite
print_info "验证 vite 安装..."
if npx vite --version &> /dev/null; then
    VITE_VERSION=$(npx vite --version)
    print_success "vite 版本: $VITE_VERSION"
else
    print_error "vite 未正确安装"
    echo ""
    echo "请手动安装 vite:"
    echo "  npm install vite --save-dev"
    exit 1
fi

# 8. 设置环境变量（增加内存限制）
export NODE_OPTIONS="--max-old-space-size=4096"
print_info "已设置 Node.js 内存限制: 4GB"

# 9. 开始构建
print_info "开始构建项目..."
echo ""

if npm run build; then
    print_success "构建成功！"
else
    print_error "构建失败"
    exit 1
fi

# 10. 验证构建结果
print_info "验证构建结果..."

if [ ! -d "dist" ]; then
    print_error "dist 目录不存在"
    exit 1
fi

if [ ! -f "dist/index.html" ]; then
    print_error "dist/index.html 不存在"
    exit 1
fi

print_success "构建产物验证通过"

# 11. 显示构建信息
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  构建完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
print_info "构建产物位置: $(pwd)/dist"
echo ""
print_info "构建产物大小:"
du -sh dist/
echo ""
print_info "主要文件:"
ls -lh dist/index.html 2>/dev/null || true
ls -lh dist/assets/*.js 2>/dev/null | head -5 || true
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  后续步骤${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "1. 部署到 Nginx:"
echo "   sudo cp -r dist/* /var/www/html/"
echo ""
echo "2. 使用 Docker:"
echo "   docker-compose up -d --build"
echo ""
echo "3. 上传到服务器:"
echo "   scp -r dist/* user@server:/var/www/html/"
echo ""
