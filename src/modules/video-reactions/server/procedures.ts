import { z } from "zod";
import { db } from "@/db";
import { and, eq } from "drizzle-orm";
import { videoReactions } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const videoReactionsRouter = createTRPCRouter({
  like: protectedProcedure
    .input(z.object({ videoId: z.string().uuid(), }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { videoId } = input;
      const [existingVideoReactionLike] = await db
        .select()
        .from(videoReactions)
        .where(and(
          eq(videoReactions.userId, userId),
          eq(videoReactions.videoId, videoId),
          eq(videoReactions.type, "like"),
        ));
      // If the user has already liked the video, delete the reaction
      if (existingVideoReactionLike) {
        const [deletedVideoReaction] = await db
          .delete(videoReactions)
          .where(and(
            eq(videoReactions.userId, userId),
            eq(videoReactions.videoId, videoId),
          ))
          .returning();
        return deletedVideoReaction;
      }
      // If the user has not liked the video, create the reaction
      const [createdVideoReaction] = await db
        .insert(videoReactions)
        .values({
          userId,
          videoId,
          type: "like",
        })
        .onConflictDoUpdate({
          target: [videoReactions.userId, videoReactions.videoId],
          set: {
            type: "like",
          },
        })
        .returning();
      return createdVideoReaction;
    }),
  dislike: protectedProcedure
    .input(z.object({ videoId: z.string().uuid(), }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { videoId } = input;
      const [existingVideoReactionDislike] = await db
        .select()
        .from(videoReactions)
        .where(and(
          eq(videoReactions.userId, userId),
          eq(videoReactions.videoId, videoId),
          eq(videoReactions.type, "dislike"),
        ));
      // If the user has already disliked the video, delete the reaction
      if (existingVideoReactionDislike) {
        const [deletedVideoReaction] = await db
          .delete(videoReactions)
          .where(and(
            eq(videoReactions.userId, userId),
            eq(videoReactions.videoId, videoId),
          ))
          .returning();
        return deletedVideoReaction;
      }
      // If the user has not disliked the video, create the reaction
      const [createdVideoReaction] = await db
        .insert(videoReactions)
        .values({
          userId,
          videoId,
          type: "dislike",
        })
        .onConflictDoUpdate({
          target: [videoReactions.userId, videoReactions.videoId],
          set: {
            type: "dislike",
          },
        })
        .returning();
      return createdVideoReaction;
    }),
});