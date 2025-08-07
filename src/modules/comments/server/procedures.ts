import { z } from "zod";
import { and, count, desc, eq, getTableColumns, inArray, isNull, lt, or } from "drizzle-orm";

import { db } from "@/db";
import { TRPCError } from "@trpc/server";
import { commentReactions, comments, users } from "@/db/schema";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const commentsRouter = createTRPCRouter({
  remove: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      const { id: userId } = ctx.user;

      // 首先检查评论是否存在且属于当前用户
      const [existingComment] = await db
        .select()
        .from(comments)
        .where(and(
          eq(comments.id, id),
          eq(comments.userId, userId),
        ));

      if (!existingComment) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // 先删除所有子评论（回复）
      await db
        .delete(comments)
        .where(eq(comments.parentId, id));

      // 再删除主评论
      const [deletedComment] = await db
        .delete(comments)
        .where(eq(comments.id, id))
        .returning();

      return deletedComment;
    }),
  create: protectedProcedure
    .input(z.object({
      parentId: z.string().uuid().nullish(),
      videoId: z.string().uuid(),
      value: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { parentId, videoId, value } = input;
      const { id: userId } = ctx.user;

      const [existingComment] = await db
        .select()
        .from(comments)
        .where(inArray(comments.id, parentId ? [parentId] : []));

      if (!existingComment && parentId) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (existingComment?.parentId && parentId) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const [createdComment] = await db
        .insert(comments)
        .values({ userId, videoId, parentId, value })
        .returning();

      return createdComment;
    }),
  getMany: baseProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
        parentId: z.string().uuid().nullish(),
        cursor: z.object({
          id: z.string().uuid(),
          updatedAt: z.date(),
        }).nullish(),
        limit: z.number().min(1).max(100),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { clerkUserId } = ctx;
      const { parentId, videoId, cursor, limit } = input;

      let userId;

      const [user] = await db
        .select()
        .from(users)
        .where(inArray(users.clerkId, clerkUserId ? [clerkUserId] : []));

      if (user) {
        userId = user.id;
      }

      // 获取基础评论数据
      const commentsData = await db
        .select({
          ...getTableColumns(comments),
          user: users,
        })
        .from(comments)
        .where(
          and(
            eq(comments.videoId, videoId),
            parentId
              ? eq(comments.parentId, parentId)
              : isNull(comments.parentId),
            cursor
              ? or(
                lt(comments.updatedAt, cursor.updatedAt),
                and(
                  eq(comments.updatedAt, cursor.updatedAt),
                  lt(comments.id, cursor.id)
                )
              )
              : undefined,
          )
        )
        .innerJoin(users, eq(comments.userId, users.id))
        .orderBy(desc(comments.updatedAt), desc(comments.id))
        .limit(limit + 1);

      // 获取评论ID列表
      const commentIds = commentsData.map(comment => comment.id);

      // 并行获取统计数据
      const [totalCount, reactionsData, repliesData, userReactionsData] = await Promise.all([
        // 总评论数
        db
          .select({ count: count() })
          .from(comments)
          .where(and(
            eq(comments.videoId, videoId),
            parentId
              ? eq(comments.parentId, parentId)
              : isNull(comments.parentId),
          )),

        // 评论反应统计
        db
          .select({
            commentId: commentReactions.commentId,
            type: commentReactions.type,
            count: count(),
          })
          .from(commentReactions)
          .where(inArray(commentReactions.commentId, commentIds))
          .groupBy(commentReactions.commentId, commentReactions.type),

        // 回复数量统计
        db
          .select({
            parentId: comments.parentId,
            count: count(),
          })
          .from(comments)
          .where(inArray(comments.parentId, commentIds))
          .groupBy(comments.parentId),

        // 当前用户的反应
        userId ? db
          .select({
            commentId: commentReactions.commentId,
            type: commentReactions.type,
          })
          .from(commentReactions)
          .where(and(
            inArray(commentReactions.commentId, commentIds),
            eq(commentReactions.userId, userId)
          )) : Promise.resolve([]),
      ]);

      // 处理数据
      const hasMore = commentsData.length > limit;
      const items = hasMore ? commentsData.slice(0, -1) : commentsData;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? {
          id: lastItem.id,
          updatedAt: lastItem.updatedAt,
        }
        : null;

      // 构建反应统计映射
      const reactionsMap = new Map();
      reactionsData.forEach(reaction => {
        const key = `${reaction.commentId}-${reaction.type}`;
        reactionsMap.set(key, reaction.count);
      });

      // 构建回复数量映射
      const repliesMap = new Map();
      repliesData.forEach(reply => {
        repliesMap.set(reply.parentId, reply.count);
      });

      // 构建用户反应映射
      const userReactionsMap = new Map();
      userReactionsData.forEach(reaction => {
        userReactionsMap.set(reaction.commentId, reaction.type);
      });

      // 组装最终数据
      const enrichedItems = items.map(comment => ({
        ...comment,
        viewerReaction: userReactionsMap.get(comment.id) || null,
        replyCount: repliesMap.get(comment.id) || 0,
        likeCount: reactionsMap.get(`${comment.id}-like`) || 0,
        dislikeCount: reactionsMap.get(`${comment.id}-dislike`) || 0,
      }));

      return {
        totalCount: totalCount[0].count,
        items: enrichedItems,
        nextCursor,
      };
    }),
});
