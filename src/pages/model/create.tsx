import { Breadcrumb } from '@/components/Breadcrumb'
import { Button } from '@/components/Button'
import { EmojiField } from '@/components/EmojiField'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/router'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'next-i18next'
import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useCallback, useState } from 'react'
import { toast } from 'react-hot-toast'
import { postCreateModel } from '@/api/model'
import { modelList } from '@/constants/model'
import { ModelSchema } from '@/types/mongoSchema'
import { useUserStore } from '@/store/user'

interface CreateFormType {
  avatar: string
  name: string
  serviceModelName: string
  description: string
  prompt: string
}

const NewApp = () => {
  const router = useRouter()
  // @ts-ignore
  const { t } = useTranslation('common')

  const {
    register,
    handleSubmit,
    control,
    getValues,
    formState: { errors },
  } = useForm<CreateFormType>({
    defaultValues: {
      serviceModelName: modelList[0]?.model,
    },
  })
  const [requesting, setRequesting] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const { myModels, setMyModels, getMyModels } = useUserStore()
  const createModelSuccess = useCallback(
    (data: ModelSchema) => {
      setMyModels([data, ...myModels])
    },
    [myModels, setMyModels]
  )
  // const {
  //   getValues,
  //   register,
  //   handleSubmit,
  //   formState: { errors },
  // } = useForm<CreateFormType>({
  //   defaultValues: {
  //     serviceModelName: modelList[0].model,
  //   },
  // })

  const handleCreateModel = useCallback(
    async (data: CreateFormType) => {
      setRequesting(true)
      try {
        const res = await postCreateModel(data)
        toast('创建成功', { icon: '✅' })
        createModelSuccess(res)
        router.push(`/model/detail?modelId=${res._id}`)
      } catch (err: any) {
        toast(typeof err === 'string' ? err : err.message || '出现了意外', {
          icon: '🔴',
        })
      }
      setRequesting(false)
    },
    [createModelSuccess, router]
  )

  return (
    <>
      <NextSeo title={t('create_app')} />
      <div>
        <Breadcrumb
          pages={[{ name: t('create_app'), href: '#', current: true }]}
        />
        <div className="bg-slate-50 pt-10">
          <div className="mx-auto min-h-screen max-w-xl ">
            <h1 className="py-10 text-center text-2xl font-semibold text-gray-900">
              {t('create_app')}
            </h1>
            <form
              className=" space-y-6"
              onSubmit={handleSubmit(handleCreateModel)}
            >
              <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
                <div className="mt-5 space-y-6 md:col-span-2 md:mt-0">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-3 sm:col-span-2">
                      <label className="block text-sm font-medium leading-6 text-gray-900">
                        {t('icon')}
                      </label>
                      <Controller
                        name="avatar"
                        control={control}
                        defaultValue="🤖"
                        render={({ field }) => (
                          <EmojiField
                            value={field.value}
                            onChange={(value) => field.onChange(value)}
                          />
                        )}
                      />
                      <p className="mt-2 text-sm text-red-500">
                        {errors.avatar && errors.avatar.message}
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        {t('pick_emoji_icon')}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="col-span-3 sm:col-span-2">
                      <label className="block text-sm font-medium leading-6 text-gray-900">
                        {t('app_name')}
                      </label>
                      <div className="mt-2 flex rounded-md shadow-sm">
                        <input
                          type="text"
                          className="block w-full flex-1 rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          placeholder={t('app_name_placeholder')}
                          {...register('name')}
                        />
                      </div>
                      <p className="mt-2 text-sm text-red-500">
                        {errors.name && errors.name.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="col-span-3 sm:col-span-2">
                      <div className="form-control w-full max-w-xs">
                        <label className="label">
                          <span className="label-text">选择基础模型</span>
                        </label>
                        <select
                          className="select-bordered select"
                          {...register('serviceModelName', {
                            required: '底层模型不能为空',
                            onChange() {
                              setRefresh(!refresh)
                            },
                          })}
                        >
                          {modelList.map((item) => (
                            <option key={item.model} value={item.model}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <p className="mt-2 text-sm text-red-500">
                        {!!errors.serviceModelName &&
                          errors.serviceModelName.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="col-span-3 sm:col-span-2">
                      <label className="block text-sm font-medium leading-6 text-gray-900">
                        {t('app_desc')}
                      </label>
                      <div className="mt-2">
                        <textarea
                          rows={3}
                          className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:py-1.5 sm:text-sm sm:leading-6"
                          placeholder={t('app_desc_placeholder')}
                          defaultValue={''}
                          {...register('description')}
                        />
                      </div>
                      <p className="mt-2 text-sm text-red-500">
                        {errors.description && errors.description.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="col-span-3 sm:col-span-2">
                      <label className="block text-sm font-medium leading-6 text-gray-900">
                        {t('prompt')}
                      </label>
                      <div className="mt-2 flex rounded-md shadow-sm">
                        <textarea
                          rows={3}
                          className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:py-1.5 sm:text-sm sm:leading-6"
                          placeholder={t('prompt_desc_placeholder')}
                          defaultValue={''}
                          {...register('prompt')}
                        />
                      </div>
                      <p className="mt-2 text-sm text-red-500">
                        {errors.prompt && errors.prompt.message}
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        {t('prompt_desc')}
                      </p>
                    </div>
                  </div>
                  {/*<section className="flex flex-col gap-3 ">*/}
                  {/*  <div className="lg:w-6/1 ">*/}
                  {/*    <Chat*/}
                  {/*      keyDown={false}*/}
                  {/*      callback={async () => {*/}
                  {/*        return getValues().prompt*/}
                  {/*      }}*/}
                  {/*    />*/}
                  {/*  </div>*/}
                  {/*</section>*/}
                </div>
              </div>

              <div className="flex justify-end gap-3 px-4 sm:px-0">
                <Button
                  variant="solid"
                  color="white"
                  onClick={() => router.push('/')}
                >
                  {t('cancel')}
                </Button>
                <Button
                  variant="solid"
                  color="slate"
                  type="submit"
                  loading={requesting}
                >
                  {t('create')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale!, ['common'])),
    },
  }
}

export default NewApp
