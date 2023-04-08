import { Breadcrumb } from '@/components/Breadcrumb'
import Layout from '@/components/Layout'
import { useGenerateResult } from '@/hooks/useGenerateResult'
import { appRouter } from '@/server/api/root'
import { prisma } from '@/server/db'
import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetServerSidePropsType,
} from 'next'
import { NextSeo } from 'next-seo'
import { useRef, useState } from 'react'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { Chat } from '@/components/Chat'

type AppConfig = {
  id: string
  name: string
  description: string
  icon: string
  demoInput: string
  hint: string
  prompt: string
}
export type PageProps = {
  appConfig: AppConfig
}

export const getStaticPaths: GetStaticPaths = async () => {
  const caller = appRouter.createCaller({ prisma, session: null })
  const idObjArr = await caller.app.getTopNAppIds(30)
  return {
    paths: idObjArr.map((v) => ({ params: { id: v.id } })),
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps<
  PageProps,
  { id: string }
> = async ({ params, locale }) => {
  const id = params?.id

  if (!id) {
    return { notFound: true } as any
  }

  const caller = appRouter.createCaller({ prisma, session: null })
  const appConfig = await caller.app.getById(id)

  if (!appConfig) {
    return { notFound: true } as any
  }
  return {
    props: {
      appConfig,
      ...(await serverSideTranslations(locale!, ['common'])),
    },
  }
}

const OpenGptApp = (
  props: InferGetServerSidePropsType<typeof getStaticProps>
) => {
  const { description, icon, name, prompt } = props.appConfig
  // @ts-ignore
  const { t } = useTranslation('common')

  return (
    <>
      <NextSeo
        title={name}
        description={description}
        additionalLinkTags={[
          {
            rel: 'icon',
            href: `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${icon}</text></svg>`,
          },
        ]}
      />

      <Layout>
        <Breadcrumb pages={[]} />
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center py-2">
          <main className="mt-12 flex w-full flex-1 flex-col items-center justify-center px-4 text-center sm:mt-20">
            <h1 className="max-w-[708px] text-2xl font-bold text-slate-900 sm:text-4xl">
              {name}
            </h1>
            <p className="mt-6 w-9/12 text-lg font-semibold leading-8 text-gray-600">
              {prompt}
            </p>
            <div className="w-full max-w-xl">
              <section className="flex flex-col gap-3 ">
                <div className="lg:w-6/1 ">
                  <Chat
                    keyDown={true}
                    callback={async () => {
                      return prompt
                    }}
                  />
                </div>
              </section>
            </div>
          </main>
        </div>
      </Layout>
    </>
  )
}
export default OpenGptApp
