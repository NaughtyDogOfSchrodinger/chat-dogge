import type { NextApiRequest, NextApiResponse } from 'next'
import { jsonRes } from '@/service/response'
import { connectToDatabase } from '@/service/mongo'
import { authToken } from '@/service/utils/tools'
import { Model } from '@/service/models/model'
import { ModelUserRel } from '@/service/models/modelUserRel'

/* 获取我的模型 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    const { authorization } = req.headers

    if (!authorization) {
      throw new Error('无权操作')
    }

    // 凭证校验
    const userId = await authToken(authorization)

    await connectToDatabase()

    // 根据 userId 获取模型信息
    const models = await Model.find({
      userId,
    }).sort({
      _id: -1,
    })

    const rels = await ModelUserRel.find({ userId })
    const relSet = new Set<string>(rels.map((r) => r.modelId.toString()))
    models.map((model) => {
      model.like = relSet.has(model._id.toString())
    })

    jsonRes(res, {
      data: models,
    })
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err,
    })
  }
}