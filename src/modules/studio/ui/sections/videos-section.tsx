"use client"
import { trpc } from "@/trpc/client";
import { DEFAULT_LIMIT } from "@/constants";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import Link from "next/link";


const VideosSection = () => {
  return (
    <Suspense fallback={<VideosSkeleton />}>
      <ErrorBoundary fallback={<div>Error</div>}>
        <VideosSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  )
}

const VideosSkeleton = () => {
  return <div>Loading...</div>
}

const VideosSectionSuspense = () => {
  const [videos, query] = trpc.studio.getMany.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => {
        if (!lastPage.nextCursor?.id || !lastPage.nextCursor?.updatedAt) {
          return undefined;
        }
        return {
          id: lastPage.nextCursor.id,
          updatedAt: lastPage.nextCursor.updatedAt,
        };
      },
    }
  );



  return (
    <div>
      <div className="border-y">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6 w-[510px]">Video</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Comments</TableHead>
              <TableHead className="text-right pr-6">Likes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.pages.flatMap((page) => (
              page.items.map((item) => (
                <Link href={`/studio/videos/${item.id}`} key={item.id} legacyBehavior>
                  <TableRow className="cursor-pointer">
                    <TableCell>{item.title}</TableCell>
                    <TableCell>{item.visibility}</TableCell>
                    <TableCell>{item.status}</TableCell>
                    <TableCell>{item.date.toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">{item.views}</TableCell>
                    <TableCell className="text-right">{item.comments}</TableCell>
                    <TableCell className="text-right pr-6">{item.likes}</TableCell>
                  </TableRow>
                </Link>
              ))
            ))}
          </TableBody>
        </Table>
      </div>
      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </div>
  )
}

export default VideosSection