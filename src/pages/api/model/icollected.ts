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
    const { userId } = req.query as {
      userId: string
    }

    if (!userId) {
      throw new Error('参数错误')
    }

    await connectToDatabase()

    const rels = await ModelUserRel.find({ userId })
    const models = await Model.find({
      _id: { $in: rels.map((rel) => rel.modelId) },
    })
      .populate({
        path: 'userId',
        options: {
          strictPopulate: false,
        },
      })
      .sort({
        _id: -1,
      })
    models.map((model) => {
      model.like = true
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
