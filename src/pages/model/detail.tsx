import { Breadcrumb } from '@/components/Breadcrumb'
import { NextSeo } from 'next-seo'
import { Chat } from '@/components/chat/Chat'
import { getModelById, hitCount } from '@/api/model'
import { ModelSchema } from '@/types/mongoSchema'
import { useGlobalStore } from '@/store/global'
import React, { useCallback, useEffect, useState } from 'react'
import { defaultModel } from '@/constants/model'
import { useQuery } from '@tanstack/react-query'
import { getChatSiteId } from '@/api/chat'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useUserStore } from '@/store/user'
export async function getServerSideProps(context: any) {
  const modelId = context.query?.modelId || ''
  return {
    props: {
      modelId,
      ...(await serverSideTranslations(context.locale!, ['common'])),
    },
  }
}

const ChatDogge = ({ modelId }: { modelId: string }) => {
  const [model, setModel] = useState<ModelSchema>(defaultModel)
  const [chatId, setChatId] = useState<string>()
  const { loading, setLoading } = useGlobalStore()
  const { userInfo } = useUserStore()
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
                <Chat
                  chatId={chatId}
                  modelId={modelId}
                  keyDown={true}
                  callback={async () => {
                    return model.systemPrompt
                  }}
                />
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  )
}

export default ChatDogge
