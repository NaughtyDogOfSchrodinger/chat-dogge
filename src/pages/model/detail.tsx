import { Breadcrumb } from '@/components/Breadcrumb'
import { NextSeo } from 'next-seo'
import { getModelWithChatById } from '@/api/model'
import { ModelSchema } from '@/types/mongoSchema'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChatModelNameEnum, modelList } from '@/constants/model'
import { useQuery } from '@tanstack/react-query'
import { clearChatRecord, delChatRecordByIndex, postSaveChat } from '@/api/chat'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { ChatLine } from '@/components/chat/ChatLine'
import { useRouter } from 'next/router'
import { useCopyData } from '@/utils/tools'
import { useChatStore } from '@/store/chat'
import { toast } from 'react-hot-toast'
import { ChatItemType, ChatSiteItemType } from '@/types/chat'
import { InitChatResponse } from '@/api/response/chat'
import { streamFetch } from '@/api/fetch'
import InputMessage from '@/components/chat/InputMessage'
import { createAvatar } from '@dicebear/core'
import { adventurer, micah } from '@dicebear/collection'
import download from 'downloadjs'
import { toPng } from 'html-to-image'
import { Readable } from 'stream'
export async function getServerSideProps(context: any) {
  const modelId = context.query?.modelId || ''
  return {
    props: {
      modelId,
      ...(await serverSideTranslations(context.locale!, ['common'])),
    },
  }
}
const textareaMinH = '22px'

interface ChatType extends InitChatResponse {
  history: ChatSiteItemType[]
}

