import type { NextApiRequest, NextApiResponse } from 'next'
import { jsonRes } from '@/service/response'
import { Chat, connectToDatabase, User } from '@/service/mongo'
import { authToken } from '@/service/utils/tools'
import { Model } from '@/service/models/model'
import type { ModelSchema } from '@/types/mongoSchema'

/* 获取我的模型 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    const { authorization } = req.headers

    const { modelId } = req.query

    if (!modelId) {
      throw new Error('参数错误')
    }
    await connectToDatabase()
    // 根据 userId 获取模型信息
    const model = await Model.findOne<ModelSchema>({
      _id: modelId,
    })

    if (!model) {
      throw new Error('模型不存在')
    }
    if (authorization) {
      const userId = await authToken(authorization)
      const user = await User.findById(userId)
      if (!user) {
        throw new Error('用户不存在')
      }
      let chat = await Chat.findOne({ userId, modelId })
      if (!chat) {
        chat = await Chat.create({
          userId,
          modelId,
          content: [],
        })
      }

      chat.content = chat.content.filter((item) => item.deleted !== true)
      jsonRes(res, {
        data: {
          model,
          chat: {
            chatId: chat._id,
            modelId: model._id,
            name: model.name,
            avatar: model.avatar,
            intro: model.intro,
            modelName: model.service.modelName,
            chatModel: model.service.chatModel,
            history: chat.content,
          },
        },
      })
    } else {
      jsonRes(res, {
        data: {
          model,
          chat: {
            chatId: undefined,
            modelId: model._id,
            name: model.name,
            avatar: model.avatar,
            intro: model.intro,
            modelName: model.service.modelName,
            chatModel: model.service.chatModel,
            history: [],
          },
        },
      })
    }
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err,
    })
  }
}
