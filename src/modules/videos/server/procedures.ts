import { db } from "@/db"
import { videos } from "@/db/schema";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";


import { z } from "zod";
import { and, eq, or, lt, desc } from "drizzle-orm";
import { mux } from "@/lib/mux";

export const videosRouter = createTRPCRouter({


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
