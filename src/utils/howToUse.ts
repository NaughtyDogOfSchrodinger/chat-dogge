import { getOpenAIApi } from '@/service/utils/chat'
import { ChatCompletionRequestMessage } from 'openai'
import { ChatModelNameEnum } from '@/constants/model'
import { httpsAgent } from '@/service/utils/tools'
import { pushSplitDataBill } from '@/service/events/pushBill'
import process from 'process'
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing Environment Variable OPENAI_API_KEY')
}
const SYSTEM_KEY = process.env.OPENAI_API_KEY
function splitQ(text: string) {
  const regex = /Q\d+:(\s*)(.*)(\s*)(?=Q|$)/g // 匹配Q和A的正则表达式
  const matches = text.matchAll(regex) // 获取所有匹配到的结果

  const result = [] // 存储最终的结果
  for (const match of matches) {
    const q = match[2]
    if (q) {
      // 如果Q和A都存在，就将其添加到结果中
      result.push(q)
    }
  }

  return result
}
export default async function howToUse({
  modelName,
  userId,
  modelType,
  description,
}: {
  modelName: string
  userId?: string
  modelType: string
  description: string
}) {
  const chatAPI = getOpenAIApi(SYSTEM_KEY)
  const systemPrompt: ChatCompletionRequestMessage = {
    role: 'system',
    content: `下面是一段长文本,请从中提取出1至3个问题,并按以下格式返回: Q1:\nQ2:\n`,
  }

  const generateQs = await chatAPI
    .createChatCompletion(
      {
        model: ChatModelNameEnum.GPT35,
        temperature: 0.8,
        n: 1,
        messages: [
          systemPrompt,
          {
            role: 'user',
            content: modelName,
          },
        ],
      },
      {
        timeout: 5000,
        httpsAgent: httpsAgent(true),
      }
    )
    .then((res) => {
      const rawContent = res?.data.choices[0]?.message?.content || '' // chatgpt 原本的回复
      const result = splitQ(res?.data.choices[0]?.message?.content || '') // 格式化后的Q
      if (userId) {
        // 计费
        pushSplitDataBill({
          isPay: true,
          userId: userId,
          type: 'Q',
          text: systemPrompt.content + modelName + rawContent,
          tokenLen: res.data.usage?.total_tokens || 0,
        })
      }
      return result
    })

  let questions = ''

  if (generateQs.length != 0) {
    for (const q of generateQs) {
      questions = questions + '```\n' + q + '\n```\n'
    }
  } else {
    questions = '```\n你可以做什么？\n``` \n```\n我要如何使用你？\n```'
  }
  console.log(questions)
  return `
          这是ChatDogge平台的\"${modelName}\"${modelType}应用
          ${description}
你可以这样问它：
${questions}
              `
}
