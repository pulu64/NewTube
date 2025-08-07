import { DEFAULT_LIMIT } from "@/constants";
import { HydrateClient, trpc } from "@/trpc/server";
import { auth } from "@clerk/nextjs/server";

import { VideosView } from "@/modules/playlists/ui/views/videos-view";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ playlistId: string }>;
}

const Page = async ({ params }: PageProps) => {
  const { playlistId } = await params;
  const { userId } = await auth();

  // 只在用户登录时预取数据
  if (userId) {
    try {
      await trpc.playlists.getOne.prefetch({ id: playlistId });
      await trpc.playlists.getVideos.prefetchInfinite({ playlistId, limit: DEFAULT_LIMIT });
    } catch (error) {
      console.error('Playlist prefetch error:', error);
      // 继续渲染，让客户端处理数据获取
    }
  }

  return (
    <HydrateClient>
      <VideosView playlistId={playlistId} />
    </HydrateClient>
  );
}

export default Page;
