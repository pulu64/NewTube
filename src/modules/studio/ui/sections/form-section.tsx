'use client'

import { Button } from "@/components/ui/button"
import { trpc } from "@/trpc/client"
import Link from "next/link"
import { ErrorBoundary } from "next/dist/client/components/error-boundary"
import { Suspense, useState } from "react"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CopyCheckIcon, CopyIcon, GlobeIcon, ImagePlusIcon, Loader2Icon, MoreHorizontalIcon, RotateCcwIcon, SparklesIcon, TrashIcon } from "lucide-react"
import { LockIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { videoUpdateSchema } from "@/db/schema"
import { Skeleton } from "@/components/ui/skeleton"

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { z } from "zod"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import VideoPlayer from "@/modules/videos/ui/components/video-player"
import { snakeCaseToTitle } from "@/lib/utils"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { THUMBNAIL_FALLBACK } from "@/modules/videos/ui/components/constant"
import ThumbnailUploadModal from "../components/thumbnail-upload-modal"
import { ThumbnailGenerateModal } from "../components/thumbnail-generate-modal"

interface FormSectionProps {
  videoId: string
}

const FormSection = ({ videoId }: FormSectionProps) => {
  return (
    <Suspense fallback={<FormSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Error</div>}>
        <FormSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  )
}

export const FormSectionSkeleton = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="space-y-8 lg:col-span-3">
          <div className="space-y-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-[220px] w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-[84px] w-[153px]" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="flex flex-col gap-y-8 lg:col-span-2">
          <div className="flex flex-col gap-4 bg-[#F9F9F9] rounded-xl overflow-hidden">
            <Skeleton className="aspect-video" />
            <div className="px-4 py-4 space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-32" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
};

