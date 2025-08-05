import { db } from "@/db"
import { protectedProcedure } from "@/trpc/init";
import { videos } from "@/db/schema";
import { createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import { and, eq, or, lt, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const studioRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { id } = input;
      const [video] = await db
        .select()
        .from(videos)
        .where(and(
          eq(videos.id, id),
          eq(videos.userId, userId),
        ))
        .limit(1);
      if (!video) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }
      return video;
    }),

  getMany: protectedProcedure
    .input(z.object({
      cursor: z.object({
        id: z.string().uuid(),
        updatedAt: z.date(),
      })
        .nullish(),
      limit: z.number().min(1).max(100),
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
        ),
        )
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
