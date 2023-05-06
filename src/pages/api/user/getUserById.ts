// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { jsonRes } from '@/service/response'
import { connectToDatabase } from '@/service/mongo'
import { User } from '@/service/models/user'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { userId } = req.query as {
      userId: string
    }

    if (!userId) {
      throw new Error('参数错误')
    }

    await connectToDatabase()

    // 根据 id 获取用户信息
    const user = await User.findById(userId)

    if (!user) {
      throw new Error('账号异常')
    }

    jsonRes(res, {
      data: user,
    })
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err,
    })
  }
}
