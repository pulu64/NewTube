//import { z } from 'zod';
import { categoriesRouter } from '@/modules/categories/server/procedures';
import { studioRouter } from '@/modules/studio/server/procedures';
import { videosRouter } from '@/modules/videos/server/procedures';
import { createTRPCRouter } from '../init';
export const appRouter = createTRPCRouter({
  categories: categoriesRouter,
  videos: videosRouter,
  studio: studioRouter,
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