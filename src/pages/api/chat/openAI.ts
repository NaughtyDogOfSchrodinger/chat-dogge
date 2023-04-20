import { OpenAIStream } from '@/utils/OpenStream'

// break the app if the API key is missing
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing Environment Variable OPENAI_API_KEY')
}

export const config = {
  runtime: 'edge',
}

const handler = async (req: Request): Promise<Response> => {
  const payload = await req.json()
  const result = await OpenAIStream(payload)
  return new Response(result)
}
export default handler
