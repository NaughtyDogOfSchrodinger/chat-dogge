import { prisma } from '@/server/db'
import { NextApiHandler } from 'next'
import { appRouter } from '@/server/api/root'
import { updateToken } from '@/server/api/schema'

const handler: NextApiHandler = async (req, res) => {
  const data = req.body
  if (data) {
    const caller = appRouter.createCaller({ prisma, session: null })
    const num = await caller.user.cost(
      updateToken.parse({ count: data.count, userId: data.userId })
    )
    return res.status(200).json({ tokenCount: num.tokenCount.toString() })
  } else {
    return res.status(200).json({})
  }
}

export default handler
