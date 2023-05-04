import React from 'react'
import AppList from '@/components/AppList'
import { useUserStore } from '@/store/user'
import { useQuery } from '@tanstack/react-query'
import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import AppListLoading from '@/components/AppListLoading'
import { defaultFilterArgs } from '@/pages/index'

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale!, ['common'])),
    },
    // TODO: disabled because of i18n, and switched to CSR
  }
}
const ICreated = () => {
  const { myModels, getMyModels } = useUserStore()

  const { isLoading } = useQuery(['loadModels'], getMyModels)
  if (isLoading) {
    return (
      <>
        <main>
          <div className="w-full bg-slate-50 pb-20 pt-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <AppListLoading />
            </div>
          </div>
        </main>
      </>
    )
  }
  return (
    <>
      <main>
        <div className="w-full bg-slate-50 pb-20 pt-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <AppList
              filterArgs={defaultFilterArgs}
              list={myModels}
              models={getMyModels}
              isMy={true}
            />
          </div>
        </div>
      </main>
    </>
  )
}

export default ICreated