const ChatDogge = ({ modelId }: { modelId: string }) => {
  const [model, setModel] = useState<ModelSchema>()
  const [chat, setChat] = useState<InitChatResponse>()

  const ChatBox = useRef<HTMLDivElement>(null)
  const TextareaDom = useRef<HTMLTextAreaElement>(null)

  // 中断请求
  const controller = useRef(new AbortController())
  const [chatData, setChatData] = useState<ChatType>({
    chatId: '',
    modelId: '',
    name: '',
    avatar: '',
    intro: '',
    chatModel: '',
    modelName: '',
    history: [],
  }) // 聊天框整体数据
  const [inputVal, setInputVal] = useState('') // 输入的内容

  const isChatting = useMemo(
    () => chatData.history[chatData.history.length - 1]?.status === 'loading',
    [chatData.history]
  )

  const { copyData } = useCopyData()
  const { pushChatHistory } = useChatStore()

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      ChatBox.current &&
        ChatBox.current.scrollTo({
          top: ChatBox.current.scrollHeight,
          behavior: 'smooth',
        })
    }, 100)
  }, [])

  // 重置输入内容
  const resetInputVal = useCallback((val: string) => {
    setInputVal(val)
    setTimeout(() => {
      /* 回到最小高度 */
      if (TextareaDom.current) {
        TextareaDom.current.style.height =
          val === '' ? textareaMinH : `${TextareaDom.current.scrollHeight}px`
      }
    }, 100)
  }, [])

  const [isWebSearch, setIsWebSearch] = useState(false)

  // gpt 对话
  const gptChatPrompt = useCallback(
    async (prompts: ChatSiteItemType) => {
      let prompt
      if (chat?.chatId === undefined) {
        // @ts-ignore
        prompt = [
          ...chatData.history,
          { obj: prompts.obj, value: prompts.value },
        ]
      } else {
        prompt = [
          {
            obj: prompts.obj,
            value: prompts.value,
          },
        ] as ChatItemType[]
      }

      // 流请求，获取数据
      const res = await streamFetch({
        url: '/api/chat/getPrompt',
        data: {
          prompt,
          chatOrModelId: chat?.chatId || modelId,
          isWebSearch,
        },
        onMessage: (text: string) => {
          setChatData((state) => ({
            ...state,
            history: state.history.map((item, index) => {
              if (index !== state.history.length - 1) return item
              return {
                ...item,
                value: item.value + text,
              }
            }),
          }))
        },
        abortSignal: controller.current,
        stop,
      })

      // 保存对话信息
      try {
        if (chat && chat.chatId) {
          await postSaveChat({
            chatId: chat.chatId,
            prompts: [
              ...prompt,
              {
                obj: 'AI',
                value: res as string,
              },
            ],
          })
        }
      } catch (err) {
        toast('对话出现异常, 继续对话会导致上下文丢失，请刷新页面', {
          icon: '🔴',
        })
      }

      // 设置完成状态
      setChatData((state) => ({
        ...state,
        history: state.history.map((item, index) => {
          if (index !== state.history.length - 1) return item
          return {
            ...item,
            status: 'finish',
          }
        }),
      }))
    },
    [chat, chatData, modelId, isWebSearch]
  )

  /**
   * 发送一个内容
   */
  const sendPrompt = useCallback(async () => {
    if (isChatting) {
      toast('正在聊天中...请等待结束', {
        icon: '🔴',
      })
      return
    }
    const storeInput = inputVal
    // 去除空行
    const val = inputVal.trim().replace(/\n\s*/g, '\n')
    if (!model || !model._id || !val) {
      toast('内容为空', {
        icon: '🔴',
      })
      return
    }

    // 长度校验
    const innerModel = modelList.find(
      (item) => item.model === chatData.modelName
    )
    if (innerModel && val.length >= innerModel.maxToken) {
      toast('单次输入超出 4000 字符', {
        icon: '🔴',
      })
      return
    }

    setInputVal('')

    const newChatList: ChatSiteItemType[] = [
      ...chatData.history,
      {
        obj: 'Human',
        value: val,
        status: 'finish',
      },
      {
        obj: 'AI',
        value: '',
        status: 'loading',
      },
    ]

    // 插入内容
    setChatData((state) => ({
      ...state,
      history: newChatList,
    }))
    // 清空输入内容
    resetInputVal('')
    scrollToBottom()

    try {
      // @ts-ignore
      await gptChatPrompt(newChatList[newChatList.length - 2])

      // 如果是 Human 第一次发送，插入历史记录
      const humanChat = newChatList.filter((item) => item.obj === 'Human')
      if (humanChat.length === 1) {
        if (chat && chat.chatId) {
          pushChatHistory({
            chatId: chat.chatId,
            // @ts-ignore
            title: humanChat[0].value,
          })
        }
      }
    } catch (err: any) {
      toast(typeof err === 'string' ? err : err?.message || '聊天出错了~', {
        icon: '🔴',
      })
      resetInputVal(storeInput)

      setChatData((state) => ({
        ...state,
        history: newChatList.slice(0, newChatList.length - 2),
      }))
    }
  }, [
    isChatting,
    inputVal,
    model,
    chatData,
    resetInputVal,
    scrollToBottom,
    gptChatPrompt,
    chat,
    pushChatHistory,
  ])

  // 删除一句话
  const delChatRecord = useCallback(
    async (index: number) => {
      try {
        if (chat && chat.chatId) {
          // 删除数据库最后一句
          await delChatRecordByIndex(chat.chatId, index)
        }

        setChatData((state) => ({
          ...state,
          history: state.history.filter((_, i) => i !== index),
        }))
      } catch (err) {
        console.log(err)
      }
    },
    [chat]
  )

  // 删除一句话
  const clearHistory = useCallback(async () => {
    try {
      if (chat && chat.chatId) {
        // 删除数据库最后一句
        await clearChatRecord(chat.chatId)
      }

      setChatData((state) => ({
        ...state,
        history: [],
      }))
    } catch (err) {
      console.log(err)
    }
  }, [chat])

  // 复制内容
  const onclickCopy = useCallback(
    (value: string) => {
      const val = value.replace(/\n+/g, '\n')
      copyData(val)
      toast('复制成功', { icon: '✅' })
    },
    [copyData]
  )

  // 初始化聊天框
  useQuery(
    ['init'],
    () => {
      return getModelWithChatById(modelId)
    },
    {
      async onSuccess(res) {
        setModel(res.model)
        setChat(res.chat)
        setChatData({
          ...res.chat,
          history: res.chat.history.map((item) => ({
            ...item,
            status: 'finish',
          })),
        })
        if (res.chat.history.length > 0) {
          setTimeout(() => {
            scrollToBottom()
          }, 500)
        } else {
          const newChatList: ChatSiteItemType[] = [
            ...chatData.history,
            {
              obj: 'AI',
              value: '',
              status: 'loading',
            },
          ]

          // 插入内容
          setChatData((state) => ({
            ...state,
            history: newChatList,
          }))

          function sleep(ms: number) {
            return new Promise((resolve) => setTimeout(resolve, ms))
          }
          const howToUse = res.model.howToUse
          for (const char of howToUse.split('')) {
            await sleep(Math.random() * 50)
            setChatData((state) => ({
              ...state,
              history: state.history.map((item, index) => {
                if (index !== state.history.length - 1) return item
                return {
                  ...item,
                  value: item.value + char,
                }
              }),
            }))
          }
          // 保存对话信息
          try {
            if (res.chat && res.chat.chatId) {
              await postSaveChat({
                chatId: res.chat.chatId,
                prompts: [
                  {
                    obj: 'AI',
                    value: howToUse,
                  },
                ],
              })
            }
          } catch (err) {
            toast('对话出现异常, 继续对话会导致上下文丢失，请刷新页面', {
              icon: '🔴',
            })
          }
          setChatData((state) => ({
            ...state,
            history: state.history.map((item, index) => {
              if (index !== state.history.length - 1) return item
              return {
                ...item,
                status: 'finish',
              }
            }),
          }))
        }
      },
      onError(e: any) {
        toast(e?.message || '初始化异常,请检查地址' || '聊天出错了~', {
          icon: '🔴',
        })
      },
    }
  )

  // 更新流中断对象
  useEffect(() => {
    controller.current = new AbortController()
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      controller.current?.abort()
    }
  }, [])

  const textChange = useCallback((e: any) => {
    const textarea = e.target
    setInputVal(textarea.value)
  }, [])

  const bottomRef = useRef<null | HTMLDivElement>(null)
  const copyRef = useRef<null | HTMLDivElement>(null)
  const touchYRef = useRef(0)

  useEffect(() => {
    if (bottomRef.current && chatData.history.length > 2) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [chatData])

  function handleTochMove(e: TouchEvent) {
    // @ts-ignore
    const touchY = e.touches[0].clientY
    if (touchY > touchYRef.current) {
      bottomRef.current = null
    }
    touchYRef.current = touchY
  }

  function handleWheelEvent(e: WheelEvent) {
    if (e.deltaY < 0) {
      bottomRef.current = null
    }
  }

  useEffect(() => {
    copyRef.current = bottomRef.current
  }, [])

  useEffect(() => {
    bottomRef.current = copyRef.current
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      document.addEventListener('touchmove', handleTochMove)
    } else {
      document.addEventListener('wheel', handleWheelEvent)
    }

    return () => {
      document.removeEventListener('touchmove', handleTochMove)
      document.removeEventListener('wheel', handleWheelEvent)
    }
  }, [chatData.history.length])
  const [saving, setSaving] = useState(false)

  const stop = useRef(false)

  function handleStop() {
    stop.current = true
    setChatData((state) => ({
      ...state,
      history: state.history.map((item, index) => {
        if (index !== state.history.length - 1) return item
        return {
          ...item,
          status: 'finish',
        }
      }),
    }))
  }
  function handleSave() {
    // cause we always have a system message at the first
    if (chatData.history.length < 2) return
    setSaving(true)
    // updateSavingStatus(true);

    const node = document.getElementById('save-as-image')
    if (node) {
      toPng(node)
        .then(function (dataUrl) {
          setSaving(false)
          download(dataUrl, 'conversations.png')
        })
        .catch(function (error) {
          setSaving(false)
          toast(error.message || '保存图片异常', { icon: `🔴` })
        })
    }
  }

  return model ? (
    <>
      <NextSeo
        title={model.name}
        description={model.intro}
        additionalLinkTags={[
          {
            rel: 'icon',
            href: `${createAvatar(adventurer, {
              seed: model.name,
            }).toDataUriSync()}`,
          },
        ]}
      />

      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center py-2">
        <main className="mt-12 flex w-full flex-1 flex-col items-center justify-center px-4 text-center sm:mt-20">
          <h1 className="max-w-[708px] text-2xl font-bold text-slate-900 sm:text-4xl">
            {model.name}
          </h1>
          {/*<p className="mt-6 w-9/12 text-lg font-semibold leading-8 text-gray-600">*/}
          {/*  {model.intro}*/}
          {/*</p>*/}
          <div className="flex w-full flex-col items-center ">
            <div className="mt-16 flex w-full flex-1 flex-col items-center text-center">
              <div
                className="w-full max-w-5xl text-left font-sans leading-tight dark:text-slate-200"
                ref={bottomRef}
                id="save-as-image"
              >
                {chatData.history.map((content, index) => (
                  <ChatLine
                    key={index}
                    index={index}
                    chatMsg={content}
                    onDelete={delChatRecord}
                    onCopy={onclickCopy}
                    saving={saving}
                  />
                ))}

                {/*{loading && <LoadingChatLine />}*/}

                <InputMessage
                  saving={saving}
                  handleSave={handleSave}
                  input={inputVal}
                  handleStop={handleStop}
                  isWebSearch={isWebSearch}
                  setIsWebSearch={setIsWebSearch}
                  sendPrompt={sendPrompt}
                  textChange={textChange}
                  isChatting={isChatting}
                  clearHistory={clearHistory}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  ) : (
    <></>
  )
}

export default ChatDogge
