import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from '@tanstack/react-query';
import superjson from 'superjson';
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 数据保持新鲜的时间 (10分钟)
        staleTime: 10 * 60 * 1000,
        // 缓存保留时间 (30分钟)
        gcTime: 30 * 60 * 1000,
        // 重试次数和配置
        retry: (failureCount, error) => {
          // 如果是网络错误，重试最多3次
          if (error instanceof Error && error.message.includes('fetch failed')) {
            return failureCount < 3;
          }
          // 其他错误不重试
          return false;
        },
        // 重试延迟
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // 窗口重新获得焦点时重新获取
        refetchOnWindowFocus: false,
        // 网络重新连接时重新获取
        refetchOnReconnect: false,
      },
      mutations: {
        // 突变重试次数
        retry: 1,
      },
      dehydrate: {
        serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
      },
      hydrate: {
        deserializeData: superjson.deserialize,
      },
    },
  });
}