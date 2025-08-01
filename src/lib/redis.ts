import { Redis } from '@upstash/redis'
export const redis = new Redis({
  url: 'https://probable-kid-5797.upstash.io',
  token: 'ARalAAIjcDE3NzZkY2RlOTY4M2U0M2Q4YjkwNjI4MGU1NDQ4YjlmNXAxMA',
})

await redis.set("foo", "bar");
await redis.get("foo");