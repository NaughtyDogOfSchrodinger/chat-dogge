// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { jsonRes } from '@/service/response'
import { connectToDatabase, Model } from '@/service/mongo'
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
    const rels = await ModelUserRel.find({ modelId })
    const rel = rels.filter((rel) => rel.userId == userId)
    let favCount = rels.length
    if (like) {
      if (rel.length == 0) {
        favCount = favCount + 1
        await Model.findByIdAndUpdate(modelId, { favCount })
        await ModelUserRel.create({ userId, modelId })
      }
    } else {
      if (rel.length != 0) {
        favCount = favCount - 1
        await Model.findByIdAndUpdate(modelId, { favCount })
        await ModelUserRel.findByIdAndDelete(rel[0]?._id)
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
