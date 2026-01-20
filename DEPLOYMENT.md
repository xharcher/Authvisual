# Linux 服务器部署指南

本指南提供了将权限管理系统部署到 Linux 服务器的多种方式。

## 目录
1. [前提条件](#前提条件)
2. [方式一：使用 Nginx 部署静态文件](#方式一使用-nginx-部署静态文件)
3. [方式二：使用 Docker 部署](#方式二使用-docker-部署)
4. [方式三：使用 PM2 + Node.js 服务器](#方式三使用-pm2--nodejs-服务器)
5. [常见问题](#常见问题)

---

## 前提条件

### 本地环境
- Node.js 18+ 和 npm/pnpm/yarn
- Git（用于代码传输）

### 服务器环境
- Linux 服务器（Ubuntu 20.04+ / CentOS 7+ 推荐）
- SSH 访问权限
- 域名（可选，可使用 IP 访问）

---

## 方式一：使用 Nginx 部署静态文件

这是最常用、最简单的部署方式，适合纯前端应用。

### 步骤 1: 本地构建项目

```bash
# 在本地项目目录下执行
npm install
# 或者使用 pnpm
pnpm install

# 构建生产版本
npm run build
# 或者
pnpm build
```

构建完成后，会在项目根目录生成 `dist` 文件夹，包含所有静态文件。

### 步骤 2: 上传文件到服务器

**方式 A: 使用 SCP 命令**
```bash
# 将 dist 文件夹上传到服务器
scp -r dist/ username@your-server-ip:/var/www/permission-system
```

**方式 B: 使用 SFTP 客户端**
- 使用 FileZilla、WinSCP 等工具
- 连接到服务器
- 上传 dist 文件夹到 `/var/www/permission-system`

**方式 C: 使用 Git**
```bash
# 在服务器上
cd /var/www
git clone your-repository-url permission-system
cd permission-system
npm install
npm run build
```

### 步骤 3: 安装和配置 Nginx

```bash
# 在服务器上执行
# Ubuntu/Debian
sudo apt update
sudo apt install nginx -y

# CentOS/RHEL
sudo yum install nginx -y

# 启动 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 步骤 4: 创建 Nginx 配置文件

```bash
sudo nano /etc/nginx/sites-available/permission-system
```

添加以下配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名或服务器IP
    
    root /var/www/permission-system/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 启用 gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/javascript application/json;
    
    # 缓存静态资源
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 步骤 5: 启用配置并重启 Nginx

```bash
# Ubuntu/Debian
sudo ln -s /etc/nginx/sites-available/permission-system /etc/nginx/sites-enabled/

# 测试配置文件
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 步骤 6: 配置防火墙

```bash
# Ubuntu (UFW)
sudo ufw allow 'Nginx Full'
sudo ufw enable

# CentOS (Firewalld)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 步骤 7: (可选) 配置 HTTPS

```bash
# 安装 Certbot
# Ubuntu
sudo apt install certbot python3-certbot-nginx -y

# CentOS
sudo yum install certbot python3-certbot-nginx -y

# 获取 SSL 证书
sudo certbot --nginx -d your-domain.com
```

现在访问 `http://your-domain.com` 或 `http://your-server-ip` 即可看到应用！

---

## 方式二：使用 Docker 部署

Docker 部署提供了更好的隔离性和可移植性。

### 步骤 1: 创建 Dockerfile

在项目根目录创建 `Dockerfile`：

```dockerfile
# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制 package.json 和 lock 文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM nginx:alpine

# 复制构建产物到 Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 步骤 2: 创建 nginx.conf

在项目根目录创建 `nginx.conf`：

```nginx
server {
    listen 80;
    server_name localhost;
    
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/javascript application/json;
}
```

### 步骤 3: 创建 docker-compose.yml (可选)

```yaml
version: '3.8'

services:
  permission-system:
    build: .
    ports:
      - "80:80"
    restart: unless-stopped
    container_name: permission-system
```

### 步骤 4: 在服务器上部署

```bash
# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 上传代码到服务器或使用 Git 克隆
cd /path/to/project

# 构建并启动
docker-compose up -d --build

# 查看日志
docker-compose logs -f
```

---

## 方式三：使用 PM2 + Node.js 服务器

如果需要服务器端渲染或API支持，可以使用 Node.js 服务器。

### 步骤 1: 创建简单的 Express 服务器

在项目根目录创建 `server.js`：

```javascript
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 提供静态文件
app.use(express.static(path.join(__dirname, 'dist')));

// 所有路由返回 index.html (支持 SPA 路由)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

### 步骤 2: 安装依赖

```bash
npm install express --save
```

### 步骤 3: 更新 package.json

```json
{
  "scripts": {
    "build": "vite build",
    "start": "node server.js"
  }
}
```

### 步骤 4: 在服务器上安装和配置 PM2

```bash
# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2
sudo npm install -g pm2

# 上传代码并安装依赖
cd /var/www/permission-system
npm install
npm run build

# 使用 PM2 启动应用
pm2 start server.js --name permission-system

# 设置开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status
pm2 logs permission-system
```

### 步骤 5: 配置 Nginx 反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

---

## 自动化部署脚本

创建 `deploy.sh` 脚本：

```bash
#!/bin/bash

# 配置变量
SERVER_USER="your-username"
SERVER_IP="your-server-ip"
SERVER_PATH="/var/www/permission-system"

echo "🚀 开始部署..."

# 本地构建
echo "📦 构建项目..."
npm run build

# 上传到服务器
echo "📤 上传文件到服务器..."
scp -r dist/* $SERVER_USER@$SERVER_IP:$SERVER_PATH/

# 重启服务 (如果使用 Nginx)
echo "🔄 重启 Nginx..."
ssh $SERVER_USER@$SERVER_IP "sudo systemctl restart nginx"

echo "✅ 部署完成！"
```

使用方式：
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 常见问题

### 1. 页面刷新后出现 404

**原因**：SPA 应用需要服务器配置，将所有路由请求返回 index.html

**解决**：确保 Nginx 配置中有 `try_files $uri $uri/ /index.html;`

### 2. 静态资源加载失败

**原因**：路径配置问题

**解决**：检查 `vite.config.js` 中的 `base` 配置

### 3. 端口被占用

**检查端口占用**：
```bash
sudo lsof -i :80
sudo netstat -tulpn | grep :80
```

**停止占用进程**：
```bash
sudo kill -9 <PID>
```

### 4. 权限问题

```bash
# 修改文件所有者
sudo chown -R www-data:www-data /var/www/permission-system

# 修改文件权限
sudo chmod -R 755 /var/www/permission-system
```

### 5. 查看 Nginx 日志

```bash
# 访问日志
sudo tail -f /var/log/nginx/access.log

# 错误日志
sudo tail -f /var/log/nginx/error.log
```

---

## 性能优化建议

1. **启用 Gzip 压缩**（已在配置中包含）
2. **配置 CDN**：将静态资源托管到 CDN
3. **启用浏览器缓存**（已在配置中包含）
4. **使用 HTTP/2**：需要 HTTPS
5. **代码分割**：Vite 默认已启用

---

## 监控和维护

### 使用 PM2 监控（如果使用 Node.js 服务器）

```bash
pm2 monit
pm2 logs permission-system
```

### 设置日志轮换

```bash
# Nginx 日志轮换已默认配置
# 查看配置
cat /etc/logrotate.d/nginx
```

---

## 推荐部署方式

- **小型项目**：方式一（Nginx 静态文件）✅ 最简单
- **需要容器化**：方式二（Docker）✅ 最标准
- **需要服务端功能**：方式三（PM2 + Node.js）

祝部署顺利！🎉
