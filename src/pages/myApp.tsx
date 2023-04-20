import React, { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'
import { SearchInput } from '@/components/SearchInput'
import AppList from '@/components/AppList'
import * as R from 'ramda'
import { Button } from '@/components/Button'
import { useUserStore } from '@/store/user'
import { useQuery } from '@tanstack/react-query'
import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { Hero } from '@/components/Hero'
import AppListLoading from '@/components/AppListLoading'

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale!, ['common'])),
    },
    // TODO: disabled because of i18n, and switched to CSR
    // revalidate: 120, // In seconds
  }
}
const MyApp = () => {
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
            <AppList list={myModels} models={getMyModels} isMy={true} />
          </div>
        </div>
      </main>
    </>
  )
}

export default MyApp
