import { type ChatGPTMessage } from '../../components/ChatLine'
import { OpenAIStream, OpenAIStreamPayload } from '../../utils/OpenStream'
import { HOST_URL } from '@/utils/hostUrl'

// break the app if the API key is missing
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing Environment Variable OPENAI_API_KEY')
}

export const config = {
  runtime: 'edge',
}

const handler = async (req: Request): Promise<Response> => {
  const body = await req.json()

  const messages: ChatGPTMessage[] = []
  messages.push(...body?.messages)
  const payload: OpenAIStreamPayload = {
    model: 'gpt-3.5-turbo',
    messages: messages,
    temperature: process.env.AI_TEMP ? parseFloat(process.env.AI_TEMP) : 0.7,
    max_tokens: process.env.AI_MAX_TOKENS
      ? parseInt(process.env.AI_MAX_TOKENS)
      : 2048,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: true,
    user: body?.user,
    n: 1,
  }
  return await fetch(`${HOST_URL}/api/user?id=${payload.user}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
    .then((res) => res.json())
    .then(async (data) => {
      console.log(`left token: ${data.tokenCount}`)
      if (data.tokenCount > 0) {
        const stream = await OpenAIStream(payload, body?.isLogin)
        return new Response(stream)
      } else {
        return new Response(undefined, { status: 439 })
      }
    })
}
export default handler
