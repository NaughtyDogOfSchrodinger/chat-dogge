// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { jsonRes } from '@/service/response'
import { connectToDatabase } from '@/service/mongo'
import { authToken } from '@/service/utils/tools'
import { ModelUserRel } from '@/service/models/modelUserRel'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    const { modelId, like } = req.body as {
      modelId: string
      like: boolean
    }
    const { authorization } = req.headers

    if (!authorization) {
      throw new Error('请先登录')
    }

    if (!modelId) {
      throw new Error('参数错误')
    }

    // 凭证校验
    const userId = await authToken(authorization)

    await connectToDatabase()
    const rel = await ModelUserRel.findOne({ userId, modelId })

    if (like) {
      if (!rel) {
        await ModelUserRel.create({ userId, modelId })
      }
    } else {
      if (rel) {
        await ModelUserRel.findByIdAndDelete(rel._id)
      }
    }
    jsonRes(res, {})
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err,
    })
  }
}
