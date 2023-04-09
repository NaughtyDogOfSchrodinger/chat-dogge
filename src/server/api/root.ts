import { openGptAppRouter } from '@/server/api/routers/openGptApp'
import { createTRPCRouter } from '@/server/api/trpc'
import { userRouter } from '@/server/api/routers/user'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  app: openGptAppRouter,
  user: userRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
