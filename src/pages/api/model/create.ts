// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { jsonRes } from '@/service/response'
import { connectToDatabase } from '@/service/mongo'
import { authToken, httpsAgent } from '@/service/utils/tools'
import {
  ModelStatusEnum,
  modelList,
  ChatModelNameEnum,
  ChatModelNameMap,
} from '@/constants/model'
import { Model } from '@/service/models/model'
import howToUse from '@/utils/howToUse'
import { notifyCreateApp } from '@/service/utils/sendEmail'
import { EmailTypeEnum } from '@/constants/common'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    const { name, serviceModelName, description, prompt } = req.body as {
      name: string
      serviceModelName: `${ChatModelNameEnum}`
      description: string
      prompt: string
    }
    const { authorization } = req.headers

    if (!authorization) {
      throw new Error('无权操作')
    }

    if (!name || !serviceModelName) {
      throw new Error('缺少参数')
    }

    // 凭证校验
    const userId = await authToken(authorization)

    const modelItem = modelList.find((item) => item.model === serviceModelName)

    if (!modelItem) {
      throw new Error('模型不存在')
    }

    await connectToDatabase()

    // 上限校验
    // const authCount = await Model.countDocuments({
    //   userId,
    // })
    // if (authCount >= 20) {
    //   throw new Error('上限 20 个模型')
    // }
    const how = await howToUse({
      modelName: name,
      modelItem,
      userId,
      description,
      query: false,
    })
    // 创建模型
    const response = await Model.create({
      name,
      userId,
      intro: description,
      systemPrompt: prompt,
      howToUse: how,
      status: ModelStatusEnum.running,
      service: {
        company: modelItem.serviceCompany,
        trainId: '',
        chatModel: ChatModelNameMap[modelItem.model], // 聊天时用的模型
        modelName: modelItem.model, // 最底层的模型，不会变，用于计费等核心操作
      },
    })

    // 根据 id 获取模型信息
    const model = await Model.findById(response._id).populate({
      path: 'userId',
      options: {
        strictPopulate: false,
      },
    })

    jsonRes(res, {
      data: model,
    })
    if (model) {
      await notifyCreateApp(model, EmailTypeEnum.createApp)
    }
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err,
    })
  }
}
