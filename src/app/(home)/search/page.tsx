import { HydrateClient, trpc } from "@/trpc/server";

import { DEFAULT_LIMIT } from "@/constants";

import { SearchView } from "@/modules/search/ui/views/search-view";

export const dynamic = "force-dynamic";

// 添加错误边界
const handlePrefetchError = (error: unknown) => {
  console.error('Prefetch error:', error);
  // 在开发环境中显示错误，生产环境中静默处理
  if (process.env.NODE_ENV === 'development') {
    console.warn('Continuing with client-side data fetching');
  }
};

interface PageProps {
  searchParams: Promise<{
    query: string | undefined;
    categoryId: string | undefined;
  }>
}

const Page = async ({ searchParams }: PageProps) => {
  const { query, categoryId } = await searchParams;

  try {
    // 预取分类数据
    await trpc.categories.getMany.prefetch();

    // 预取搜索数据
    await trpc.search.getMany.prefetchInfinite({
      query,
      categoryId,
      limit: DEFAULT_LIMIT,
    });
  } catch (error) {
    handlePrefetchError(error);
    // 继续渲染，让客户端处理数据获取
  }

  return (
    <HydrateClient>
      <SearchView query={query} categoryId={categoryId} />
    </HydrateClient>
  );
}

export default Page;

