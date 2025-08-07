import { ResponsiveModal } from "@/components/responsive-modal"
import { UploadDropzone } from "@/lib/uploadthing"
import { trpc } from "@/trpc/client"
import { toast } from "sonner"

interface ThumbnailUploadModalProps {
  videoId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}


export const ThumbnailUploadModal = ({ videoId, open, onOpenChange }: ThumbnailUploadModalProps) => {
  const utils = trpc.useUtils()

  const uploadComplete = (fileUrl: string) => {
    onOpenChange(false)
    utils.studio.getOne.invalidate({ id: videoId })
    utils.studio.getMany.invalidate()
    toast.success("Thumbnail uploaded")
  }

  return (
    <ResponsiveModal
      title="Upload a thumbnail"
      open={open}
      onOpenChange={onOpenChange}>
      <UploadDropzone endpoint="thumbnailUploader" input={{ videoId }} onClientUploadComplete={uploadComplete} onUploadError={(error: Error) => {
        console.log(error)
      }} />


    </ResponsiveModal>


  )

}