import { prisma } from '@/server/db'
import { NextApiHandler } from 'next'
import { appRouter } from '@/server/api/root'

const handler: NextApiHandler = async (req, res) => {
  const id = req.query.id as string
  if (id) {
    const caller = appRouter.createCaller({ prisma, session: null })
    const num = await caller.user.getById(id)
    if (num) {
      return res.status(200).json({ tokenCount: num.tokenCount.toString() })
    } else {
      return res.status(200).json({ tokenCount: 0 })
    }
  } else {
    return res.status(200).json({})
  }
}

export default handler
