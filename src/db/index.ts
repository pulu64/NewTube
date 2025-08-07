import { drizzle } from 'drizzle-orm/neon-http';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

// 创建数据库连接，添加重试和超时配置
export const db = drizzle(process.env.DATABASE_URL!, {
  // 添加连接池配置
  pool: {
    min: 1,
    max: 10,
  },
});