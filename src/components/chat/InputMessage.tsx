import { TrashIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { ChatSiteItemType } from '@/types/chat'

export default function InputMessage({
  input,
  sendPrompt,
  textChange,
  handleSave,
  isChatting,
  saving,
  clearHistory,
  handleStop,
}: {
  input: string
  sendPrompt: any
  textChange: any
  handleSave: any
  isChatting: boolean
  saving: boolean
  clearHistory: any
  handleStop: any
}) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
  }, [])
  return (
    <div
      className={`my-10 w-full max-w-5xl px-4 text-center sm:flex sm:items-center`}
    >
      {/*<button className="badge badge-lg" onClick={() => clearHistory()}>*/}
      {/*  <TrashIcon className="text-slate-7 float-right h-4 w-4 hover:fill-black " />*/}
      {/*</button>*/}
      <textarea
        value={input}
        onChange={textChange}
        rows={1}
        className="w-full rounded-md border-2 border-black p-3 text-black shadow-sm focus:border-black focus:outline-0 "
        placeholder={
          isChatting
            ? 'Waiting...'
            : `Ask me anything.${isMobile ? '' : ' (cmd + enter to submit)'}`
        }
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            sendPrompt()
          }
        }}
      />
      {isChatting ? (
        <button
          className={`ml-3 mt-3 h-10 w-14 rounded-md border border-black font-medium text-black hover:bg-slate-100  sm:mt-0 sm:w-28`}
          onClick={handleStop}
        >
          停止
        </button>
      ) : (
        <button
          disabled={isChatting}
          className={`mt-3 h-10 w-40 rounded-md bg-black font-medium text-white hover:bg-slate-700  sm:ml-3 sm:mt-0 sm:w-48 ${
            isChatting ? 'animate-pulse' : ''
          }`}
          onClick={() => {
            sendPrompt()
          }}
        >
          发送
        </button>
      )}
      <button
        className={`ml-3 mt-3 h-10 w-14 rounded-md border border-black font-medium text-black hover:bg-slate-100  sm:mt-0 sm:w-28 ${
          isChatting ? 'animate-pulse' : ''
        }`}
        onClick={clearHistory}
        disabled={isChatting}
      >
        清除
      </button>
      <button
        className="ml-3 mt-3 h-10 w-14 rounded-md border border-black font-medium text-black hover:bg-slate-100  sm:mt-0 sm:w-28"
        onClick={handleSave}
        disabled={saving}
      >
        保存
      </button>
    </div>
  )
}
