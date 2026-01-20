# 权限管理系统 - 部署文档总览

## 📚 文档导航

本项目提供了完整的 Linux 服务器部署方案和配置文件。

### 🎯 快速开始
- **新手推荐**: 查看 [QUICK_START.md](./QUICK_START.md) - 5分钟快速部署
- **完整指南**: 查看 [DEPLOYMENT.md](./DEPLOYMENT.md) - 详细的部署教程

---

## 📦 已提供的部署文件

| 文件名 | 用途 | 说明 |
|--------|------|------|
| `Dockerfile` | Docker 镜像构建 | 多阶段构建，生产环境优化 |
| `docker-compose.yml` | Docker 编排 | 一键启动容器化应用 |
| `nginx.conf` | Nginx 配置 | 适用于容器和传统部署 |
| `server.js` | Node.js 服务器 | Express 静态文件服务 |
| `deploy.sh` | 自动化部署脚本 | 一键部署到服务器 |
| `ecosystem.config.js` | PM2 配置 | 进程管理和集群模式 |
| `.dockerignore` | Docker 忽略文件 | 优化镜像大小 |

---

## 🚀 三种部署方式

### 方式 1️⃣: Docker 部署（推荐）

**优点**: 最简单、环境一致、易于管理

```bash
# 在服务器上执行
git clone <your-repo-url>
cd permission-system
docker-compose up -d
```

**适用场景**: 
- ✅ 所有场景
- ✅ 服务器已安装 Docker
- ✅ 需要快速部署和回滚

---

### 方式 2️⃣: Nginx 静态文件（最常用）

**优点**: 性能最好、资源占用少

```bash
# 本地构建
npm run build

# 上传到服务器
scp -r dist/* user@server:/var/www/html/

# 配置 Nginx（参考 nginx.conf）
```

**适用场景**:
- ✅ 纯前端应用
- ✅ 服务器资源有限
- ✅ 已有 Nginx 环境

---

### 方式 3️⃣: PM2 + Node.js（需要服务端功能）

**优点**: 支持服务端逻辑、进程管理

```bash
# 在服务器上
npm install
npm run build
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

**适用场景**:
- ✅ 需要 API 服务
- ✅ 需要服务端渲染
- ✅ 需要进程守护

---

## 🎬 部署步骤（以 Docker 为例）

### 步骤 1: 准备服务器

```bash
# SSH 连接到服务器
ssh user@your-server-ip

# 安装 Docker
curl -fsSL https://get.docker.com | sh

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

### 步骤 2: 上传代码

**方式 A: 使用 Git（推荐）**
```bash
cd /opt
git clone your-repository-url permission-system
cd permission-system
```

**方式 B: 直接上传**
```bash
# 在本地执行
scp -r . user@server:/opt/permission-system
```

### 步骤 3: 启动应用

```bash
# 在服务器上
cd /opt/permission-system
docker-compose up -d
```

### 步骤 4: 验证部署

```bash
# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 测试访问
curl http://localhost
```

### 步骤 5: 配置防火墙

```bash
# Ubuntu
sudo ufw allow 80
sudo ufw allow 443

# CentOS
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 步骤 6: 访问应用

打开浏览器访问: `http://your-server-ip`

---

## 🔧 配置说明

### Nginx 配置要点

```nginx
# 1. SPA 路由支持（重要！）
location / {
    try_files $uri $uri/ /index.html;
}

# 2. Gzip 压缩
gzip on;
gzip_types text/plain text/css application/json application/javascript;

# 3. 静态资源缓存
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
}
```

### Docker 配置要点

```yaml
# docker-compose.yml
services:
  permission-system:
    ports:
      - "80:80"      # 映射端口
    restart: unless-stopped  # 自动重启
```

### PM2 配置要点

```javascript
// ecosystem.config.js
{
  instances: 'max',      // 使用所有CPU
  exec_mode: 'cluster',  // 集群模式
  max_memory_restart: '500M'  // 内存限制
}
```

---

## 🛠️ 常用命令速查

### Docker 命令
```bash
docker-compose up -d           # 启动
docker-compose down            # 停止并删除
docker-compose restart         # 重启
docker-compose logs -f         # 查看日志
docker-compose ps              # 查看状态
docker-compose up -d --build   # 重新构建并启动
```

### Nginx 命令
```bash
sudo nginx -t                  # 测试配置
sudo systemctl start nginx     # 启动
sudo systemctl stop nginx      # 停止
sudo systemctl restart nginx   # 重启
sudo systemctl reload nginx    # 重载配置
sudo systemctl status nginx    # 查看状态
```

