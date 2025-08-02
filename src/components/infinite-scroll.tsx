import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { useEffect } from "react";
import { Button } from "./ui/button";
import { ArrowDownIcon, Loader2Icon } from "lucide-react";

interface InfiniteScrollProps {
  isManual?: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

export const InfiniteScroll = ({
  isManual = false,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage }: InfiniteScrollProps) => {
  const { isIntersecting, targetRef } = useIntersectionObserver({
    threshold: 1,
    rootMargin: "100px",
  });
  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage && !isManual) {
      fetchNextPage();
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage, isManual]);
  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div ref={targetRef} className="h-1"></div>
      {hasNextPage ? (


        <Button
          variant="secondary"
          disabled={!hasNextPage || isFetchingNextPage}
          onClick={() => fetchNextPage()}>
          {isFetchingNextPage ? <Loader2Icon className="size-4 animate-spin" /> : <ArrowDownIcon className="size-4" />}
        </Button>
      ) : (
        <p className="text-xs text-muted-foreground">You have reached the end</p>
      )}
    </div>
  )
}