import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UTApi } from "uploadthing/server";
import { auth } from '@clerk/nextjs/server';
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { users, videos } from "@/db/schema";
import { and, eq } from "drizzle-orm";

const f = createUploadthing()

export const ourFileRouter = {
  thumbnailUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .input(z.object({
      videoId: z.string(),
    }))
    .middleware(async ({ input }) => {
      const { userId: clerkUserId } = await auth();
      if (!clerkUserId) throw new TRPCError({ code: "UNAUTHORIZED" });
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkUserId))
      if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });
      const [existingVideo] = await db
        .select({
          thumbnailKey: videos.thumbnailKey,
        })
        .from(videos)
        .where(and(
          eq(videos.id, input.videoId),
          eq(videos.userId, user.id),
        ))
      if (!existingVideo) throw new TRPCError({ code: "NOT_FOUND" });
      if (existingVideo.thumbnailKey) {
        const ut = new UTApi({})
        await ut.deleteFiles(existingVideo.thumbnailKey)
        await db
          .update(videos)
          .set({
            thumbnailKey: null,
            thumbnailUrl: null,
          })
          .where(eq(videos.id, input.videoId))
      }
      return { user, ...input };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db.update(videos).set({
        thumbnailUrl: file.url,
        thumbnailKey: file.key,
      }).where(and(
        eq(videos.id, metadata.videoId),
        eq(videos.userId, metadata.user.id)))
      return { uploadedBy: metadata.user.id, fileUrl: file.url }
    })
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