const FormSectionSuspense = ({ videoId }: FormSectionProps) => {
  const [thumbnailModalOpen, setThumbnailModalOpen] = useState(false)
  const [thumbnailGenerateModalOpen, setThumbnailGenerateModalOpen] = useState(false)
  const router = useRouter()
  const utils = trpc.useUtils()
  const [video] = trpc.studio.getOne.useSuspenseQuery({ id: videoId })
  console.log(video.thumbnailUrl)
  const [categories] = trpc.categories.getMany.useSuspenseQuery()
  const form = useForm<z.infer<typeof videoUpdateSchema>>({
    resolver: zodResolver(videoUpdateSchema),
    defaultValues: video
  })

  const removeVideo = trpc.videos.remove.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate()
      toast.success("Video deleted")
      router.push("/studio")
    },
    onError: () => {
      toast.error("Something went wrong")
    }
  })

  const updateVideo = trpc.videos.update.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate()
      utils.studio.getOne.invalidate({ id: videoId })
      toast.success("Video updated")
    },
    onError: () => {
      toast.error("Something went wrong")
    }
  })

  const generateTitle = trpc.videos.generateTitle.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate()
      utils.studio.getOne.invalidate({ id: videoId })
      toast.success("Title generated")
    },
    onError: () => {
      toast.error("Something went wrong")
    }
  })

  const generateDescription = trpc.videos.generateDescription.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate()
      utils.studio.getOne.invalidate({ id: videoId })
      toast.success("Description generated")
    },
    onError: () => {
      toast.error("Something went wrong")
    }
  })

  const generateThumbnail = trpc.videos.generateThumbnail.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate()
      utils.studio.getOne.invalidate({ id: videoId })
      toast.success("Background job started", { description: "This may take some time" })
    },
    onError: () => {
      toast.error("Something went wrong")
    }
  })

  const restoreThumbnail = trpc.videos.restoreThumbnail.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate()
      utils.studio.getOne.invalidate({ id: videoId })
      toast.success("Thumbnail restored")
    },
    onError: () => {
      toast.error("Something went wrong")
    }
  })

  const onSubmit = (data: z.infer<typeof videoUpdateSchema>) => {
    updateVideo.mutate({
      id: videoId,
      ...data,
    })
  }

  const fullUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/videos/${video.id}`
  const [isCopied, setIsCopied] = useState(false)

  const onCopy = () => {
    navigator.clipboard.writeText(fullUrl)
    setIsCopied(true)
    setTimeout(() => {
      setIsCopied(false)
    }, 2000)
  }

  return (
    <>
      <ThumbnailUploadModal
        videoId={videoId}
        open={thumbnailModalOpen}
        onOpenChange={setThumbnailModalOpen}
      />
      <ThumbnailGenerateModal
        videoId={videoId}
        open={thumbnailGenerateModalOpen}
        onOpenChange={setThumbnailGenerateModalOpen}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Video details</h1>
              <p className="text-sm text-muted-foreground">Manage your video details</p>
            </div>
            <div className="flex items-center gap-x-2">
              <Button type="submit" disabled={updateVideo.isPending}>
                Save
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="cursor-pointer" onClick={() => removeVideo.mutate({ id: videoId })}>
                    <TrashIcon className="size-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="space-y-8 lg:col-span-3">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div className="flex items-center gap-x-2">
                        Title
                        <Button
                          className="rounded-full size-6 [&_svg]:size-4"
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => generateTitle.mutate({ id: videoId })}
                          disabled={generateTitle.isPending || !video.muxTrackId}>
                          {generateTitle.isPending ? <Loader2Icon className="animate-spin" /> : <SparklesIcon />}
                        </Button>
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input {...field}
                        placeholder="Add a title to your video"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div className="flex items-center gap-x-2">
                        Description
                        <Button
                          className="rounded-full size-6 [&_svg]:size-4"
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => generateDescription.mutate({ id: videoId })}
                          disabled={generateDescription.isPending || !video.muxTrackId}>
                          {generateDescription.isPending ? <Loader2Icon className="animate-spin" /> : <SparklesIcon />}
                        </Button>
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        placeholder="Add a description to your video"
                        rows={10}
                        className="resize-none pr-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* TODO: Add thumbnail uploader */}
              <FormField
                control={form.control}
                name="thumbnailUrl"
                render={({ }) => (
                  <FormItem>
                    <FormLabel>Thumbnail</FormLabel>
                    <FormControl>
                      <div className="p-0.5 border border-dashed border-neutral-400 relative h-[84px] w-[153px] group">
                        <Image src={video.thumbnailUrl || THUMBNAIL_FALLBACK} alt="Thumbnail" fill className="object-cover" />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button type="button" size="icon" className="bg-black/50 hover:bg-black/50 absolute top-1 right-1 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 duration-300 size-7">
                              <MoreHorizontalIcon className="text-white" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" side="right">
                            <DropdownMenuItem onClick={() => setThumbnailModalOpen(true)} className="cursor-pointer">
                              <ImagePlusIcon className="size-4 mr-2" />
                              Change
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer" onClick={() => setThumbnailGenerateModalOpen(true)}>
                              <SparklesIcon className="size-4 mr-2" />
                              AI-generated
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer" onClick={() => restoreThumbnail.mutate({ id: videoId })}>
                              <RotateCcwIcon className="size-4 mr-2" />
                              Restore
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                          {/* <ThumbnailUploader /> */}
                        </DropdownMenu>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value ?? undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        {/* TODO: Add categories */}
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                        <FormMessage />
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col gap-y-8 lg:col-span-2">
              <div className="flex flex-col gap-4 bg-[#F9F9F9] rounded-xl overflow-hidden h-fit">
                <div className="aspect-video overflow-hidden relative">
                  <VideoPlayer
                    playbackId={video.muxPlaybackId ?? ""}
                    thumbnailUrl={video.thumbnailUrl ?? ""}
                    autoPlay={false}
                    onPlay={() => {
                      console.log("play")
                    }}
                  />
                </div>
                <div className="p-4 flex flex-col gap-y-6">
                  <div className="flex justify-between items-center gap-x-2">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-muted-foreground text-xs">Video link</p>
                      <div className="flex items-center gap-x-2">
                        <Link href={`/videos/${video.id}`}>
                          <p className="line-clamp-1 text-sm text-blue-500">{fullUrl}</p>
                        </Link>
                        <Button type="button" variant="ghost" size="icon" className="shrink-0"
                          onClick={onCopy} disabled={isCopied}>
                          {isCopied ? <CopyCheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-muted-foreground text-xs">
                        Video status
                      </p>
                      <p className="text-sm">
                        {snakeCaseToTitle(video.muxStatus || 'preparing')}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-muted-foreground text-xs">
                        Subtitles status
                      </p>
                      <p className="text-sm">
                        {snakeCaseToTitle(video.muxTrackStatus || 'no_subtitles')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value ?? undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a visibility" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="public">
                            <div className="flex items-center">
                              <GlobeIcon className="size-4 mr-2" />Public
                            </div>
                          </SelectItem>
                          <SelectItem value="private">
                            <div className="flex items-center">
                              <LockIcon className="size-4 mr-2" />Private
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />

            </div>
          </div>
        </form>
      </Form >
    </>
  )
}

export default FormSection