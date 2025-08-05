import MuxPlayer from '@mux/mux-player-react'
import { THUMBNAIL_FALLBACK } from './constant'
interface VideoPlayerProps {
  playbackId: string
  thumbnailUrl?: string
  autoPlay?: boolean
  onPlay?: () => void
}
const VideoPlayer = ({ playbackId, thumbnailUrl, autoPlay, onPlay }: VideoPlayerProps) => {

  return (
    <MuxPlayer
      playbackId={playbackId || ''}
      poster={thumbnailUrl || THUMBNAIL_FALLBACK}
      playerInitTime={0}
      autoPlay={autoPlay}
      thumbnailTime={0}
      onPlay={onPlay}
      className="w-full h-full object-contain"
      accentColor="#FF2056"
    />
  )
}

export default VideoPlayer