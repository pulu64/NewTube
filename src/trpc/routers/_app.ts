//import { z } from 'zod';
import { categoriesRouter } from '@/modules/categories/server/procedures';
import { studioRouter } from '@/modules/studio/server/procedures';
import { videosRouter } from '@/modules/videos/server/procedures';
import { videoViewsRouter } from '@/modules/video-views/server/procedures';
import { videoReactionsRouter } from '@/modules/video-reactions/server/procedures';
import { subscriptionsRouter } from '@/modules/subscriptions/server/procedure';
import { commentsRouter } from '@/modules/comments/server/procedures';
import { commentReactionsRouter } from '@/modules/comment-reactions/server/procedures';
import { suggestionsRouter } from '@/modules/suggestions/server/procedures';
import { searchRouter } from '@/modules/search/server/procedures';
import { playlistsRouter } from '@/modules/playlists/server/procedures';
import { createTRPCRouter } from '../init';
export const appRouter = createTRPCRouter({
  categories: categoriesRouter,
  videos: videosRouter,
  studio: studioRouter,
  videoViews: videoViewsRouter,
  videoReactions: videoReactionsRouter,
  subscriptions: subscriptionsRouter,
  comments: commentsRouter,
  commentReactions: commentReactionsRouter,
  suggestions: suggestionsRouter,
  search: searchRouter,
  playlists: playlistsRouter,
  //hello: protectedProcedure
  //.input(
  //  z.object({
  //    text: z.string(),
  //  }),
  //)
  //.query((opts) => {
  //console.log({ dbUser: opts.ctx.user })
  //return {
  //  greeting: `hello ${opts.input.text}`,
  //};
  //}),
});
// export type definition of API
export type AppRouter = typeof appRouter;