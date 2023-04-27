import AppList from '@/components/AppList'
import AppListLoading from '@/components/AppListLoading'
import { Button } from '@/components/Button'
import { Hero } from '@/components/Hero'
import { SearchInput } from '@/components/SearchInput'
import type { GetStaticProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import * as R from 'ramda'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useUserStore } from '@/store/user'
import { ModelPopulate } from '@/types/mongoSchema'
import { ChatModelNameEnum } from '@/constants/model'

type PageProps = {}

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
  // @ts-ignore
  const { t } = useTranslation('common')

  const { allModels, getAllModels } = useUserStore()

  const { isLoading } = useQuery(['loadModels'], getAllModels)

  const [base, setBase] = useState(false)
  const [knowledge, setKnowledge] = useState(false)

  const list = allModels!.filter((app) => {
    if (base) {
      return (
        app.service.modelName == ChatModelNameEnum.GPT35 &&
        (searchValue
          ? app.name.includes(searchValue) || app.intro.includes(searchValue)
          : true)
      )
    }
    if (knowledge) {
      return (
        app.service.modelName == ChatModelNameEnum.VECTOR_GPT &&
        (searchValue
          ? app.name.includes(searchValue) || app.intro.includes(searchValue)
          : true)
      )
    }

    return searchValue
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
                  base={base}
                  knowledge={knowledge}
                  setBase={setBase}
                  setKnowledge={setKnowledge}
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
                base={base}
                knowledge={knowledge}
                setBase={setBase}
                setKnowledge={setKnowledge}
                setSearchValue={setSearchValue}
                placeholder={`搜索 ${allModels!.length} 个 GPT 应用`}
              />
              <div />
            </div>
            <AppList
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
