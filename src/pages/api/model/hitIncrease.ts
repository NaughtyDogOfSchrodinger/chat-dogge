// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { jsonRes } from '@/service/response'
import { connectToDatabase } from '@/service/mongo'
import { authToken } from '@/service/utils/tools'
import { ModelUserRel } from '@/service/models/modelUserRel'
import { Model } from '@/service/models/model'
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    const { modelId } = req.query

    if (!modelId) {
      throw new Error('参数错误')
    }

    await connectToDatabase()

    await Model.findByIdAndUpdate(modelId, {
      $inc: { hitCount: 1 },
    })
    jsonRes(res, {})
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err,
    })
  }
}
