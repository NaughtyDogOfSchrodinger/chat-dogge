import type { NextApiRequest, NextApiResponse } from 'next'
import { jsonRes } from '@/service/response'
import { connectToDatabase, Chat, Model } from '@/service/mongo'
import type { ChatPopulate, ModelSchema } from '@/types/mongoSchema'
import type { InitChatResponse } from '@/api/response/chat'
import { authToken } from '@/service/utils/tools'

/* 初始化我的聊天框，需要身份验证 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { authorization } = req.headers

    const { modelId } = req.query as { modelId: string }

    if (!modelId) {
      throw new Error('缺少参数')
    }

    await connectToDatabase()

    if (authorization) {
      const userId = await authToken(authorization)
      // 获取 chat 数据
      const chat = await Chat.findOne<ChatPopulate>({
        modelId,
        userId,
      }).populate({
        path: 'modelId',
        options: {
          strictPopulate: false,
        },
      })

      if (!chat) {
        throw new Error('聊天框不存在')
      }

      // filter 掉被 deleted 的内容
      chat.content = chat.content.filter((item) => item.deleted !== true)

      const model = chat.modelId
      jsonRes<InitChatResponse>(res, {
        data: {
          chatId: chat._id,
          modelId: model._id,
          name: model.name,
          avatar: model.avatar,
          intro: model.intro,
          modelName: model.service.modelName,
          chatModel: model.service.chatModel,
          history: chat.content,
        },
      })
    } else {
      // 获取 chat 数据
      const model = await Model.findById<ModelSchema>(modelId)
      if (model == null) {
        console.log(`dsadsadad: ${modelId}`)
        throw new Error('模型不存在')
      }

      jsonRes<InitChatResponse>(res, {
        data: {
          chatId: '',
          modelId: model._id,
          name: model.name,
          avatar: model.avatar,
          intro: model.intro,
          modelName: model.service.modelName,
          chatModel: model.service.chatModel,
          history: [],
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
