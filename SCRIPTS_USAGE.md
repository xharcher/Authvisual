# 脚本使用指南

本项目提供了多个自动化脚本，帮助您快速构建和部署应用。

## 📜 可用脚本列表

| 脚本名称 | 用途 | 适用场景 |
|---------|------|---------|
| `build.sh` | 自动化构建脚本 | 本地或服务器构建 |
| `deploy.sh` | 自动化部署脚本 | 部署到远程服务器 |
| `quick-fix.sh` | 快速修复 vite 问题 | RockyLinux 构建错误 |

---

## 🔧 脚本详细说明

### 1. build.sh - 自动化构建脚本

**功能**:
- ✅ 检查 Node.js 和 npm 版本
- ✅ 检查磁盘空间
- ✅ 清理旧文件（可选）
- ✅ 测试 npm 仓库连接
- ✅ 安装依赖
- ✅ 验证 vite 安装
- ✅ 执行构建
- ✅ 验证构建结果

**使用方法**:
```bash
# 添加执行权限
chmod +x build.sh

# 运行脚本
./build.sh
```

**适用场景**:
- ✅ 首次构建项目
- ✅ 在服务器上构建
- ✅ 需要详细的构建日志
- ✅ 自动化 CI/CD 流程

**输出**:
```
========================================
  权限管理系统 - 构建脚本
========================================

✅ Node.js 版本: v18.x.x
✅ npm 版本: 9.x.x
ℹ️  检查磁盘空间...
...
✅ 构建成功！
📦 构建产物位置: /path/to/dist
```

---

### 2. deploy.sh - 自动化部署脚本

**功能**:
- ✅ 本地构建项目
- ✅ 验证服务器连接
- ✅ 自动备份旧版本
- ✅ 上传文件到服务器
- ✅ 重启 Nginx 服务
- ✅ 验证部署结果

**使用方法**:

**步骤 1**: 修改配置
```bash
# 编辑 deploy.sh
nano deploy.sh

# 修改以下变量
SERVER_USER="your-username"      # 改为你的用户名
SERVER_IP="your-server-ip"       # 改为你的服务器 IP
SERVER_PATH="/var/www/app"       # 改为部署路径
```

**步骤 2**: 运行脚本
```bash
# 添加执行权限
chmod +x deploy.sh

# 运行部署
./deploy.sh
```

**前提条件**:
- ✅ 已配置 SSH 密钥认证（推荐）
- ✅ 服务器已安装 Nginx
- ✅ 服务器上已创建部署目录

**配置 SSH 密钥**:
```bash
# 在本地生成 SSH 密钥（如果还没有）
ssh-keygen -t rsa -b 4096

# 复制公钥到服务器
ssh-copy-id user@server-ip

# 测试连接
ssh user@server-ip "echo '连接成功'"
```

**输出**:
```
========================================
   权限管理系统 - 自动部署脚本
========================================

🔨 构建项目...
✅ 构建完成
🔗 测试服务器连接...
✅ 服务器连接正常
...
✅ 部署成功！
🌐 访问地址: http://your-server-ip
```

---

### 3. quick-fix.sh - 快速修复脚本

**功能**:
- ✅ 清理旧的依赖和缓存
- ✅ 配置国内镜像源
- ✅ 重新安装依赖
- ✅ 验证 vite 安装
- ✅ 执行构建

**使用方法**:
```bash
# 添加执行权限
chmod +x quick-fix.sh

# 运行修复
./quick-fix.sh
```

**适用场景**:
- ✅ 遇到 "vite: command not found" 错误
- ✅ 依赖安装失败
- ✅ 构建出现奇怪错误
- ✅ 网络问题导致安装慢

**输出**:
```
========================================
  vite 构建问题快速修复
========================================

✅ Node.js 版本: v18.x.x
🧹 步骤 1/5: 清理旧文件...
🌐 步骤 2/5: 配置 npm 镜像...
...
✅ 修复成功！
```

---

## 🎯 使用场景对照表

| 场景 | 推荐脚本 | 命令 |
|------|---------|------|
| 首次本地构建 | build.sh | `./build.sh` |
| 遇到构建错误 | quick-fix.sh | `./quick-fix.sh` |
| 部署到服务器 | deploy.sh | `./deploy.sh` |
| 更新应用 | deploy.sh | `./deploy.sh` |
| CI/CD 集成 | build.sh | `./build.sh` |

---

## 🔍 脚本执行流程

### build.sh 流程图

```
开始
  ↓
检查 Node.js/npm
  ↓
检查磁盘空间
  ↓
清理旧文件（可选）
  ↓
测试 npm 连接
  ↓
安装依赖
  ↓
验证 vite
  ↓
执行构建
  ↓
验证结果
  ↓
完成
```

### deploy.sh 流程图

