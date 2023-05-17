import {
  TrashIcon,
  SaveIcon,
  ToggleLeftIcon,
  ToggleRight,
  ToggleRightIcon,
  LucideToggleLeft,
  LucideToggleRight,
} from 'lucide-react'
import React, { useState } from 'react'

export default function InputMessage({
  input,
  sendPrompt,
  textChange,
  handleSave,
  isChatting,
  saving,
  isWebSearch,
  setIsWebSearch,
  clearHistory,
  handleStop,
}: {
  input: string
  sendPrompt: any
  textChange: any
  handleSave: any
  isChatting: boolean
  saving: boolean
  isWebSearch: boolean
  setIsWebSearch: any
  clearHistory: any
  handleStop: any
}) {
  return (
    <div className={`my-10 w-full max-w-5xl gap-1 px-4  text-left`}>
      <div className="btn-group">
        <button className=" btn-xs btn" onClick={() => clearHistory()}>
          <TrashIcon className="text-slate-7 float-right h-4 w-4 hover:fill-black " />
        </button>
        <button className=" btn-xs btn" onClick={handleSave}>
          <SaveIcon className="text-slate-7 float-right h-4 w-4 hover:fill-black " />
        </button>

        <button
          className={`${isWebSearch ? '' : 'btn-outline'}  btn-xs btn `}
          onClick={() => setIsWebSearch(!isWebSearch)}
        >
          {isWebSearch ? '查询网页on' : '查询网页off'}
        </button>
      </div>

      <div className="flex w-full gap-1">
        <textarea
          value={input}
          onChange={textChange}
          disabled={isChatting}
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
        {isChatting ? (
          <button
            className="btn border-black bg-white text-black hover:bg-white"
            onClick={handleStop}
          >
            停止
          </button>
        ) : (
          <button
            disabled={isChatting}
            className={`btn ${isChatting ? 'animate-pulse' : ''}`}
            onClick={() => {
              sendPrompt()
            }}
          >
            发送
          </button>
        )}
      </div>
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
