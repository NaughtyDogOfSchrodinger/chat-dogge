import { prisma } from '@/server/db'
import { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => {
  const id = req.query.id as string
  if (id) {
    const me = await prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        tokenCount: true,
      },
    })
    return res.status(200).json(me ? me.tokenCount.toString() : '0')
  } else {
    return res.status(401).end()
  }
}

export default handler
