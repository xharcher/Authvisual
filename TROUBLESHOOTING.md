# 故障排查指南

## ❌ 错误: "vite: command not found"

### 问题描述
在 RockyLinux 下运行 `npm run build` 时报错：
```
sh: line 1: vite: command not found
```

### 原因分析
1. devDependencies 依赖没有安装
2. 使用了 `npm install --production` 导致开发依赖被跳过
3. node_modules 目录不完整

### 解决方案

#### 方案 1: 重新安装所有依赖（推荐）

```bash
# 删除旧的依赖
rm -rf node_modules package-lock.json

# 重新安装（包括 devDependencies）
npm install

# 构建
npm run build
```

#### 方案 2: 确保安装了 devDependencies

```bash
# 不要使用 --production 标志
npm install

# 或者显式安装开发依赖
npm install --include=dev

# 验证 vite 是否安装
npx vite --version

# 构建
npm run build
```

#### 方案 3: 全局安装 vite（不推荐，但可以快速解决）

```bash
# 全局安装 vite
npm install -g vite

# 构建
npm run build
```

#### 方案 4: 使用 npx 运行（推荐）

修改 package.json 中的构建命令：

```json
{
  "scripts": {
    "build": "npx vite build"
  }
}
```

然后运行：
```bash
npm run build
```

---

## ✅ 完整的部署流程（RockyLinux）

### 1. 环境准备

```bash
# 更新系统
sudo dnf update -y

# 安装 Node.js 18.x
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install -y nodejs

# 验证安装
node --version
npm --version
```

### 2. 安装项目依赖

```bash
# 进入项目目录
cd /path/to/permission-system

# 清理旧的依赖（如果存在）
rm -rf node_modules package-lock.json

# 安装所有依赖（包括 devDependencies）
npm install

# 验证 vite 是否可用
npx vite --version
```

### 3. 构建项目

```bash
# 方式 A: 直接构建
npm run build

# 方式 B: 使用 npx（更可靠）
npx vite build

# 方式 C: 指定环境变量
NODE_ENV=production npm run build
```

### 4. 验证构建结果

```bash
# 检查 dist 目录是否存在
ls -la dist/

# 检查主要文件
ls -la dist/index.html
ls -la dist/assets/
```

---

## 🐛 其他常见问题

### 问题 2: 内存不足

**错误信息**:
```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**解决方案**:
```bash
# 增加 Node.js 内存限制
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

或修改 package.json:
```json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' vite build"
  }
}
```

---

### 问题 3: 权限错误

**错误信息**:
```
Error: EACCES: permission denied
```

**解决方案**:
```bash
# 修复 npm 权限
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER ./node_modules

# 或使用 sudo（不推荐）
sudo npm install
sudo npm run build
```

---

### 问题 4: 网络问题（中国大陆）

**症状**: 依赖下载很慢或失败

**解决方案**:
```bash
# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com

# 验证配置
npm config get registry

# 重新安装
rm -rf node_modules package-lock.json
npm install
```

---

### 问题 5: pnpm 相关问题

如果项目之前使用 pnpm，现在要用 npm:

```bash
# 删除 pnpm 相关文件
rm -rf node_modules pnpm-lock.yaml

# 使用 npm 安装
npm install
npm run build
```

---

## 📋 检查清单

在构建之前，请确认以下事项：

- [ ] Node.js 版本 >= 18.0.0
- [ ] npm 版本 >= 9.0.0
- [ ] 已删除 node_modules 和 package-lock.json
- [ ] 网络连接正常
- [ ] 磁盘空间充足（至少 2GB）
- [ ] 内存充足（建议至少 2GB）

---

## 🔍 调试命令

```bash
# 查看 Node.js 和 npm 版本
node --version
npm --version

# 查看已安装的包
npm list vite
npm list --depth=0

# 查看 vite 可执行文件位置
which vite
ls -la node_modules/.bin/vite

# 查看环境变量
echo $PATH
echo $NODE_ENV

# 清理 npm 缓存
npm cache clean --force

# 详细日志模式运行
npm run build --verbose
```

---

## 🚀 推荐的构建脚本

创建一个 `build.sh` 脚本来自动化构建过程：

```bash
#!/bin/bash

set -e

echo "🚀 开始构建权限管理系统..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: Node.js 未安装"
    exit 1
fi

# 检查版本
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ 错误: Node.js 版本必须 >= 18，当前版本: $(node --version)"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"
echo "✅ npm 版本: $(npm --version)"

# 清理
echo "🧹 清理旧文件..."
rm -rf dist node_modules package-lock.json

# 安装依赖
echo "📦 安装依赖..."
npm install

# 验证 vite
if ! npx vite --version &> /dev/null; then
    echo "❌ 错误: vite 安装失败"
    exit 1
fi

echo "✅ vite 版本: $(npx vite --version)"

# 构建
echo "🔨 开始构建..."
npm run build

# 验证构建结果
if [ ! -f "dist/index.html" ]; then
    echo "❌ 错误: 构建失败，未找到 dist/index.html"
    exit 1
fi

echo "✅ 构建成功！"
echo "📦 构建产物位置: $(pwd)/dist"
echo "📊 构建产物大小:"
du -sh dist/
```

使用方式：
```bash
chmod +x build.sh
./build.sh
```

---

## 📞 仍然无法解决？

请提供以下信息：

```bash
# 收集系���信息
cat /etc/os-release
node --version
npm --version
npm list vite
ls -la node_modules/.bin/ | grep vite
npm config list
echo $PATH
```

将以上输出发送给技术支持。
