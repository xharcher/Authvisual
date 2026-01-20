/**
 * PM2 配置文件
 * 用于生产环境部署和进程管理
 * 
 * 使用方法:
 * pm2 start ecosystem.config.js
 * pm2 save
 * pm2 startup
 */

module.exports = {
  apps: [{
    name: 'permission-system',
    script: './server.js',
    instances: 'max',  // 使用所有CPU核心
    exec_mode: 'cluster',  // 集群模式
    
    // 环境变量
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    
    // 自动重启配置
    watch: false,  // 生产环境不建议启用
    max_memory_restart: '500M',  // 内存超过500M时重启
    
    // 日志配置
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // 进程管理
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 4000,
    
    // 优雅关闭
    kill_timeout: 5000,
    
    // 其他配置
    listen_timeout: 3000,
    shutdown_with_message: true
  }]
};
