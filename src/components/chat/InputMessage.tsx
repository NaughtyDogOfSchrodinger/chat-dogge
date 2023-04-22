import { TrashIcon, SaveIcon } from 'lucide-react'
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
  // const [isMobile, setIsMobile] = useState(false)
  //
  // useEffect(() => {
  //   setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
  // }, [])
  return (
    <div
      className={`my-10 w-full max-w-5xl gap-1 px-4 text-center sm:flex sm:items-center`}
    >
      {/*<button className="badge badge-lg" onClick={() => clearHistory()}>*/}
      {/*  <TrashIcon className="text-slate-7 float-right h-4 w-4 hover:fill-black " />*/}
      {/*</button>*/}
      {/*<button className="badge badge-lg" onClick={handleSave} disabled={saving}>*/}
      {/*  <SaveIcon className="text-slate-7 float-right h-4 w-4 hover:fill-black " />*/}
      {/*</button>*/}
      <div className="btn-group">
        <button className=" btn" onClick={() => clearHistory()}>
          <TrashIcon className="text-slate-7 float-right h-4 w-4 hover:fill-black " />
        </button>
        <button className=" btn" onClick={handleSave}>
          <SaveIcon className="text-slate-7 float-right h-4 w-4 hover:fill-black " />
        </button>
      </div>
      {/*<button*/}
      {/*  className="ml-3 mt-3 h-10 w-14 rounded-md border border-black font-medium text-black hover:bg-slate-100  sm:mt-0 sm:w-28"*/}
      {/*  onClick={handleSave}*/}
      {/*  disabled={saving}*/}
      {/*>*/}
      {/*  保存*/}
      {/*</button>*/}
      <textarea
        value={input}
        onChange={textChange}
        rows={1}
        className="w-full rounded-md border-2 border-black p-3 text-black shadow-sm focus:border-black focus:outline-0 "
        placeholder={isChatting ? '等待中...' : '回车或者发送键发送'}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            sendPrompt()
          }
        }}
      />
      {/*{isChatting ? (*/}
      {/*  <button*/}
      {/*    className={`ml-3 mt-3 h-10 w-14 rounded-md border border-black font-medium text-black hover:bg-slate-100  sm:mt-0 sm:w-28`}*/}
      {/*    onClick={handleStop}*/}
      {/*  >*/}
      {/*    停止*/}
      {/*  </button>*/}
      {/*) : (*/}
      <button
        disabled={isChatting}
        className={`btn btn ml-4 flex-none ${
          isChatting ? 'animate-pulse' : ''
        }`}
        onClick={() => {
          sendPrompt()
        }}
      >
        发送
      </button>
      {/*)}*/}
      {/*<button*/}
      {/*  className={`ml-3 mt-3 h-10 w-14 rounded-md border border-black font-medium text-black hover:bg-slate-100  sm:mt-0 sm:w-28 ${*/}
      {/*    isChatting ? 'animate-pulse' : ''*/}
      {/*  }`}*/}
      {/*  onClick={clearHistory}*/}
      {/*  disabled={isChatting}*/}
      {/*>*/}
      {/*  清除*/}
      {/*</button>*/}
      {/*<button*/}
      {/*  className="ml-3 mt-3 h-10 w-14 rounded-md border border-black font-medium text-black hover:bg-slate-100  sm:mt-0 sm:w-28"*/}
      {/*  onClick={handleSave}*/}
      {/*  disabled={saving}*/}
      {/*>*/}
      {/*  保存*/}
      {/*</button>*/}
    </div>
  )
}
