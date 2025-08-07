import { DEFAULT_LIMIT } from "@/constants";
import { HydrateClient, trpc } from "@/trpc/server";
import { auth } from "@clerk/nextjs/server";

import { LikedView } from "@/modules/playlists/ui/views/liked-view";

export const dynamic = "force-dynamic";

const Page = async () => {
  const { userId } = await auth();

  // 只在用户登录时预取数据
  if (userId) {
    try {
      await trpc.playlists.getLiked.prefetchInfinite({ limit: DEFAULT_LIMIT });
    } catch (error) {
      console.error('Liked videos prefetch error:', error);
      // 继续渲染，让客户端处理数据获取
    }
  }

  return (
    <HydrateClient>
      <LikedView />
    </HydrateClient>
  );
}

export default Page;