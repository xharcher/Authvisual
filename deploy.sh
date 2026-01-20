#!/bin/bash

# 权限管理系统部署脚本
# 使用方法: ./deploy.sh

# ==================== 配置区域 ====================
# 请根据实际情况修改以下配置
SERVER_USER="your-username"          # SSH 用户名
SERVER_IP="your-server-ip"           # 服务器IP地址
SERVER_PATH="/var/www/permission-system"  # 服务器部署路径
USE_NGINX=true                       # 是否使用 Nginx (true/false)
# =================================================

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 错误处理
set -e
trap 'echo -e "${RED}❌ 部署失败！${NC}"' ERR

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   权限管理系统 - 自动部署脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查配置
if [ "$SERVER_USER" == "your-username" ] || [ "$SERVER_IP" == "your-server-ip" ]; then
    echo -e "${RED}❌ 错误: 请先在脚本中配置服务器信息${NC}"
    echo -e "${YELLOW}请编辑 deploy.sh 文件，修改以下变量：${NC}"
    echo -e "  - SERVER_USER"
    echo -e "  - SERVER_IP"
    echo -e "  - SERVER_PATH"
    exit 1
fi

# 步骤 1: 清理旧的构建文件
echo -e "${YELLOW}🧹 清理旧的构建文件...${NC}"
rm -rf dist

# 步骤 2: 安装依赖
echo -e "${YELLOW}📦 安装依赖...${NC}"
if command -v pnpm &> /dev/null; then
    pnpm install
elif command -v yarn &> /dev/null; then
    yarn install
else
    npm install
fi

# 步骤 3: 构建项目
echo -e "${YELLOW}🔨 构建项目...${NC}"
if command -v pnpm &> /dev/null; then
    pnpm build
elif command -v yarn &> /dev/null; then
    yarn build
else
    npm run build
fi

# 检查构建是否成功
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ 构建失败: dist 目录不存在${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 构建完成${NC}"

# 步骤 4: 连接测试
echo -e "${YELLOW}🔗 测试服务器连接...${NC}"
if ssh -o ConnectTimeout=5 $SERVER_USER@$SERVER_IP "echo '连接成功'" &> /dev/null; then
    echo -e "${GREEN}✅ 服务器连接正常${NC}"
else
    echo -e "${RED}❌ 无法连接到服务器${NC}"
    exit 1
fi

# 步骤 5: 创建服务器目录
echo -e "${YELLOW}📁 创建服务器目录...${NC}"
ssh $SERVER_USER@$SERVER_IP "mkdir -p $SERVER_PATH"

# 步骤 6: 备份旧版本
echo -e "${YELLOW}💾 备份旧版本...${NC}"
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
ssh $SERVER_USER@$SERVER_IP "
    if [ -d $SERVER_PATH/dist ]; then
        mkdir -p $SERVER_PATH/backups
        mv $SERVER_PATH/dist $SERVER_PATH/backups/dist_$BACKUP_DATE
        echo '备份完成: dist_$BACKUP_DATE'
    else
        echo '无需备份: 未找到旧版本'
    fi
"

# 步骤 7: 上传文件
echo -e "${YELLOW}📤 上传文件到服务器...${NC}"
rsync -avz --progress dist/ $SERVER_USER@$SERVER_IP:$SERVER_PATH/dist/

echo -e "${GREEN}✅ 文件上传完成${NC}"

# 步骤 8: 重启服务
if [ "$USE_NGINX" = true ]; then
    echo -e "${YELLOW}🔄 重启 Nginx...${NC}"
    ssh $SERVER_USER@$SERVER_IP "sudo systemctl restart nginx" || {
        echo -e "${YELLOW}⚠️  Nginx 重启失败，可能需要手动重启${NC}"
    }
fi

# 步骤 9: 验证部署
echo -e "${YELLOW}🔍 验证部署...${NC}"
ssh $SERVER_USER@$SERVER_IP "
    if [ -f $SERVER_PATH/dist/index.html ]; then
        echo '✅ index.html 存在'
    else
        echo '❌ index.html 不存在'
        exit 1
    fi
"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   ✅ 部署成功！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "📊 部署信息:"
echo -e "  服务器: ${GREEN}$SERVER_USER@$SERVER_IP${NC}"
echo -e "  路径: ${GREEN}$SERVER_PATH${NC}"
echo -e "  备份: ${GREEN}dist_$BACKUP_DATE${NC}"
echo ""
echo -e "🌐 访问地址:"
echo -e "  ${GREEN}http://$SERVER_IP${NC}"
echo ""
echo -e "📝 后续操作:"
echo -e "  查看 Nginx 日志: ${YELLOW}ssh $SERVER_USER@$SERVER_IP 'sudo tail -f /var/log/nginx/error.log'${NC}"
echo -e "  回滚到备份: ${YELLOW}ssh $SERVER_USER@$SERVER_IP 'mv $SERVER_PATH/backups/dist_$BACKUP_DATE $SERVER_PATH/dist'${NC}"
echo ""
