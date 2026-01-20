# 权限可视化管理系统

一个基于 React + TypeScript + Tailwind CSS 的现代化权限管理系统，提供用户、组、角色、权限和资源的完整管理功能。

## ✨ 功能特性

- 👥 **用户管理** - 添加、编辑、删除用户，为用户分配多个组
- 👨‍👩‍👧‍👦 **组管理** - 创建和管理用户组，为组分配角色
- 🎭 **角色管理** - 创建和管理角色，为角色分配细粒度权限
- 🔐 **权限管理** - 管理系统权限，关联到具体资源
- 📊 **权限矩阵** - 表格形式直观展示角色与权限的对应关系
- 📈 **可视化展示** - 统计仪表板和关系图谱
- 🔗 **关系图谱** - 五元组（用户-组-角色-权限-资源）可视化展示

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### ⚠️ RockyLinux 用户

如果遇到 `vite: command not found` 错误：

```bash
# 使用快速修复脚本
chmod +x quick-fix.sh
./quick-fix.sh
```

详细说明：[FIX_ROCKYLINUX.md](./FIX_ROCKYLINUX.md)

## 📚 部署文档

### 快速导航

| 文档 | 说明 | 适用场景 |
|------|------|---------|
| [QUICK_START.md](./QUICK_START.md) | 5分钟快速部署 | 新手入门 |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | 完整部署指南 | 生产部署 |
| [FIX_ROCKYLINUX.md](./FIX_ROCKYLINUX.md) | RockyLinux 问题修复 | RockyLinux 用户 |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | 故障排查 | 遇到问题时 |
| [README_DEPLOYMENT.md](./README_DEPLOYMENT.md) | 部署文档总览 | 了解所有部署方式 |

### 三种部署方式

#### 1️⃣ Docker 部署（推荐）

```bash
docker-compose up -d
```

#### 2️⃣ Nginx 静态文件

```bash
npm run build
scp -r dist/* user@server:/var/www/html/
```

#### 3️⃣ 一键部署脚本

```bash
chmod +x deploy.sh
./deploy.sh
```

## 🛠️ 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run build:safe` | 安全构建（使用 npx） |
| `npm run preview` | 预览生产构建 |
| `npm run clean` | 清理构建文件和依赖 |
| `npm run reinstall` | 重新安装所有依赖 |

## 📦 部署文件说明

| 文件 | 用途 |
|------|------|
| `Dockerfile` | Docker 镜像构建 |
| `docker-compose.yml` | Docker 编排配置 |
| `nginx.conf` | Nginx 服务器配置 |
| `server.js` | Node.js Express 服务器 |
| `ecosystem.config.js` | PM2 进程管理配置 |
| `deploy.sh` | 自动化部署脚本 |
| `build.sh` | 自动化构建脚本 |
| `quick-fix.sh` | 快速修复脚本（vite 问题） |

## 🔧 技术栈

- **框架**: React 18.3.1
- **语言**: TypeScript
- **构建工具**: Vite 6.3.5
- **样式**: Tailwind CSS 4.1.12
- **UI 组件**: Radix UI, Material-UI
- **图表**: Recharts
- **图标**: Lucide React
- **动画**: Motion (Framer Motion)
- **表单**: React Hook Form
- **拖拽**: React DnD

## 📖 系统架构

```
用户 (User)
  ↓
组 (Group)
  ↓
角色 (Role)
  ↓
权限 (Permission)
  ↓
资源 (Resource)
```

### 五元组关系

- **用户** 属于一个或多个 **组**
- **组** 拥有一个或多个 **角色**
- **角色** 具有一个或多个 **权限**
- **权限** 作用于特定的 **资源**

## 🎨 主要组件

- `UserManagement.tsx` - 用户管理界面
- `RoleManagement.tsx` - 角色管理界面
- `PermissionMatrix.tsx` - 权限矩阵视图
- `PermissionVisualization.tsx` - 可视化统计
- `RelationshipDiagram.tsx` - 关系图谱展示

## 🌟 特色功能

### 关系图谱可视化

- **递归高亮**: 鼠标悬停在任意节点，自动递归高亮所有相关联的节点和连接线
- **五列展示**: 从左到右依次展示用户、组、角色、权限、资源
- **交互式连接**: SVG 绘制的动态连接线，支持高亮和过渡动画
- **统计信息**: 实时显示各类实体的数量统计

### 权限矩阵

- **表格视图**: 直观的角色-权限对应关系表
- **快速编辑**: 点击即可分配或移除权限
- **批量操作**: 支持批量权限管理

## 📊 系统截图

（在实际部署后可添加截图）

## 🔐 安全建议

1. ✅ 配置 HTTPS
2. ✅ 设置防火墙规则
3. ✅ 使用强密码策略
4. ✅ 定期更新依赖
5. ✅ 实施访问控制

## 🚨 常见问题

### vite: command not found

查看 [FIX_ROCKYLINUX.md](./FIX_ROCKYLINUX.md)

### 页面刷新后 404

确保 Nginx 配置中包含：
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 更多问题

查看 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## 📝 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 联系方式

如有问题，请查看文档或提交 Issue。

---

**开发愉快！** 🎉

### 相关文档

- 📘 [快速开始](./QUICK_START.md)
- 📗 [部署指南](./DEPLOYMENT.md)
- 📙 [故障排查](./TROUBLESHOOTING.md)
- 📕 [RockyLinux 修复](./FIX_ROCKYLINUX.md)
