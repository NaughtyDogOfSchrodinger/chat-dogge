import { NextApiRequest, NextApiResponse } from 'next'
import { ChatItemType } from '@/types/chat'
import { jsonRes } from '@/service/response'
import { Chat, connectToDatabase, Model } from '@/service/mongo'
import { authChat, getOpenAIApi } from '@/service/utils/chat'
import { ChatPopulate, ModelSchema } from '@/types/mongoSchema'
import { ChatModelNameEnum, modelList } from '@/constants/model'
import { openaiCreateEmbedding } from '@/service/utils/openai'
import { VecModelDataPrefix } from '@/constants/redis'
import { vectorToBuffer } from '@/utils/tools'
import {
  authToken,
  httpsAgent,
  openaiChatFilter,
  systemPromptFilter,
} from '@/service/utils/tools'
import { connectRedis } from '@/service/redis'
import { pushGenerateVectorBill } from '@/service/events/pushBill'
import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
} from 'openai'
import { v4 as uuidv4 } from 'uuid'
import { Redis } from '@upstash/redis'
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing Environment Variable OPENAI_API_KEY')
}
const SYSTEM_KEY = process.env.OPENAI_API_KEY
const redisClient = Redis.fromEnv()
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { chatOrModelId, prompt } = req.body as {
    prompt: ChatItemType[]
    chatOrModelId: string
  }
  if (!chatOrModelId || !prompt || prompt.length == 0) {
    throw new Error('缺少参数')
  }
  await connectToDatabase()
  const redis = await connectRedis()

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
    model = modelResult
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
  if (modelConstantsData.model == ChatModelNameEnum.VECTOR_GPT) {
    // 获取 chatAPI
    const chatAPI = getOpenAIApi(SYSTEM_KEY)

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
          timeout: 20000,
          // httpsAgent: httpsAgent(isPay),
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

    if (formatRedisPrompt.length === 0) {
      throw new Error('对不起，我没有找到你的问题')
    }

    // textArr 筛选，最多 2800 tokens
    const systemPrompt = systemPromptFilter(formatRedisPrompt, 2800)
    prompts.unshift({
      obj: 'SYSTEM',
      value: `${model.systemPrompt} 知识库内容是最新的,知识库内容为: "${systemPrompt}"`,
    })
  } else {
    // 如果有系统提示词，自动插入
    if (model.systemPrompt) {
      prompts.unshift({
        obj: 'SYSTEM',
        value: model.systemPrompt,
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

  jsonRes(res, {
    data: {
      model: model.service.chatModel,
      temperature: temperature,
      // max_tokens: modelConstantsData.maxToken,
      messages: formatPrompts,
      frequency_penalty: 0.5, // 越大，重复内容越少
      presence_penalty: -0.5, // 越大，越容易出现新内容
      stream: true,
      stop: ['.!?。'],
    },
  })
}
