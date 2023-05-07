import { ChatSiteItemType } from '@/types/chat'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { Copy, TrashIcon, UserIcon } from 'lucide-react'
import Image from 'next/image'
import { monoBlue } from 'react-syntax-highlighter/dist/cjs/styles/hljs'
import { useUserStore } from '@/store/user'
import { createAvatar } from '@dicebear/core'
import { adventurer, micah } from '@dicebear/collection'
// wrap Balancer to remove type errors :( - @TODO - fix this ugly hack
type ChatGPTAgent = 'Human' | 'AI' | 'SYSTEM'

export interface ChatGPTMessage {
  role: ChatGPTAgent
  content: string
}

// loading placeholder animation for the chat line
export const LoadingChatLine = () => (
  <div className="flex min-w-full animate-pulse px-4 py-5 sm:px-6">
    <div className="flex flex-grow space-x-3">
      <div className="min-w-0 flex-1">
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 h-2 rounded bg-zinc-500"></div>
            <div className="col-span-1 h-2 rounded bg-zinc-500"></div>
          </div>
          <div className="h-2 rounded bg-zinc-500"></div>
        </div>
      </div>
    </div>
  </div>
)

export function ChatLine({
  index,
  chatMsg,
  onDelete,
  onCopy,
  saving,
}: {
  index: number
  chatMsg: ChatSiteItemType
  onDelete: any
  onCopy: any
  saving: boolean
}) {
  const { userInfo } = useUserStore()
  const { email } = userInfo || {}
  return (
    <div
      key={index}
      className={`w-full px-4 py-5 text-slate-100 ${
        chatMsg.obj === 'Human'
          ? 'bg-white text-slate-800 '
          : 'bg-gray-100 text-slate-800 '
      }`}
    >
      <div className="flex items-start">
        {chatMsg.obj === 'Human' ? (
          <p
            dangerouslySetInnerHTML={{
              __html: `${createAvatar(micah, {
                size: 20,
                seed: email,
              }).toString()}`,
            }}
          />
        ) : (
          <Image alt={`logo`} src="/favicon.svg" width={20} height={20} />
        )}
        <ReactMarkdown
          className={`ml-2 flex-grow overflow-x-auto overflow-y-hidden whitespace-pre-wrap ${
            chatMsg.value.startsWith('ERROR MESSAGE:') ? 'text-red-500' : ''
          }`}
          linkTarget="_blank"
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '')
              return !inline ? (
                <div className="relative">
                  <SyntaxHighlighter
                    //@ts-ignore
                    style={monoBlue}
                    language={match ? match[1] : ''}
                    PreTag="div"
                    // showLineNumbers
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                  {!saving && (
                    <div className="absolute right-0 top-1 mr-1 cursor-pointer rounded bg-slate-50 p-1 ">
                      <Copy
                        className="text-slate-7 h-4 w-4 hover:fill-black"
                        onClick={() =>
                          onCopy(String(children).replace(/\n$/, ''))
                        }
                      />
                    </div>
                  )}
                </div>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              )
            },
          }}
        >
          {chatMsg.value.replace(/^\s+/, '').replace(/\n\n/g, '\n')}
        </ReactMarkdown>
        {!saving && (
          <div className="ml-1 mr-2 flex cursor-pointer">
            <Copy
              className="text-slate-7 h-4 w-4 hover:fill-black"
              onClick={() =>
                onCopy(chatMsg.value.replace(/^\s+/, '').replace(/\n\n/g, '\n'))
              }
            />
            <TrashIcon
              className="text-slate-7 h-4 w-4 hover:fill-black"
              onClick={() => onDelete(index)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
