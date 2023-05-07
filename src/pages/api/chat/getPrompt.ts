import { NextApiRequest, NextApiResponse } from 'next'
import { ChatItemType } from '@/types/chat'
import { jsonRes } from '@/service/response'
import { Chat, connectToDatabase, Model } from '@/service/mongo'
import { getOpenAIApi } from '@/service/utils/chat'
import { ChatPopulate, ModelSchema, ServiceName } from '@/types/mongoSchema'
import {
  ChatModelNameEnum,
  modelList,
  ModelStatusEnum,
} from '@/constants/model'
import { gpt35StreamResponse } from '@/service/utils/openai'
import { VecModelDataPrefix } from '@/constants/redis'
import { vectorToBuffer } from '@/utils/tools'
import {
  authToken,
  httpsAgent,
  openaiChatFilter,
  systemPromptFilter,
} from '@/service/utils/tools'
import { connectRedis } from '@/service/redis'
import { pushChatBill, pushGenerateVectorBill } from '@/service/events/pushBill'
import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
} from 'openai'
import { PassThrough } from 'stream'
import * as process from 'process'
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing Environment Variable OPENAI_API_KEY')
}
const SYSTEM_KEY = process.env.OPENAI_API_KEY
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let step = 0 // step=1时，表示开始了流响应
  const stream = new PassThrough()
  stream.on('error', () => {
    console.log('error: ', 'stream error')
    stream.destroy()
  })
  res.on('close', () => {
    stream.destroy()
  })
  res.on('error', () => {
    console.log('error: ', 'request error')
    stream.destroy()
  })
  try {
    const { chatOrModelId, prompt } = req.body as {
      prompt: ChatItemType[]
      chatOrModelId: string
    }
    if (!chatOrModelId || !prompt || prompt.length == 0) {
      throw new Error('缺少参数')
    }
    await connectToDatabase()
    let startTime = Date.now()

    const { authorization } = req.headers
    const isPay = true
    let prompts: ChatItemType[], model: ModelSchema
    // 登录用户
    if (authorization) {
      // 获取 chat 数据
      const chat = await Chat.findById<ChatPopulate>(chatOrModelId).populate({
        path: 'modelId',
        options: {
          strictPopulate: false,
        },
      })

      if (!chat || !chat.modelId || !chat.userId) {
        return Promise.reject('模型不存在')
      }
      model = chat.modelId
      prompts = [...chat.content, prompt[0]] as ChatItemType[]
    } else {
      const modelResult = await Model.findById(chatOrModelId)
      if (modelResult == null) {
        throw new Error('模型不存在')
      }
      model = {
        _id: modelResult._id,
        name: modelResult.name,
        avatar: modelResult.avatar,
        systemPrompt: modelResult.systemPrompt,
        hitCount: modelResult.hitCount,
        favCount: modelResult.favCount,
        intro: modelResult.intro,
        userId: modelResult.userId._id,
        status: modelResult.status,
        updateTime: modelResult.updateTime,
        trainingTimes: modelResult.trainingTimes,
        temperature: modelResult.temperature,
        service: modelResult.service,
        security: modelResult.security,
      } as ModelSchema
      prompts = prompt
    }

    await Model.findByIdAndUpdate(model._id, {
      $inc: { hitCount: 1 },
    })
    const modelConstantsData = modelList.find(
      (item) => item.model === model.service.modelName
    )
    if (!modelConstantsData) {
      throw new Error('模型加载异常')
    }

    // 获取 chatAPI
    const chatAPI = getOpenAIApi(SYSTEM_KEY)

    if (modelConstantsData.model == ChatModelNameEnum.VECTOR_GPT) {
      const redis = await connectRedis()
      // @ts-ignore
      const text = prompt[prompt.length - 1].value
      // 把输入的内容转成向量
      const res = await chatAPI
        .createEmbedding(
          {
            model: ChatModelNameEnum.VECTOR,
            input: text,
          },
          {
            timeout: 5000,
            httpsAgent: httpsAgent(true),
          }
        )
        .then((res) => ({
          tokenLen: res.data.usage.total_tokens || 0,
          vector: res?.data?.data?.[0]?.embedding || [],
        }))
      if (authorization) {
        // 凭证校验
        const userId = await authToken(authorization)
        pushGenerateVectorBill({
          isPay,
          userId,
          text,
          tokenLen: res.tokenLen,
        })
      }

      // 搜索系统提示词, 按相似度从 redis 中搜出相关的 q 和 text
      const redisData: any[] = await redis.sendCommand([
        'FT.SEARCH',
        `idx:${VecModelDataPrefix}:hash`,
        `@modelId:{${String(
          model._id
        )}} @vector:[VECTOR_RANGE 0.24 $blob]=>{$YIELD_DISTANCE_AS: score}`,
        'RETURN',
        '1',
        'text',
        'SORTBY',
        'score',
        'PARAMS',
        '2',
        'blob',
        vectorToBuffer(res.vector),
        'LIMIT',
        '0',
        '30',
        'DIALECT',
        '2',
      ])

      const formatRedisPrompt: string[] = []
      // 格式化响应值，获取 qa
      for (let i = 2; i < 61; i += 2) {
        const text = redisData[i]?.[1]
        if (text) {
          formatRedisPrompt.push(text)
        }
      }

      // if (formatRedisPrompt.length === 0) {
      //   throw new Error('对不起，我没有找到你的问题')
      // }

      // textArr 筛选，最多 2800 tokens
      const systemPrompt = systemPromptFilter(formatRedisPrompt, 2800)
      prompts.unshift({
        obj: 'SYSTEM',
        value: `你是${model.name}GPT应用，你根据系统指令：${model.systemPrompt} 以及知识库内容回答问题，知识库内容为: "${systemPrompt}"`,
      })
    } else {
      // 如果有系统提示词，自动插入
      if (model.systemPrompt) {
        prompts.unshift({
          obj: 'SYSTEM',
          value: `你是${model.name}GPT应用，你根据系统指令：${model.systemPrompt}回答我的问题`,
        })
      }
    }

    // 控制在 tokens 数量，防止超出
    const filterPrompts = openaiChatFilter(
      prompts,
      modelConstantsData.contextMaxToken
    )

    // 格式化文本内容成 chatgpt 格式
    const map = {
      Human: ChatCompletionRequestMessageRoleEnum.User,
      AI: ChatCompletionRequestMessageRoleEnum.Assistant,
      SYSTEM: ChatCompletionRequestMessageRoleEnum.System,
    }
    const formatPrompts: ChatCompletionRequestMessage[] = filterPrompts.map(
      (item: ChatItemType) => ({
        role: map[item.obj],
        content: item.value,
      })
    )

    // 计算温度
    const temperature =
      modelConstantsData.maxTemperature * (model.temperature / 10)
    // 发出请求
    const chatResponse = await chatAPI.createChatCompletion(
      {
        model: model.service.chatModel,
        temperature: temperature,
        // max_tokens: modelConstantsData.maxToken,
        messages: formatPrompts,
        frequency_penalty: 0.5, // 越大，重复内容越少
        presence_penalty: -0.5, // 越大，越容易出现新内容
        stream: true,
        stop: ['.!?。'],
      },
      {
        timeout: 5000,
        responseType: 'stream',
        httpsAgent: httpsAgent(true),
      }
    )

    console.log('api response time:', `${(Date.now() - startTime) / 1000}s`)

    step = 1

    const { responseContent } = await gpt35StreamResponse({
      res,
      stream,
      chatResponse,
    })
    const promptsContent = formatPrompts.map((item) => item.content).join('')

    if (authorization) {
      const userId = await authToken(authorization)
      // 只有使用平台的 key 才计费
      pushChatBill({
        isPay: true,
        modelName: model.service.modelName,
        userId,
        chatId: chatOrModelId,
        text: promptsContent + responseContent,
      })
    }
  } catch (err) {
    if (step === 1) {
      // 直接结束流
      console.log('error，结束')
      stream.destroy()
    } else {
      res.status(500)
      jsonRes(res, {
        code: 500,
        error: err,
      })
    }
  }
}
