import AppList from '@/components/AppList'
import AppListLoading from '@/components/AppListLoading'
import { Button } from '@/components/Button'
import { Hero } from '@/components/Hero'
import { SearchInput } from '@/components/SearchInput'
import type { GetStaticProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import * as R from 'ramda'
import { useCallback, useState } from 'react'
import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { useUserStore } from '@/store/user'
import { ModelPopulate } from '@/types/mongoSchema'
import { ChatModelNameEnum, ModelSort, modelSortList } from '@/constants/model'
import { SortOrder } from 'mongoose'
import { cron } from '@/api/model'

type PageProps = {}
export const defaultFilterArgs = {
  hitCount: undefined,
  favCount: undefined,
  serviceModelName: undefined,
}
export const getStaticProps: GetStaticProps<PageProps> = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale!, ['common'])),
    },
    // TODO: disabled because of i18n, and switched to CSR
    // revalidate: 120, // In seconds
  }
}

const Home = () => {
  const [searchValue, setSearchValue] = useState('')
  const [sizeToShow, setSizeToShow] = useState(100)
  const [filterArgs, setFilterArgs] = useState<{
    hitCount?: SortOrder
    favCount?: SortOrder
    serviceModelName?: `${ChatModelNameEnum}`
  }>(defaultFilterArgs)
  // @ts-ignore
  const { t } = useTranslation('common')

  const { allModels, getAllModels } = useUserStore()

  const filterCallback = useCallback(
    (name: string) => {
      const sortItems = modelSortList.filter((item) => item.name == name)
      const sortItem = sortItems ? sortItems[0] : undefined
      console.log(`ssdadsadas${sortItem?.hitCount}`)
      const args = {
        hitCount: sortItem?.hitCount,
        favCount: sortItem?.favCount,
        serviceModelName: filterArgs.serviceModelName,
      }
      getAllModels(args)
      setFilterArgs(args)
    },
    [filterArgs, getAllModels]
  )
  const modelSelect = useCallback(
    (name?: ChatModelNameEnum) => {
      const args = {
        hitCount: filterArgs.hitCount,
        favCount: filterArgs.favCount,
        serviceModelName: name,
      }
      getAllModels(args)
      setFilterArgs(args)
    },
    [filterArgs, getAllModels]
  )
  const { isLoading } = useQuery(['loadModels'], () => getAllModels(filterArgs))
  // useQuery([''], () => {
  //   cron()
  // })
  const list = allModels!.filter((app) => {
    return searchValue != ''
      ? app.name.includes(searchValue) || app.intro.includes(searchValue)
      : true
  }) as ModelPopulate[]

  const handleShowMore = () => {
    setSizeToShow(sizeToShow + 100)
  }

  if (isLoading) {
    return (
      <>
        <main>
          <Hero />
          <div className="w-full bg-slate-50 pb-20 pt-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-10 grid grid-cols-1 items-center justify-between pt-10 sm:grid-cols-3 sm:pt-0 ">
                <div />
                <SearchInput
                  modelSelect={modelSelect}
                  filterCallBack={filterCallback}
                  setSearchValue={setSearchValue}
                  placeholder={`搜索 ${allModels!.length} 个 GPT 应用`}
                />
                <div />
              </div>
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
        <Hero />
        <div className="w-full bg-slate-50 pb-20 pt-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 grid grid-cols-1 items-center justify-between pt-10 sm:grid-cols-3 sm:pt-0">
              <div />
              <SearchInput
                modelSelect={modelSelect}
                filterCallBack={filterCallback}
                setSearchValue={setSearchValue}
                placeholder={`搜索 ${allModels!.length} 个 GPT 应用`}
              />
              <div />
            </div>
            <AppList
              filterArgs={filterArgs}
              list={R.take(sizeToShow, list)}
              models={getAllModels}
              isMy={false}
            />

            <div className="mt-10 flex justify-center">
              <Button color="slate" onClick={handleShowMore}>
                {t('load_more')}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default Home
