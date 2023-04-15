import clsx from 'clsx'
import Balancer from 'react-wrap-balancer'
import md from './markdown-it'
import {
  ClipboardCopyIcon,
  Copy,
  Dog,
  DogIcon,
  LucideClipboardCopy,
  Redo,
  RefreshCw,
  TrashIcon,
} from 'lucide-react'
import { ChatSiteItemType } from '@/types/chat'

// wrap Balancer to remove type errors :( - @TODO - fix this ugly hack
const BalancerWrapper = (props: any) => <Balancer {...props} />
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
}: {
  index: number
  chatMsg: ChatSiteItemType
  onDelete: any
  onCopy: any
}) {
  return (
    <div className=" roup sm:hover:bg-slate/6 dark:sm:hover:bg-slate/5 message-item relative mx--4 flex gap-3 rounded-lg px-4 transition-colors">
      <div className="flex-start col-span-1 mb-5 flex w-full justify-between rounded-lg bg-white px-2 py-2 shadow-lg ring-1 ring-zinc-100 sm:px-4">
        <div className="message prose-slate dark:prose-invert dark:text-slate prose overflow-hidden break-words">
          <div
            className="flex-1 gap-4 text-left"
            dangerouslySetInnerHTML={{
              __html: md.render(chatMsg.value),
            }}
          ></div>
        </div>
        <div className="<sm:top--4 <sm:right-0 text-slate-7 dark:text-slate dark:bg-#292B32 bg-#E7EBF0 absolute top-2 right-6 flex items-center justify-between rounded text-sm opacity-0 hover:opacity-100">
          <Copy
            className="text-slate-7 h-4 w-4 hover:fill-black"
            onClick={() => onCopy(chatMsg.value)}
          />
          <TrashIcon
            className="text-slate-7 h-4 w-4 hover:fill-black"
            onClick={() => onDelete(index)}
          />
        </div>
      </div>
    </div>
  )
}
