import { NextApiRequest, NextApiResponse } from 'next'
import { jsonRes } from '@/service/response'
import { authToken, httpsAgent, openaiChatFilter } from '@/service/utils/tools'
import { pushChatBill, pushImageBill } from '@/service/events/pushBill'
import { ChatModelNameEnum } from '@/constants/model'
import { ChatItemType } from '@/types/chat'
import { getOpenAIApi } from '@/service/utils/chat'
import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
} from 'openai'
import Replicate from 'replicate'
import process from 'process'
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing Environment Variable OPENAI_API_KEY')
}
const API_HOST = process.env.REPLICATE_API_HOST || 'https://api.replicate.com'
const addBackgroundToPNG = require('lib/add-background-to-png')
const SYSTEM_KEY = process.env.OPENAI_API_KEY

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    const { authorization } = req.headers
    if (!authorization) {
      throw new Error('请先登录')
    }
    // remnove null and undefined values
    req.body = Object.entries(req.body).reduce(
      // @ts-ignore
      (a, [k, v]) => (v == null ? a : ((a[k] = v), a)),
      {}
    )

    if (req.body.mask) {
      req.body.mask = addBackgroundToPNG(req.body.mask)
    }

    // let prompts: ChatItemType[] = [
    //   {
    //     obj: 'SYSTEM',
    //     value:
    //       '现在你是一个英文翻译器，将我提供的所有文本翻译成英文，无需任何其他修饰词，标点。如果我提供的文本是英文直接返回原文，无需任何处理。',
    //   },
    //   {
    //     obj: 'Human',
    //     value: `${req.body.prompt}`,
    //   },
    // ] as ChatItemType[]
    // const chatAPI = getOpenAIApi(SYSTEM_KEY)
    // // 控制在 tokens 数量，防止超出
    // const filterPrompts = openaiChatFilter(prompts, 7000)
    // // 格式化文本内容成 chatgpt 格式
    // const map = {
    //   Human: ChatCompletionRequestMessageRoleEnum.User,
    //   AI: ChatCompletionRequestMessageRoleEnum.Assistant,
    //   SYSTEM: ChatCompletionRequestMessageRoleEnum.System,
    // }
    // const formatPrompts: ChatCompletionRequestMessage[] = filterPrompts.map(
    //   (item: ChatItemType) => ({
    //     role: map[item.obj],
    //     content: item.value,
    //   })
    // )
    // // 发出请求
    // const chatResponse = await chatAPI.createChatCompletion(
    //   {
    //     model: ChatModelNameEnum.GPT35,
    //     temperature: 0.7,
    //     // max_tokens: modelConstantsData.maxToken,
    //     messages: formatPrompts,
    //     frequency_penalty: 0.5, // 越大，重复内容越少
    //     presence_penalty: -0.5, // 越大，越容易出现新内容
    //     stream: false,
    //     stop: ['.!?。'],
    //   },
    //   {
    //     timeout: 5000,
    //     httpsAgent: httpsAgent(true),
    //   }
    // )
    //
    // const promptsContent = formatPrompts.map((item) => item.content).join('')
    //
    const userId = await authToken(authorization)
    // const prompt =
    //   chatResponse?.data?.choices[0]?.message?.content || req.body.prompt
    // req.body.prompt = prompt
    const version = req.body.version
    req.body.version = null
    const body = JSON.stringify({
      // Pinned to a specific version of Stable Diffusion, fetched from:
      // https://replicate.com/stability-ai/stable-diffusion
      version,
      input: req.body,
    })

    const response = await fetch(`${API_HOST}/v1/predictions`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body,
    })

    if (response.status !== 201) {
      let error = await response.json()
      jsonRes(res, {
        code: 500,
        error: error.detail,
      })
      return
    }

    const prediction = await response.json()
    jsonRes(res, {
      data: prediction,
    })
    // 只有使用平台的 key 才计费
    pushImageBill({
      isPay: true,
      modelName: ChatModelNameEnum.IMAGE,
      userId,
    })
    // // 只有使用平台的 key 才计费
    // pushChatBill({
    //   isPay: true,
    //   modelName: ChatModelNameEnum.GPT35,
    //   userId,
    //   text: promptsContent + prompt,
    // })
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err,
    })
  }
}
