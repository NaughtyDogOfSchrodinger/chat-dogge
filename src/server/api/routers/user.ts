import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@/server/api/trpc'
import { prisma } from '@/server/db'
import { z } from 'zod'
import { updateToken } from '@/server/api/schema'
import { sendMessageToDiscord } from '@/utils/sendMessageToDiscord'
import { revalidateHome } from '@/utils/revalidateHome'

export const userRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({ ctx }) => {
    return await prisma.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
      select: {
        id: true,
        tokenCount: true,
      },
    })
  }),

  getById: publicProcedure.input(z.string()).query(({ input: id, ctx }) => {
    return prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        tokenCount: true,
      },
    })
  }),
  cost: publicProcedure.input(updateToken).mutation(async ({ input, ctx }) => {
    return await prisma.user.update({
      where: {
        id: input.userId,
      },
      data: {
        tokenCount: { decrement: input.count },
      },
    })
  }),
})
