import { Breadcrumb } from '@/components/Breadcrumb'
import { NextSeo } from 'next-seo'
import { getModelById, hitCount } from '@/api/model'
import { ModelSchema } from '@/types/mongoSchema'
import { useGlobalStore } from '@/store/global'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChatModelNameEnum, defaultModel, modelList } from '@/constants/model'
import { useQuery } from '@tanstack/react-query'
import {
  clearChatRecord,
  delChatRecordByIndex,
  getChatSiteId,
  getInitChatSiteInfo,
  postSaveChat,
} from '@/api/chat'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useUserStore } from '@/store/user'
import { ChatLine } from '@/components/chat/ChatLine'
import { useRouter } from 'next/router'
import { useDisclosure } from '@chakra-ui/react'
import { useCopyData } from '@/utils/tools'
import { useChatStore } from '@/store/chat'
import { toast } from 'react-hot-toast'
import { ChatSiteItemType } from '@/types/chat'
import { streamFetch } from '@/api/fetch'
import { InitChatResponse } from '@/api/response/chat'
import { TrashIcon } from 'lucide-react'
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

export const InputMessage = ({
  input,
  setInput,
  sendPrompt,
  textChange,
  isChatting,
  clearHistory,
}: any) => (
  <div className="modal-middle clear-both mt-6 flex gap-2">
    <button className="badge badge-lg" onClick={() => clearHistory()}>
      <TrashIcon className="text-slate-7 float-right h-4 w-4 hover:fill-black " />
    </button>
    <input
      type="text"
      aria-label="chat input"
      className="min-w-0 flex-auto appearance-none rounded-md border border-zinc-900/10 bg-white px-3 py-[calc(theme(spacing.2)-1px)] shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 sm:text-sm"
      value={input}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          sendPrompt()
          setInput('')
        }
      }}
      onChange={textChange}
    />
    <button
      disabled={isChatting}
      className="btn-sm btn ml-4 flex-none"
      onClick={() => {
        sendPrompt()
        setInput('')
      }}
    >
      发送
    </button>
  </div>
)
const ChatDogge = ({ modelId }: { modelId: string }) => {
  const [model, setModel] = useState<ModelSchema>(defaultModel)
  const [chatId, setChatId] = useState<string>()
  const { userInfo } = useUserStore()
  const { loading, setLoading } = useGlobalStore()

  const loadModel = useCallback(async () => {
    setLoading(true)
    try {
      const chatId = await getChatSiteId(modelId)
      setChatId(chatId)
      const res = await getModelById(modelId)
      await hitCount(modelId)
      console.log(res)
      res.security.expiredTime /= 60 * 60 * 1000
      setModel(res)
    } catch (err) {
      console.log('error->', err)
    }
    setLoading(false)
    return null
  }, [modelId, setLoading])

  useQuery([modelId], loadModel)
  // const router = useRouter()

  /* 点前往聊天预览页 */
  // const handlePreviewChat = useCallback(async () => {
  //   setLoading(true)
  //   try {
  //     const chatId = await getChatSiteId(model._id)
  //
  //     router.push(`/chat?chatId=${chatId}`)
  //   } catch (err) {
  //     console.log('error->', err)
  //   }
  //   setLoading(false)
  // }, [setLoading, model, router])

  const router = useRouter()

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
  const [messages, setMessages] = useState<[]>([])

  const isChatting = useMemo(
    () => chatData.history[chatData.history.length - 1]?.status === 'loading',
    [chatData.history]
  )
  const {
    isOpen: isOpenSlider,
    onClose: onCloseSlider,
    onOpen: onOpenSlider,
  } = useDisclosure()

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

  // 重载对话
  const resetChat = useCallback(async () => {
    if (!chatData) return
    try {
      router.replace(`/chat?chatId=${await getChatSiteId(chatData.modelId)}`)
    } catch (error: any) {
      toast(error?.message || '生成新对话失败', { icon: '🔴' })
    }
    onCloseSlider()
  }, [chatData, onCloseSlider, router])

  // gpt 对话
  const gptChatPrompt = useCallback(
    async (prompts: ChatSiteItemType) => {
      const urlMap: Record<string, string> = {
        [ChatModelNameEnum.GPT35]: '/api/chat/chatGpt',
        [ChatModelNameEnum.VECTOR_GPT]: '/api/chat/vectorGpt',
        [ChatModelNameEnum.GPT3]: '/api/chat/gpt3',
      }

      if (!urlMap[chatData.modelName]) return Promise.reject('找不到模型')

      let prompt
      if (chatId) {
        const newMessages = [
          ...messages,
          { obj: prompts.obj, value: prompts.value },
        ]
        // @ts-ignore
        setMessages(newMessages)
        prompt = newMessages
      } else {
        prompt = [
          {
            obj: prompts.obj,
            value: prompts.value,
          },
        ]
      }
      console.log(`input: ${chatId || modelId}`)
      // 流请求，获取数据
      const res = await streamFetch({
        // @ts-ignore
        url: urlMap[chatData.modelName],
        data: {
          prompt,
          chatOrModelId: chatId || modelId,
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
      })

      // 保存对话信息
      try {
        if (chatId) {
          await postSaveChat({
            chatId,
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
    [chatData.modelName, chatId, messages, modelId]
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
    if (!chatData?.modelId || !val) {
      toast('内容为空', {
        icon: '🔴',
      })
      return
    }

    // 长度校验
    const model = modelList.find((item) => item.model === chatData.modelName)

    if (model && val.length >= model.maxToken) {
      toast('单次输入超出 4000 字符', {
        icon: '🔴',
      })
      return
    }

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
      await hitCount(modelId)

      // @ts-ignore
      await gptChatPrompt(newChatList[newChatList.length - 2])

      // 如果是 Human 第一次发送，插入历史记录
      const humanChat = newChatList.filter((item) => item.obj === 'Human')
      if (humanChat.length === 1) {
        if (chatId) {
          pushChatHistory({
            chatId,
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
    chatData?.modelId,
    chatData.history,
    chatData.modelName,
    resetInputVal,
    scrollToBottom,
    modelId,
    gptChatPrompt,
    chatId,
    pushChatHistory,
  ])

  // 删除一句话
  const delChatRecord = useCallback(
    async (index: number) => {
      setLoading(true)
      try {
        if (chatId) {
          // 删除数据库最后一句
          await delChatRecordByIndex(chatId, index)
        }

        setChatData((state) => ({
          ...state,
          history: state.history.filter((_, i) => i !== index),
        }))
      } catch (err) {
        console.log(err)
      }
      setLoading(false)
    },
    [chatId, setLoading]
  )

  // 删除一句话
  const clearHistory = useCallback(async () => {
    setLoading(true)
    try {
      if (chatId) {
        // 删除数据库最后一句
        await clearChatRecord(chatId)
      }

      setChatData((state) => ({
        ...state,
        history: [],
      }))
    } catch (err) {
      console.log(err)
    }
    setLoading(false)
  }, [chatId, setLoading])

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
    ['init', chatId],
    () => {
      setLoading(true)
      return getInitChatSiteInfo(modelId)
    },
    {
      onSuccess(res) {
        setChatData({
          ...res,
          history: res.history.map((item) => ({
            ...item,
            status: 'finish',
          })),
        })
        if (res.history.length > 0) {
          setTimeout(() => {
            scrollToBottom()
          }, 500)
        }
      },
      onError(e: any) {
        toast(e?.message || '初始化异常,请检查地址' || '聊天出错了~', {
          icon: '🔴',
        })
        // router.push('/model/list')
      },
      onSettled() {
        setLoading(false)
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
  }, [chatId])

  const textChange = useCallback((e: any) => {
    const textarea = e.target
    setInputVal(textarea.value)
  }, [])

  return (
    <>
      <NextSeo
        title={model.name}
        description={model.intro}
        additionalLinkTags={[
          {
            rel: 'icon',
            href: `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${model.avatar}</text></svg>`,
          },
        ]}
      />

      <Breadcrumb pages={[]} />
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center py-2">
        <main className="mt-12 flex w-full flex-1 flex-col items-center justify-center px-4 text-center sm:mt-20">
          <h1 className="max-w-[708px] text-2xl font-bold text-slate-900 sm:text-4xl">
            {model.name}
          </h1>
          <p className="mt-6 w-9/12 text-lg font-semibold leading-8 text-gray-600">
            {model.intro}
          </p>
          <div className="w-full max-w-xl">
            <section className="flex flex-col gap-3 ">
              <div className="lg:w-6/1 ">
                <div className="rounded-2xl border-zinc-100  bg-[#f5f5f7] lg:border lg:p-6">
                  {chatData.history.map((content, index) => (
                    <ChatLine
                      key={index}
                      index={index}
                      chatMsg={content}
                      onDelete={delChatRecord}
                      onCopy={onclickCopy}
                    />
                  ))}

                  {/*{loading && <LoadingChatLine />}*/}

                  <InputMessage
                    input={inputVal}
                    setInput={setInputVal}
                    sendPrompt={sendPrompt}
                    textChange={textChange}
                    isChatting={isChatting}
                    clearHistory={clearHistory}
                  />
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  )
}

export default ChatDogge
