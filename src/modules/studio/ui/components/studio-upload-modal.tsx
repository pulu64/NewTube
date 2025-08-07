"use client"

import { Button } from "@/components/ui/button"
import { Loader2Icon, PlusIcon } from "lucide-react"
import { trpc } from "@/trpc/client"
import { toast } from "sonner"
import { ResponsiveModal } from "@/components/responsive-modal"
import StudioUploader from "./studio-uploader"
import { useRouter } from "next/navigation"

const StudioUploadModal = () => {
  const router = useRouter();
  const utils = trpc.useUtils();
  const create = trpc.videos.create.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate();
      toast.success("Video created successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Something went wrong");
    },
  });

  const onSuccess = () => {
    if (!create.data?.video.id) {
      return;
    }
    create.reset();
    router.push(`/studio/videos/${create.data?.video.id}`);
  }

  return (
    <>
      <ResponsiveModal open={!!create.data?.url} onOpenChange={() => {
        create.reset();
      }}
        title="Create Video"
        description="Create a new video"
        footer={<Button>Create</Button>}
      >
        {create.data?.url
          ? <StudioUploader endpoint={create.data.url} onSuccess={onSuccess} />
          : (
            <Loader2Icon className="size-4 animate-spin" />
          )}
      </ResponsiveModal>
      <Button variant="secondary" onClick={() => create.mutate({
        title: "New Video",
        description: "Video description",
      })}
        disabled={create.isPending}
      >
        {create.isPending ? <Loader2Icon className="size-4 animate-spin" /> : <PlusIcon className="size-4" />}
        <span>Create</span>
      </Button>

    </>
  )
}

export default StudioUploadModal