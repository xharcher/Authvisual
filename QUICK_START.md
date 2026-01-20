# 快速部署指南 ⚡

## ⚠️ RockyLinux 用户特别提示

如果您在 RockyLinux 下遇到 `vite: command not found` 错误：

### 快速修复（2分钟）
```bash
# 运行快速修复脚本
chmod +x quick-fix.sh
./quick-fix.sh
```

或手动执行：
```bash
rm -rf node_modules package-lock.json
npm install
npm run build:safe
```

详细解决方案请查看：[FIX_ROCKYLINUX.md](./FIX_ROCKYLINUX.md)

---

## 最简单的部署方式（推荐新手）

### 方法 1: 使用一键部署脚本

1. **修改配置**
   编辑 `deploy.sh` 文件，修改以下三行：
   ```bash
   SERVER_USER="root"              # 改成你的SSH用户名
   SERVER_IP="192.168.1.100"       # 改成你的服务器IP
   SERVER_PATH="/var/www/app"      # 改成部署路径
   ```

2. **执行部署**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```
   
   完成！🎉 访问 `http://你的服务器IP`

---

### 方法 2: 使用 Docker（最简单）

**前提**: 服务器已安装 Docker 和 Docker Compose

1. **上传代码到服务器**
   ```bash
   # 本地执行
   scp -r . your-user@your-server:/opt/permission-system
   ```

2. **在服务器上构建并启动**
   ```bash
   # 服务器执行
   cd /opt/permission-system
   docker-compose up -d
   ```

3. **查看状态**
   ```bash
   docker-compose ps
   docker-compose logs -f
   ```

   完成！🎉 访问 `http://你的服务器IP`

---

### 方法 3: 传统方式（Nginx）

#### 步骤 1: 本地构建
```bash
npm install
npm run build
```

#### 步骤 2: 上传到服务器
```bash
scp -r dist your-user@your-server:/var/www/html/
```

#### 步骤 3: 在服务器上安装 Nginx
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx -y

# CentOS
sudo yum install nginx -y

# 启动 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### 步骤 4: 配置 Nginx
```bash
sudo nano /etc/nginx/sites-available/default
```

替换内容为：
```nginx
server {
    listen 80;
    server_name _;
    root /var/www/html/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### 步骤 5: 重启 Nginx
```bash
sudo systemctl restart nginx
```

完成！🎉 访问 `http://你的服务器IP`

---

## 常见问题快速解决

### ❌ 访问提示 404
```bash
# 检查文件是否存在
ls -la /var/www/html/dist/index.html

# 检查 Nginx 配置
sudo nginx -t

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log
```

### ❌ 无法访问（连接被拒绝）
```bash
# 检查 Nginx 是否运行
sudo systemctl status nginx

# 检查端口是否监听
sudo netstat -tulpn | grep :80

# 开放防火墙
sudo ufw allow 80
# 或
sudo firewall-cmd --add-service=http --permanent
sudo firewall-cmd --reload
```

### ❌ 刷新页面后 404
这是 SPA 路由问题，确保 Nginx 配置中有：
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### ❌ 样式丢失
检查浏览器控制台，可能是路径问题。
确保在 `index.html` 中的资源路径是相对路径。

---

## Docker 常用命令

```bash
# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 重新构建并启动
docker-compose up -d --build

# 进入容器
docker exec -it permission-system sh
```

---

## Nginx 常用命令

```bash
# 测试配置
sudo nginx -t

# 启动
sudo systemctl start nginx

# 停止
sudo systemctl stop nginx

# 重启
sudo systemctl restart nginx

# 重载配置（不中断服务）
sudo systemctl reload nginx

# 查看状态
sudo systemctl status nginx

# 查看错误日志
sudo tail -f /var/log/nginx/error.log

# 查看访问日志
sudo tail -f /var/log/nginx/access.log
```

---

## 更新应用

### 使用脚本更新
```bash
./deploy.sh
```

### 手动更新
```bash
# 本地构建
npm run build

# 上传到服务器
scp -r dist/* your-user@your-server:/var/www/html/dist/

# 重启 Nginx（可选）
ssh your-user@your-server "sudo systemctl reload nginx"
```

### Docker 更新
```bash
# 在服务器上
cd /opt/permission-system
git pull  # 如果使用 git
docker-compose up -d --build
```

---

## 性能优化提示

1. ✅ 已启用 Gzip 压缩（在 nginx.conf 中）
2. ✅ 已配置静态资源缓存
3. ✅ 建议使用 CDN（如阿里云 OSS、腾讯云 COS）
4. ✅ 建议配置 HTTPS（使用 Let's Encrypt 免费证书）

### 配置 HTTPS（可选）
```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书（需要域名）
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

---

## 需要帮助？

- 查看完整文档: `DEPLOYMENT.md`
- 检查 Nginx 配置: `nginx.conf`
- 查看服务器脚本: `server.js`

---

**提示**: 建议在生产环境使用 HTTPS 和域名！