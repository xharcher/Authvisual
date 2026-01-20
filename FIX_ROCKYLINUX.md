# RockyLinux 构建问题快速修复指南

## 问题：vite: command not found

### 🎯 快速解决方案（5分钟）

按照以下步骤操作即可解决：

```bash
# 步骤 1: 删除旧的依赖
rm -rf node_modules package-lock.json

# 步骤 2: 重新安装所有依赖
npm install

# 步骤 3: 使用安全构建命令
npm run build:safe
```

**完成！** 如果上述步骤成功，您的项目已经构建完成。

---

## 🔧 详细解决方案

### 方案 A: 使用自动化脚本（推荐）

我已经为您准备了一个自动化构建脚本：

```bash
# 1. 给脚本添加执行权限
chmod +x build.sh

# 2. 运行构建脚本
./build.sh
```

脚本会自动：
- ✅ 检查 Node.js 和 npm 版本
- ✅ 清理旧文件
- ✅ 安装依赖
- ✅ 验证 vite 安装
- ✅ 构建项目
- ✅ 验证构建结果

---

### 方案 B: 手动完整步骤

#### 1. 检查并更新 Node.js（如果版本低于 18）

```bash
# 查看当前版本
node --version

# 如果版本低于 v18，安装 Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install -y nodejs

# 验证安装
node --version  # 应该显示 v18.x.x 或更高
npm --version
```

#### 2. 清理并重装依赖

```bash
# 清理所有旧文件
rm -rf node_modules package-lock.json dist

# 清理 npm 缓存（可选，但推荐）
npm cache clean --force

# 重新安装依赖
npm install
```

#### 3. 验证 vite 安装

```bash
# 检查 vite 是否在 node_modules 中
ls -la node_modules/.bin/vite

# 使用 npx 测试 vite
npx vite --version
```

#### 4. 构建项目

```bash
# 方式 1: 使用 npm 脚本
npm run build

# 方式 2: 使用安全构建（推荐）
npm run build:safe

# 方式 3: 直接使用 npx
npx vite build
```

---

### 方案 C: 使用国内镜像（网络问题）

如果安装依赖很慢或失败：

```bash
# 切换到淘宝镜像
npm config set registry https://registry.npmmirror.com

# 验证配置
npm config get registry

# 清理并重装
rm -rf node_modules package-lock.json
npm install

# 构建
npm run build:safe
```

---

## 🚀 一键解决脚本

创建一个文件 `quick-fix.sh`:

```bash
#!/bin/bash
set -e

echo "🔧 开始修复 vite 构建问题..."

# 清理
echo "1️⃣ 清理旧文件..."
rm -rf node_modules package-lock.json dist

# 使用国内镜像（可选）
echo "2️⃣ 配置 npm 镜像..."
npm config set registry https://registry.npmmirror.com

# 安装依赖
echo "3️⃣ 安装依赖..."
npm install

# 验证
echo "4️⃣ 验证 vite..."
npx vite --version

# 构建
echo "5️⃣ 构建项目..."
npm run build

echo "✅ 修复完成！"
```

使用：
```bash
chmod +x quick-fix.sh
./quick-fix.sh
```

---

## 📋 常见问题检查清单

### 问题 1: 权限错误

```bash
# 修复 npm 权限
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER ./node_modules

# 或者设置 npm 的全局目录为用户目录
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### 问题 2: 依赖安装失败

```bash
# 增加 npm 超时时间
npm config set fetch-retry-maxtimeout 120000
npm config set fetch-retry-mintimeout 20000

# 重新安装
npm install
```

### 问题 3: 内存不足

```bash
# 增加 Node.js 内存限制
export NODE_OPTIONS="--max-old-space-size=4096"

# 或修改 package.json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' vite build"
  }
}
```

---

## 🔍 诊断命令

运行以下命令收集诊断信息：

```bash
# 系统信息
cat /etc/os-release

# Node.js 和 npm 版本
node --version
npm --version

# 检查 vite 安装
npm list vite
ls -la node_modules/.bin/vite

# 检查 npm 配置
npm config list

# 检查环境变量
echo $PATH
echo $NODE_ENV

# 磁盘空间
df -h .

# 内存信息
free -h
```

将输出结果保存到文件：
```bash
bash -c "
echo '=== 系统信息 ==='
cat /etc/os-release
echo ''
echo '=== Node.js 版本 ==='
node --version
echo ''
echo '=== npm 版本 ==='
npm --version
echo ''
echo '=== vite 检查 ==='
npm list vite 2>&1 || true
echo ''
echo '=== 磁盘空间 ==='
df -h .
" > diagnostic.txt

cat diagnostic.txt
```

---

## ✅ 验证构建成功

构建成功后，您应该看到：

```bash
# dist 目录存在
ls -la dist/

# 包含这些文件
dist/
├── index.html          # 主 HTML 文件
├── assets/            # 资源文件夹
│   ├── index-abc123.js
│   └── index-xyz789.css
└── ...
```

---

## 🎯 推荐的完整流程（RockyLinux）

```bash
# 1. 更新系统
sudo dnf update -y

# 2. 安装 Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install -y nodejs

# 3. 验证版本
node --version  # 应该 >= v18.0.0

# 4. 进入项目目录
cd /path/to/permission-system

# 5. 配置 npm（可选，国内用户推荐）
npm config set registry https://registry.npmmirror.com

# 6. 清理并安装
rm -rf node_modules package-lock.json dist
npm install

# 7. 构建
npm run build:safe

# 8. 验证
ls -la dist/index.html
```

---

## 📞 还是不行？

如果以上所有方法都不行，请尝试：

### 最后的手段：使用 Docker 构建

```bash
# 创建临时 Dockerfile
cat > Dockerfile.build << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EOF

# 使用 Docker 构建
docker build -f Dockerfile.build -t permission-system-build .

# 提取构建产物
docker create --name temp permission-system-build
docker cp temp:/app/dist ./dist
docker rm temp

# 清理
rm Dockerfile.build
```

现在 `dist` 目录已经准备好，可以部署了！

---

## 💡 预防措施

为了避免将来出现类似问题：

1. **使用 Node.js LTS 版本**（目前是 v18 或 v20）
2. **不要使用 `npm install --production`** 构建时需要 devDependencies
3. **定期更新依赖**：`npm update`
4. **使用版本锁定**：提交 `package-lock.json` 到 Git
5. **使用自动化脚本**：使用提供的 `build.sh`

---

**祝构建顺利！** 🎉