### PM2 命令
```bash
pm2 start ecosystem.config.js  # 启动
pm2 stop permission-system     # 停止
pm2 restart permission-system  # 重启
pm2 logs permission-system     # 查看日志
pm2 monit                      # 监控
pm2 list                       # 列表
pm2 save                       # 保存配置
pm2 startup                    # 开机自启
```

---

## 🔒 安全建议

1. **启用 HTTPS**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

2. **配置防火墙**
   ```bash
   sudo ufw enable
   sudo ufw allow ssh
   sudo ufw allow 80
   sudo ufw allow 443
   ```

3. **定期更新系统**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

4. **限制 SSH 访问**
   编辑 `/etc/ssh/sshd_config`:
   ```
   PermitRootLogin no
   PasswordAuthentication no
   ```

---

## 📊 监控和日志

### Nginx 日志
```bash
# 访问日志
sudo tail -f /var/log/nginx/access.log

# 错误日志
sudo tail -f /var/log/nginx/error.log
```

### Docker 日志
```bash
# 查看容器日志
docker logs -f permission-system

# 查看 compose 日志
docker-compose logs -f
```

### PM2 日志
```bash
# 实时日志
pm2 logs

# 日志文件位置
cat logs/out.log
cat logs/error.log
```

---

## 🐛 故障排查

### 问题 1: 页面 404

**症状**: 访问页面显示 404 Not Found

**排查步骤**:
```bash
# 1. 检查文件是否存在
ls -la /var/www/html/dist/index.html

# 2. 检查 Nginx 配置
sudo nginx -t

# 3. 检查 Nginx 日志
sudo tail -f /var/log/nginx/error.log
```

**解决方案**: 确保 Nginx 配置中有 `try_files $uri $uri/ /index.html;`

---

### 问题 2: 刷新后 404

**症状**: 直接访问正常，刷新后 404

**原因**: SPA 路由问题

**解决方案**: 
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

---

### 问题 3: 无法访问

**症状**: 浏览器无法连接

**排查步骤**:
```bash
# 1. 检查服务是否运行
sudo systemctl status nginx
# 或
docker-compose ps

# 2. 检查端口监听
sudo netstat -tulpn | grep :80

# 3. 检查防火墙
sudo ufw status
```

---

### 问题 4: 样式丢失

**症状**: 页面显示但样式不正常

**排查步骤**:
1. 打开浏览器开发者工具（F12）
2. 查看 Console 是否有错误
3. 查看 Network 标签，检查哪些资源加载失败

**常见原因**:
- 路径配置错误
- Nginx 配置问题
- CORS 问题

---

## 🔄 更新应用

### 使用自动脚本
```bash
./deploy.sh
```

### 手动更新 (Docker)
```bash
cd /opt/permission-system
git pull
docker-compose up -d --build
```

### 手动更新 (Nginx)
```bash
# 本地
npm run build
scp -r dist/* user@server:/var/www/html/dist/

# 服务器
sudo systemctl reload nginx
```

---

## 📈 性能优化

1. ✅ **启用 Gzip 压缩** - 已在 nginx.conf 中配置
2. ✅ **静态资源缓存** - 已配置 1 年缓存
3. 🔲 **使用 CDN** - 建议使用阿里云/腾讯云 CDN
4. 🔲 **启用 HTTP/2** - 需要 HTTPS
5. 🔲 **图片优化** - 使用 WebP 格式

---

## 💡 最佳实践

1. **使用 Git 管理代码** - 便于版本控制和回滚
2. **定期备份** - 在 deploy.sh 中已包含自动备份
3. **监控服务状态** - 使用 PM2 或 Docker healthcheck
4. **配置 HTTPS** - 使用 Let's Encrypt 免费证书
5. **使用域名** - 比 IP 地址更专业和易记

---

## 📞 获取帮助

- **快速开始**: 查看 `QUICK_START.md`
- **完整文档**: 查看 `DEPLOYMENT.md`
- **配置示例**: 查看项目根目录的配置文件

---

## ✨ 推荐配置

| 场景 | 推荐方式 | 理由 |
|------|----------|------|
| 个人项目 | Docker | 简单易用 |
| 小型团队 | Nginx + 脚本 | 性能好，成本低 |
| 中大型项目 | PM2 + Nginx | 稳定可靠，功能完整 |
| 微服务架构 | Docker + K8s | 易于扩展 |

---

**祝您部署顺利！** 🎉

如有问题，请检查日志或参考完整文档。
