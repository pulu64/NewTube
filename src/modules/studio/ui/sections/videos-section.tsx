"use client"
import { trpc } from "@/trpc/client";
import { DEFAULT_LIMIT } from "@/constants";
import { Suspense } from "react";
import { format } from "date-fns";
import { ErrorBoundary } from "react-error-boundary";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import VideoThumbnail from "@/modules/videos/ui/components/video-thumbnail";
import { snakeCaseToTitle } from "@/lib/utils";
import { GlobeIcon, LockIcon } from "lucide-react";


const VideosSection = () => {
  return (
    <Suspense fallback={<VideosSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Error</div>}>
        <VideosSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  )
}

const VideosSectionSkeleton = () => {
  return (
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
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell className="pl-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-20 w-36" />
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {/* visibility */}
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                {/* status */}
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                {/* date */}
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell className="text-right">
                {/* views */}
                <Skeleton className="h-4 w-12 ml-auto" />
              </TableCell>
              <TableCell className="text-right">
                {/* comments */}
                <Skeleton className="h-4 w-12 ml-auto" />
              </TableCell>
              <TableCell className="text-right">
                {/* likes */}
                <Skeleton className="h-4 w-12 ml-auto pr-6" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
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
              <TableHead className="text-right text-sm">Views</TableHead>
              <TableHead className="text-right text-sm">Comments</TableHead>
              <TableHead className="text-right pr-6 text-sm">Likes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.pages.flatMap((page) => (
              page.items.map((item) => (
                <Link href={`/studio/videos/${item.id}`} key={item.id} legacyBehavior>
                  <TableRow className="cursor-pointer">
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-4">
                        <div className="relative aspect-video w-36 shrink=0">
                          <VideoThumbnail
                            imageUrl={item.thumbnailUrl}
                            previewUrl={item.previewUrl}
                            title={item.title}
                            duration={item.duration || 0}
                          />
                        </div>
                        <div className="flex flex-col overflow-hidden gap-y-1">
                          <span className="text-sm line-clamp-1">
                            {item.title}
                          </span>
                          <span className="text-xs line-clamp-1 text-muted-foreground">
                            {item.description || "No description"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {item.visibility === 'private' ? (
                          <LockIcon className="size-4 mr-2" />
                        ) : (
                          <GlobeIcon className="size-4 mr-2" />
                        )}
                        {snakeCaseToTitle(item.visibility)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {snakeCaseToTitle(item.muxStatus || "error")}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm truncate">
                      {format(new Date(item.createdAt), "d MMM yyyy")}
                    </TableCell>
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