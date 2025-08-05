import Image from "next/image"
import { formatDuration } from "@/lib/utils";
import { THUMBNAIL_FALLBACK } from "./constant";

interface VideoThumbnailProps {
  imageUrl?: string | null;
  previewUrl?: string | null;
  title: string;
  duration?: number;
}
const VideoThumbnail = ({ imageUrl, previewUrl, title, duration }: VideoThumbnailProps) => {
  return (
    <div>
      <div className="relative group">
        <div className="relative w-full overflow-hidden rounded-xl aspect-video">
          <Image
            src={imageUrl || THUMBNAIL_FALLBACK}
            alt={title}
            fill
            className="h-full w-full object-cover group-hover:opacity-0" />
          <Image
            unoptimized={!!previewUrl}
            src={previewUrl || THUMBNAIL_FALLBACK}
            alt={title}
            fill
            className="h-full w-full object-cover opacity-0 group-hover:opacity-100" />
        </div>
        <div className="absolute bottom-2 right-2 bg-black/80 py-0.5 rounded text-xs text-white font-medium">
          {duration ? formatDuration(duration) : "00:00"}
        </div>
      </div>
    </div>
  )
}

export default VideoThumbnail