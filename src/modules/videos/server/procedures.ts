import { db } from "@/db"
import { videoUpdateSchema, videos } from "@/db/schema";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";


import { z } from "zod";
import { and, eq, or, lt, desc } from "drizzle-orm";
import { mux } from "@/lib/mux";
import { TRPCError } from "@trpc/server";
import { UTApi } from "uploadthing/server";
import { workflow } from "@/lib/workflow";

export const videosRouter = createTRPCRouter({
  generateDescription: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;
      const { workflowRunId } = await workflow.trigger({
        url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/description`,
        body: JSON.stringify({ userId, videoId: input.id }),
        retries: 3
      })
      return workflowRunId;
    }),
  generateTitle: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;
      const { workflowRunId } = await workflow.trigger({
        url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/title`,
        body: JSON.stringify({ userId, videoId: input.id }),
        retries: 3
      })
      return workflowRunId;
    }),
  generateThumbnail: protectedProcedure
    .input(z.object({ id: z.string().uuid(), prompt: z.string().min(10) }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const { workflowRunId } = await workflow.trigger({
        url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/thumbnail`,
        body: { userId, videoId: input.id, prompt: input.prompt },
        retries: 3
      });
      return workflowRunId;
    }),
  restoreThumbnail: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;

      const [existingVideo] = await db
        .select({
          thumbnailKey: videos.thumbnailKey,
          muxPlaybackId: videos.muxPlaybackId,
        })
        .from(videos)
        .where(and(
          eq(videos.id, input.id),
          eq(videos.userId, userId),
        ))

      if (!existingVideo) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Video not found" });
      }

      if (existingVideo.thumbnailKey) {
        const ut = new UTApi({})
        await ut.deleteFiles(existingVideo.thumbnailKey)
        await db
          .update(videos)
          .set({ thumbnailKey: null, thumbnailUrl: null })
          .where(eq(videos.id, input.id))
      }
      if (!existingVideo.muxPlaybackId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Video is not ready to restore thumbnail" });
      }

      const utapi = new UTApi({})
      const tempThumbnailUrl = `https://image.mux.com/${existingVideo.muxPlaybackId}/thumbnail.jpg`
      const uploadedThumbnail = await utapi.uploadFilesFromUrl(tempThumbnailUrl)
      if (!uploadedThumbnail?.data) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Failed to upload thumbnail" });
      }
      const { key: thumbnailKey, url: thumbnailUrl } = uploadedThumbnail.data;
      const [updatedVideo] = await db
        .update(videos)
        .set({ thumbnailKey, thumbnailUrl })
        .where(and(
          eq(videos.id, input.id),
          eq(videos.userId, userId),
        ))
        .returning();
      if (!updatedVideo) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Video not found" });
      }
      return updatedVideo;
    }),
  remove: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { id } = input;
      if (!id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Video ID is required" });
      }
      const [removedVideo] = await db.delete(videos).where(and(
        eq(videos.id, id),
        eq(videos.userId, userId),
      ))
        .returning()
      if (!removedVideo) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Video not found" });
      }
      return removedVideo;
    }),
  update: protectedProcedure
    .input(videoUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      if (!input.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Video ID is required" });
      }
      const [updatedVideo] = await db
        .update(videos)
        .set({
          title: input.title,
          description: input.description,
          categoryId: input.categoryId,
          visibility: input.visibility,
          updatedAt: new Date(),
        })
        .where(and(
          eq(videos.id, input.id),
          eq(videos.userId, userId),
        ))
        .returning();
      if (!updatedVideo) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Video not found" });
      }
      return updatedVideo;
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      categoryId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { user: { id: userId } } = ctx;
      const upload = await mux.video.uploads.create({
        new_asset_settings: {
          passthrough: userId,
          playback_policy: ["public"],
          input: [
            {
              generated_subtitles: [
                {
                  language_code: "en",
                  name: "English",
                }
              ]
            }
          ]
        },
        cors_origin: "*",
      });
      const [video] = await db
        .insert(videos)
        .values({
          userId,
          title: "Untitled",
          muxStatus: "waiting",
          muxUploadId: upload.id,
        })
        .returning();

      return {
        video,
        url: upload.url,
      }
    }),

  getMany: protectedProcedure
    .input(z.object({
      cursor: z.object({
        id: z.string(),
        updatedAt: z.date(),
      }).optional(),
      limit: z.number().min(1).max(100).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input;
      const { user: { id: userId } } = ctx;

      const data = await db
        .select().from(videos)
        .where(and(
          eq(videos.userId, userId),
          cursor ? or(
            eq(videos.id, cursor.id),
            lt(videos.updatedAt, cursor.updatedAt),
          ) : undefined,
        ))
        .orderBy(desc(videos.updatedAt), desc(videos.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = hasMore ? data[data.length - 1] : null;
      const nextCursor = hasMore
        ? {
          id: lastItem?.id,
          updatedAt: lastItem?.updatedAt,
        } : null;

      return {
        items,
        nextCursor,
      };
    }),
});
