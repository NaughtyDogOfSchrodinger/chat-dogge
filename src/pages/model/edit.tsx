import React, { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import { ModelSchema } from '@/types/mongoSchema'
import {
  ChatModelNameEnum,
  defaultModel,
  ModelDataStatusMap,
  modelList,
  ModelStatusEnum,
} from '@/constants/model'
import { useForm } from 'react-hook-form'
import { useGlobalStore } from '@/store/global'
import {
  delModelById,
  delOneModelData,
  getModelById,
  getModelDataList,
  getModelSplitDataListLen,
  putModelById,
  putModelTrainingStatus,
} from '@/api/model'
import { useQuery } from '@tanstack/react-query'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/router'
import { useDisclosure } from '@chakra-ui/react'
import { Breadcrumb } from '@/components/Breadcrumb'

// const InputModel = dynamic(() => import('./components/InputDataModal'))
// const SelectFileModel = dynamic(() => import('./components/SelectFileModal'))
// const SelectUrlModel = dynamic(() => import('./components/SelectUrlModal'))
// const SelectJsonModel = dynamic(() => import('./components/SelectJsonModal'))
import { useSelectFile } from '@/components/dataImport/select-file-modal'
import { useSelectUrl } from '@/components/dataImport/select-url-modal'
import { usePagination } from '@/hooks/usePagination'
import { RedisModelDataItemType } from '@/types/redis'

export async function getServerSideProps(context: any) {
  const modelId = context.query?.modelId || ''
  return {
    props: {
      modelId,
      ...(await serverSideTranslations(context.locale!, ['common'])),
    },
  }
}
const Edit = ({ modelId }: { modelId: string }) => {
  const { setLoading } = useGlobalStore()
  const router = useRouter()

  const [model, setModel] = useState<ModelSchema>(defaultModel)
  const formHooks = useForm<ModelSchema>({
    defaultValues: model,
  })

  const canTrain = useMemo(() => {
    const openai = modelList.find(
      (item) => item.model === model?.service.modelName
    )
    return !!(openai && openai.trainName)
  }, [model])

  const canImport = useMemo(() => {
    const modelInstance = modelList.find(
      (item) => item.model === model?.service.modelName
    )
    return modelInstance && modelInstance.model == ChatModelNameEnum.VECTOR_GPT
  }, [model])
  const [sliderValue, setSliderValue] = useState(0)

  /* 加载模型数据 */
  const loadModel = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getModelById(modelId)
      // console.log(res);
      res.security.expiredTime /= 60 * 60 * 1000
      setModel(res)
      setSliderValue(res.temperature)
      formHooks.reset(res)
    } catch (err) {
      console.log('error->', err)
    }
    setLoading(false)
    return null
  }, [formHooks, modelId, setLoading])

  useQuery([modelId], loadModel)

  /* 点击删除 */
  const handleDelModel = useCallback(async () => {
    if (!model) return
    setLoading(true)
    try {
      await delModelById(model._id)
      toast('删除成功', { icon: '✅' })
      router.replace('/')
    } catch (err) {
      console.log('error->', err)
    }
    setLoading(false)
  }, [setLoading, model, router])

  /* 点前往聊天预览页 */
  const handlePreviewChat = useCallback(async () => {
    setLoading(true)
    try {
      router.push(`/model/detail?modelId=${model._id}`)
    } catch (err) {
      console.log('error->', err)
    }
    setLoading(false)
  }, [setLoading, model, router])
  function handleSliderChange(event: any) {
    setSliderValue(event.target.value)
  }
  /* 点击更新模型状态 */
  const handleClickUpdateStatus = useCallback(async () => {
    if (!model || model.status !== ModelStatusEnum.training) return
    setLoading(true)

    try {
      const res = await putModelTrainingStatus(model._id)
      typeof res === 'string' && toast(res, { icon: '✅' })

      loadModel()
    } catch (error: any) {
      console.log('error->', error)
      toast(error.message || '更新失败', { icon: '🔴' })
    }
    setLoading(false)
  }, [model, setLoading, loadModel])

  // 提交保存模型修改
  const saveSubmitSuccess = useCallback(
    async (data: ModelSchema) => {
      setLoading(true)
      try {
        await putModelById(data._id, {
          name: data.name,
          systemPrompt: data.systemPrompt,
          intro: data.intro,
          temperature: data.temperature,
          service: data.service,
          security: data.security,
        })
        toast('更新成功', { icon: '✅' })
      } catch (err) {
        console.log('error->', err)
        toast(err as string, { icon: '🔴' })
      }
      setLoading(false)
    },
    [setLoading]
  )

  // 提交保存表单失败
  const saveSubmitError = useCallback(() => {
    // deep search message
    const deepSearch = (obj: any): string => {
      if (!obj) return '提交表单错误'
      if (!!obj.message) {
        return obj.message
      }
      return deepSearch(Object.values(obj)[0])
    }
    toast(deepSearch(formHooks.formState.errors), { icon: '🔴' })
  }, [formHooks.formState.errors])

  // const { openConfirm, ConfirmChild } = useConfirm({
  //   content: '确认删除该模型?'
  // });
  const { register, setValue, getValues } = formHooks

  const { FileModal, setShowFileModal } = useSelectFile({
    modelId: model._id,
  })

  const { UrlModal, setShowUrlModal } = useSelectUrl({
    modelId: model._id,
  })

  const {
    data: modelDataList,
    isLoading,
    Pagination,
    total,
    getData,
    pageNum,
  } = usePagination<RedisModelDataItemType>({
    api: getModelDataList,
    pageSize: 10,
    params: {
      modelId: modelId,
    },
  })

  const { data: splitDataLen, refetch } = useQuery(
    ['getModelSplitDataList'],
    () => getModelSplitDataListLen(modelId)
  )

  const refetchData = useCallback(
    (num = 1) => {
      getData(num)
      refetch()
    },
    [getData, refetch]
  )

  const [dataImportOpen, setDataImportOpen] = useState(false)

  const toggleOpen = (flag: boolean) => {
    setDataImportOpen(flag)
  }
  return (
    <>
      <FileModal />
      <UrlModal />
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

      {/*<Breadcrumb pages={[]} />*/}
      <main>
        <div className="container mx-auto overflow-x-auto">
          <div className="flex w-full flex-col lg:flex-row">
            <div className="h-100 card rounded-box grid flex-grow place-items-center bg-white pb-20 pt-10">
              <div className="form-control w-full max-w-xs gap-4">
                <div className="flex justify-start">
                  <button
                    className="btn-sm btn"
                    onClick={() => handlePreviewChat()}
                  >
                    对话
                  </button>
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">模型ID</span>
                  </label>
                  <input
                    type="text"
                    placeholder="modelID"
                    className="input-bordered input w-full max-w-xs"
                    disabled={true}
                    value={model._id}
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">底层模型</span>
                  </label>
                  <input
                    type="text"
                    placeholder="底层模型名称"
                    className="input-bordered input w-full max-w-xs"
                    value={
                      // @ts-ignore
                      modelList.find(
                        (item) => item.model === getValues('service.modelName')
                      ).name
                    }
                    disabled={true}
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">模型名称</span>
                  </label>
                  <input
                    type="text"
                    placeholder="model"
                    className="input-bordered input w-full max-w-xs"
                    {...register('name', {
                      required: '展示名称不能为空',
                    })}
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">模型描述</span>
                  </label>
                  <input
                    type="text"
                    placeholder="模型描述"
                    className="input-bordered input w-full max-w-xs"
                    {...register('intro', {
                      required: '介绍不能为空',
                    })}
                  />
                </div>
              </div>
            </div>
            {/*<div className="divider lg:divider-horizontal"></div>*/}
            <div className="h-100 card rounded-box grid flex-grow place-items-center bg-white">
              <div className="form-control w-full max-w-xs gap-3">
                <div>
                  <label className="label">
                    <span className="label-text">发散能力</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={sliderValue}
                    className="range"
                    onChange={(e) => {
                      handleSliderChange(e)
                      setValue('temperature', sliderValue)
                    }}
                  />
                  <label className="label">
                    <span className="label-text">
                      越高发散能力越强，越低越严谨
                    </span>
                  </label>
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">系统指令</span>
                  </label>
                  <textarea
                    className="textarea-bordered textarea h-40 w-full max-w-xs resize-none"
                    {...register('systemPrompt')}
                    placeholder={
                      canTrain
                        ? '训练的模型会根据知识库内容，生成一部分系统提示词，因此在对话时需要消耗更多的 tokens。你仍可以增加一些提示词，让其效果更精确。'
                        : '模型默认的 prompt 词，通过调整该内容，可以生成一个限定范围的模型。\n\n注意，改功能会影响对话的整体朝向！'
                    }
                  />
                </div>
                <div className="flex  justify-between">
                  <button
                    className="btn-xs btn border-red-500 bg-red-500 hover:border-red-600 hover:bg-red-600"
                    onClick={() => handleDelModel()}
                  >
                    删除模型
                  </button>
                  <button
                    className="btn-xs btn hover:border-black hover:bg-black"
                    onClick={formHooks.handleSubmit(
                      saveSubmitSuccess,
                      saveSubmitError
                    )}
                  >
                    保存修改
                  </button>
                </div>
              </div>
            </div>
          </div>
          {canImport ? (
            <>
              <div className="divider"></div>
              <div className="card rounded-box grid w-full flex-grow overflow-x-auto bg-white py-5 px-5">
                <div className="flex flex-none items-start justify-between py-1">
                  <p className=" text-xl text-sm">{`模型数据: ${total} 组`}</p>
                  {!!(splitDataLen && splitDataLen > 0) && (
                    <p>{splitDataLen}条数据正在拆分...</p>
                  )}
                  <div className="flex items-center justify-end">
                    {/*<div>*/}
                    {/*  <button className="btn-xs btn ">导出</button>*/}
                    {/*</div>*/}
                    <div className="dropdown-end dropdown ">
                      <label
                        tabIndex={0}
                        className="btn-xs btn"
                        onClick={() => toggleOpen(true)}
                      >
                        导入
                      </label>
                      {dataImportOpen ? (
                        <ul
                          tabIndex={0}
                          className="dropdown-content menu rounded-box menu-compact mt-3 w-52 bg-base-100 p-2 shadow"
                        >
                          <li>
                            <label
                              htmlFor="my-modal-3"
                              className="justify-between active:bg-black"
                              onClick={() => {
                                toggleOpen(false)
                                setShowFileModal(true)
                              }}
                            >
                              文件QA拆分
                            </label>
                          </li>
                          <li>
                            <button
                              className="justify-between active:bg-black"
                              onClick={() => {
                                toggleOpen(false)
                                setShowUrlModal(true)
                              }}
                            >
                              网站内容QA拆分
                            </button>
                          </li>
                          {/*<li>*/}
                          {/*  <button*/}
                          {/*    className="justify-between active:bg-black"*/}
                          {/*    onClick={onOpenSelectJsonModal}*/}
                          {/*  >*/}
                          {/*    JSON导入*/}
                          {/*  </button>*/}
                          {/*</li>*/}
                        </ul>
                      ) : (
                        <></>
                      )}
                    </div>
                  </div>
                </div>
                <div className="h-1/2">
                  <table className="table-compact table w-full">
                    {/* head */}
                    <thead>
                      <tr>
                        {/*<th></th>*/}
                        <th className="w-1/3 px-4 py-2">Q</th>
                        <th className="w-1/3 px-4 py-2">A</th>
                        <th className="w-1/9 px-4 py-2 text-center">status</th>
                        <th className="w-1/9 px-4 py-2 text-center">setting</th>
                        <th className="w-1/9 px-4 py-2 text-center">delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modelDataList.map((item) => (
                        <tr key={item.id}>
                          <td className="h-8 border px-3 text-sm">{item.q}</td>
                          <td className="h-8 whitespace-pre-wrap border px-3 text-sm">
                            {item.text}
                          </td>
                          <td className="h-8 border px-1 text-center text-sm">
                            {ModelDataStatusMap[item.status]}
                          </td>
                          <th className="h-8 border px-1 text-center text-sm">
                            <Link
                              className="link-neutral link"
                              href="src/pages#"
                            >
                              编辑
                            </Link>
                          </th>
                          <th className="h-8 border px-1 text-center text-sm">
                            <button
                              className="btn-error btn-xs btn"
                              onClick={async () => {
                                await delOneModelData(item.id)
                                refetchData(pageNum)
                              }}
                            >
                              删除
                            </button>
                          </th>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination />
              </div>
            </>
          ) : (
            <></>
          )}
        </div>
      </main>
    </>
  )
}

export default Edit
