import { DEFAULT_LIMIT } from "@/constants";
import { HydrateClient, trpc } from "@/trpc/server";
import { auth } from "@clerk/nextjs/server";

import { PlaylistsView } from "@/modules/playlists/ui/views/playlists-view";

export const dynamic = "force-dynamic";

// 添加错误边界
const handlePrefetchError = (error: unknown) => {
  console.error('Playlists prefetch error:', error);
  // 在开发环境中显示错误，生产环境中静默处理
  if (process.env.NODE_ENV === 'development') {
    console.warn('Continuing with client-side data fetching');
  }
};

const Page = async () => {
  const { userId } = await auth();

  // 只在用户登录时预取数据
  if (userId) {
    try {
      await trpc.playlists.getMany.prefetchInfinite({ limit: DEFAULT_LIMIT });
    } catch (error) {
      handlePrefetchError(error);
      // 继续渲染，让客户端处理数据获取
    }
  }

  return (
    <HydrateClient>
      <PlaylistsView />
    </HydrateClient>
  );
};

export default Page;
