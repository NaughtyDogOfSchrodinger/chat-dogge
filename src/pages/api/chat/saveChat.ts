import type { NextApiRequest, NextApiResponse } from 'next'
import { jsonRes } from '@/service/response'
import { ChatItemType } from '@/types/chat'
import { connectToDatabase, Chat } from '@/service/mongo'
import { pushChatBill } from '@/service/events/pushBill'
import { ChatPopulate } from '@/types/mongoSchema'
import { authToken } from '@/service/utils/tools'

/* 聊天内容存存储 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { chatId, prompts } = req.body as {
      chatId: string
      prompts: ChatItemType[]
    }
    if (!chatId || !prompts) {
      throw new Error('缺少参数')
    }
    const { authorization } = req.headers

    if (!authorization) {
      throw new Error('无权操作')
    }
    // 凭证校验
    const userId = await authToken(authorization)

    await connectToDatabase()

    // 存入库
    const chat = await Chat.findByIdAndUpdate<ChatPopulate>(chatId, {
      $push: {
        content: {
          $each: prompts.map((item) => ({
            obj: item.obj,
            value: item.value,
          })),
        },
      },
      updateTime: new Date(),
    }).populate({
      path: 'modelId',
      options: {
        strictPopulate: false,
      },
    })
    const model = chat?.modelId
    if (model) {
      pushChatBill({
        isPay: false,
        modelName: model.service.modelName,
        userId,
        chatId,
        text: prompts.map((item) => item).join(' '),
      })
    }
    jsonRes(res)
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err,
    })
  }
}
