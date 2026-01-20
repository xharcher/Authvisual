/**
 * 简单的 Express 服务器
 * 用于托管构建后的静态文件
 */

const express = require('express');
const path = require('path');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

// 启用 gzip 压缩
app.use(compression());

// 设置安全头
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// 提供静态文件
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1y', // 缓存静态资源1年
  etag: true,
  lastModified: true
}));

// 所有路由返回 index.html (支持 SPA 路由)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).send('Internal Server Error');
});

// 启动服务器
app.listen(PORT, () => {
  console.log('========================================');
  console.log('  权限管理系统已启动');
  console.log('========================================');
  console.log(`  环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  端口: ${PORT}`);
  console.log(`  访问: http://localhost:${PORT}`);
  console.log('========================================');
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('收到 SIGINT 信号，正在关闭服务器...');
  process.exit(0);
});
