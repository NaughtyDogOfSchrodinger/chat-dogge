import { useEffect, useState } from 'react'
import { Button } from './ChatButton'
import { type ChatGPTMessage, ChatLine, LoadingChatLine } from './ChatLine'
import { useCookies } from 'react-cookie'
import { loadLicenseKey } from '@/utils/localData'
import { ChatProps } from '@/utils/constants'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useSession } from 'next-auth/react'

const COOKIE_NAME = 'nextjs-example-ai-chat-gpt3'

export const InputMessage = ({
  input,
  setInput,
  sendMessage,
  getValues,
  keydown,
}: any) => (
  <div className="clear-both mt-6 flex">
    <input
      type="text"
      aria-label="chat input"
      className="min-w-0 flex-auto appearance-none rounded-md border border-zinc-900/10 bg-white px-3 py-[calc(theme(spacing.2)-1px)] shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 sm:text-sm"
      value={input}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && keydown) {
          sendMessage(input, getValues)
          setInput('')
        }
      }}
      onChange={(e) => {
        setInput(e.target.value)
      }}
    />
    <Button
      type="submit"
      className="ml-4 flex-none"
      onClick={() => {
        sendMessage(input, getValues)
        setInput('')
      }}
    >
      发送
    </Button>
  </div>
)

export function Chat(props: ChatProps) {
  const router = useRouter()
  // @ts-ignore
  const { t } = useTranslation('common')
  const { data: session } = useSession()

  const [messages, setMessages] = useState<ChatGPTMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [cookie, setCookie] = useCookies([COOKIE_NAME])

  useEffect(() => {
    if (session) {
      setCookie(COOKIE_NAME, session?.user.id)
    } else if (!cookie[COOKIE_NAME]) {
      // generate a semi random short id
      const id = Math.random().toString(36).substring(7)
      setCookie(COOKIE_NAME, id)
    }
  }, [cookie, session, setCookie])

  // send message to API /api/chat endpoint
  const sendMessage = async (message: string, callback: any) => {
    const system = await callback()
    console.log(`message: ${message}, system: ${system}`)
    setLoading(true)
    const newMessages = [
      ...messages,
      { role: 'user', content: message } as ChatGPTMessage,
    ]
    setMessages(newMessages)
    const last10messages = newMessages.slice(-10) // remember last 10 messages
    const addSystem = [
      { role: 'system', content: system } as ChatGPTMessage,
      ...last10messages,
    ]
    const response = await fetch(`/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userKey: loadLicenseKey(),
        messages: addSystem,
        user: cookie[COOKIE_NAME],
        isLogin: !!session,
      }),
    })

    if (!response.ok) {
      if (response.status === 429) {
        toast(t('runout_today'), { icon: '🔴' })
        router.push('/usage')
        return
      } else if (response.status === 439) {
        toast(t('license_wrong'), { icon: '🔴' })
        router.push('/usage')
      } else {
        throw new Error(response.statusText)
      }
    }

    // This data is a ReadableStream
    const data = response.body
    if (!data) {
      return
    }

    const reader = data.getReader()
    const decoder = new TextDecoder()
    let done = false
    let count = 0
    let lastMessage = ''
    while (!done) {
      const { value, done: doneReading } = await reader.read()
      done = doneReading
      const chunkValue = decoder.decode(value)

      lastMessage = lastMessage + chunkValue
      count++
      setMessages([
        ...newMessages,
        { role: 'assistant', content: lastMessage } as ChatGPTMessage,
      ])

      setLoading(false)
    }
  }
  return (
    <div className="rounded-2xl border-zinc-100  bg-[#f5f5f7] lg:border lg:p-6">
      {messages.map(({ content, role }, index) => (
        <ChatLine key={index} role={role} content={content} />
      ))}

      {loading && <LoadingChatLine />}

      <InputMessage
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
        getValues={props.callback}
        keyDown={props.keyDown}
      />
    </div>
  )
}
