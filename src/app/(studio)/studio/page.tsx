import { HydrateClient, trpc } from "@/trpc/server";
import StudioView from "@/modules/studio/studio-view";
import { DEFAULT_LIMIT } from "@/constants";

const Page = () => {
  void trpc.studio.getMany.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  });
  return (
    <HydrateClient>
      <StudioView />
    </HydrateClient>
  )
}

export default Page