```
开始
  ↓
检查配置
  ↓
本地构建
  ↓
测试服务器连接
  ↓
创建服务器目录
  ↓
备份旧版本
  ↓
上传新文件
  ↓
重启 Nginx
  ↓
验证部署
  ↓
完成
```

### quick-fix.sh 流程图

```
开始
  ↓
检查 Node.js
  ↓
清理 node_modules
  ↓
配置镜像源
  ↓
清理缓存
  ↓
安装依赖
  ↓
验证 vite
  ↓
构建项目
  ↓
完成
```

---

## ⚙️ 高级用法

### 自定义构建选项

编辑 `build.sh`，在构建命令前添加环境变量：

```bash
# 增加内存限制
export NODE_OPTIONS="--max-old-space-size=8192"

# 设置生产环境
export NODE_ENV=production

# 执行构建
npm run build
```

### 自定义部署选项

编辑 `deploy.sh`，修改部署行为：

```bash
# 不使用 Nginx 重启
USE_NGINX=false

# 使用不同的传输工具
# 使用 scp 替代 rsync
scp -r dist/* $SERVER_USER@$SERVER_IP:$SERVER_PATH/

# 添加部署后钩子
ssh $SERVER_USER@$SERVER_IP "
  cd $SERVER_PATH
  # 清理缓存
  rm -rf .cache
  # 重启应用
  pm2 restart app
"
```

---

## 🐛 故障排查

### 问题 1: 权限不足

**错误**:
```
bash: ./build.sh: Permission denied
```

**解决**:
```bash
chmod +x build.sh
chmod +x deploy.sh
chmod +x quick-fix.sh
```

---

### 问题 2: SSH 连接失败

**错误**:
```
ssh: connect to host xxx port 22: Connection refused
```

**排查**:
```bash
# 测试 SSH 连接
ssh -v user@server-ip

# 检查 SSH 服务状态（在服务器上）
sudo systemctl status sshd

# 检查防火墙
sudo firewall-cmd --list-all
```

---

### 问题 3: rsync 不存在

**错误**:
```
bash: rsync: command not found
```

**解决**:
```bash
# Ubuntu/Debian
sudo apt install rsync

# CentOS/RockyLinux
sudo dnf install rsync
```

或修改 `deploy.sh`，使用 scp 替代 rsync：
```bash
scp -r dist/* $SERVER_USER@$SERVER_IP:$SERVER_PATH/
```

---

## 💡 最佳实践

### 1. 使用版本控制

```bash
# 在部署前提交代码
git add .
git commit -m "准备部署 v1.0.0"
git tag v1.0.0
git push origin main --tags
```

### 2. 测试脚本

```bash
# 在开发环境先测试构建
./build.sh

# 检查构建产物
ls -la dist/

# 本地预览
npm run preview
```

### 3. 备份策略

deploy.sh 已自动备份，您也可以手动备份：

```bash
# 在服务器上
cd /var/www
tar -czf backup-$(date +%Y%m%d).tar.gz permission-system/
```

### 4. 日志记录

```bash
# 记录部署日志
./deploy.sh 2>&1 | tee deploy.log

# 记录构建日志
./build.sh 2>&1 | tee build.log
```

---

## 🔄 CI/CD 集成

### GitHub Actions 示例

创建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Server

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Build
      run: |
        chmod +x build.sh
        ./build.sh
    
    - name: Deploy
      env:
        SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
      run: |
        mkdir -p ~/.ssh
        echo "$SSH_PRIVATE_KEY" > ~/.ssh/id_rsa
        chmod 600 ~/.ssh/id_rsa
        chmod +x deploy.sh
        ./deploy.sh
```

### GitLab CI 示例

创建 `.gitlab-ci.yml`:

```yaml
stages:
  - build
  - deploy

build:
  stage: build
  image: node:18
  script:
    - chmod +x build.sh
    - ./build.sh
  artifacts:
    paths:
      - dist/

deploy:
  stage: deploy
  image: ubuntu:latest
  before_script:
    - apt-get update && apt-get install -y openssh-client rsync
    - mkdir -p ~/.ssh
    - echo "$SSH_PRIVATE_KEY" > ~/.ssh/id_rsa
    - chmod 600 ~/.ssh/id_rsa
  script:
    - chmod +x deploy.sh
    - ./deploy.sh
  only:
    - main
```

---

## 📞 获取帮助

如果脚本执行遇到问题：

1. 查看 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. 查看 [FIX_ROCKYLINUX.md](./FIX_ROCKYLINUX.md)
3. 运行诊断命令：
   ```bash
   node --version
   npm --version
   npx vite --version
   ```
4. 查看脚本详细日志：
   ```bash
   bash -x ./build.sh
   ```

---

**祝您使用愉快！** 🎉
