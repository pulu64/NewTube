"use client"

import { Button } from "@/components/ui/button"
import { Loader2Icon, PlusIcon } from "lucide-react"
import { trpc } from "@/trpc/client"
import { toast } from "sonner"
import ResponsiveDialog from "@/components/responsive-dialog"

import StudioUploader from "./studio-uploader"

const StudioUploadModal = () => {
  const utils = trpc.useUtils();
  const create = trpc.videos.create.useMutation({
    onSuccess: () => {
      toast.success("Video created successfully");
      utils.studio.getMany.invalidate();
    },
    onError: (error) => {
      toast.error("Something went wrong");
      console.error(error);

    },
  });
  return (
    <>
      <ResponsiveDialog open={!!create.data?.url} onOpenChange={() => {
        create.reset();
      }}
        title="Create Video"
        description="Create a new video"
        footer={<Button>Create</Button>}
      >
        {create.data?.url
          ? <StudioUploader endpoint={create.data.url} onSuccess={() => {
            create.reset();
          }} />
          : (
            <Loader2Icon className="size-4 animate-spin" />
          )}
      </ResponsiveDialog>
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