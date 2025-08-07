import MuxPlayer from '@mux/mux-player-react'
import { THUMBNAIL_FALLBACK } from '../../constants'
import { useState } from 'react'

interface VideoPlayerProps {
  playbackId: string | null
  thumbnailUrl?: string | null
  autoPlay?: boolean
  onPlay?: () => void
}

export const VideoPlayerSkeleton = () => {
  return <div className="aspect-video bg-black rounded-xl" />
};

export const VideoPlayer = ({ playbackId, thumbnailUrl, autoPlay, onPlay }: VideoPlayerProps) => {
  const [hasError, setHasError] = useState(false);

  // 如果没有 playbackId，显示占位符
  if (!playbackId) {
    return (
      <div className="aspect-video bg-black rounded-xl flex items-center justify-center">
        <p className="text-white text-sm">Video not available</p>
      </div>
    );
  }

  // 如果有错误，显示错误状态
  if (hasError) {
    return (
      <div className="aspect-video bg-black rounded-xl flex items-center justify-center">
        <p className="text-white text-sm">Failed to load video</p>
      </div>
    );
  }

  return (
    <MuxPlayer
      playbackId={playbackId}
      poster={thumbnailUrl || THUMBNAIL_FALLBACK}
      playerInitTime={0}
      autoPlay={autoPlay}
      thumbnailTime={0}
      onPlay={onPlay}
      onError={(error) => {
        console.error('Mux player error:', error);
        setHasError(true);
      }}
      onLoadStart={() => setHasError(false)}
      className="w-full h-full object-contain"
      accentColor="#FF2056"
      // 添加更好的错误处理配置
      preload="metadata"
      crossOrigin="anonymous"
    />
  )
}
