import { db } from "@/db"
import { baseProcedure } from "@/trpc/init";
import { categories } from "@/db/schema";
import { createTRPCRouter } from "@/trpc/init";

export const categoriesRouter = createTRPCRouter({
  getMany: baseProcedure.query(async () => {

    const data = await db.select().from(categories);
    return data;
  }),
});
