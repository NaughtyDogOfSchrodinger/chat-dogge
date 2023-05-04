import type { NextApiRequest, NextApiResponse } from 'next'
import { jsonRes } from '@/service/response'
import { connectToDatabase } from '@/service/mongo'
import { authToken } from '@/service/utils/tools'
import { Model } from '@/service/models/model'
import { ModelUserRel } from '@/service/models/modelUserRel'
import {
  ChatModelNameEnum,
  ChatModelNameMap,
  ModelConstantsData,
  modelList,
} from '@/constants/model'
import { SortOrder } from 'mongoose'

/* 获取我的模型 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    const { hitCount, favCount, serviceModelName } = req.body as {
      hitCount?: SortOrder
      favCount?: SortOrder
      serviceModelName?: `${ChatModelNameEnum}`
    }
    await connectToDatabase()

    let modelItem: ModelConstantsData | undefined
    if (serviceModelName) {
      modelItem = modelList.find((item) => item.model === serviceModelName)

      if (!modelItem) {
        throw new Error('模型不存在')
      }
    }
    // 根据 userId 获取模型信息
    const models = await Model.find(
      modelItem
        ? {
            service: {
              company: modelItem.serviceCompany,
              trainId: '',
              chatModel: ChatModelNameMap[modelItem.model], // 聊天时用的模型
              modelName: modelItem.model, // 最底层的模型，不会变，用于计费等核心操作
            },
          }
        : {}
    ).sort(
      hitCount
        ? favCount
          ? { hitCount, favCount }
          : { hitCount }
        : favCount
        ? { favCount }
        : {}
    )
    const { authorization } = req.headers

    if (authorization) {
      const userId = await authToken(authorization)
      const rels = await ModelUserRel.find({ userId })
      const relSet = new Set<string>(rels.map((r) => r.modelId.toString()))
      models.map((model) => {
        model.like = relSet.has(model._id.toString())
      })
    }

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
