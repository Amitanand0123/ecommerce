import { authRouter } from "./routers/auth";
import { categoryRouter } from "./routers/category";
import { router } from "./trpc";

export const appRouter=router({
    auth:authRouter,
    category:categoryRouter
})

export type AppRouter=typeof appRouter