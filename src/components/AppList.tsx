import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'next-i18next'
import { FlameIcon, HeartIcon } from 'lucide-react'
import { ModelPopulate } from '@/types/mongoSchema'
import React, { useCallback, useMemo } from 'react'
import { userCollect } from '@/api/model'
import { ChatModelNameEnum } from '@/constants/model'
import { createAvatar } from '@dicebear/core'
import { adventurer, micah } from '@dicebear/collection'
import Image from 'next/image'
interface AppListProps {
  list: Array<ModelPopulate>
  models: any
  isMy: boolean
  filterArgs: any
}
const AppList = (props: AppListProps) => {
  const { filterArgs } = props
  // @ts-ignore
  const { t } = useTranslation('common')

  const getAllModels = props.models

  const handleUserCollect = useCallback(
    async (modelId: string, like: boolean) => {
      try {
        await userCollect({ modelId, like })
        toast(like ? '收藏成功' : '取消收藏成功', { icon: '✅' })
        getAllModels(filterArgs)
      } catch (err: any) {
        toast(typeof err === 'string' ? err : err.message || '出现了意外', {
          icon: '🔴',
        })
      }
    },
    [filterArgs, getAllModels]
  )
  return (
    <ul
      role="list"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3"
    >
      {props.list.map((app) => (
        <div key={app._id} className="card w-auto bg-base-100 shadow-xl">
          <div className="card-body">
            {/*<div*/}
            {/*  className="mx-auto flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-3xl"*/}
            {/*  dangerouslySetInnerHTML={{*/}
            {/*    __html: `${createAvatar(adventurer, {*/}
            {/*      size: 66,*/}
            {/*      seed: app.name,*/}
            {/*    })}`,*/}
            {/*  }}*/}
            {/*/>*/}
            <div className="mx-auto flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-3xl">
              <Image
                src={`${createAvatar(adventurer, {
                  size: 66,
                  seed: app.name,
                }).toDataUriSync()}`}
                alt={app.name}
                width={66}
                height={66}
              />
            </div>
            <div className="card-title justify-between">
              {app.name}
              <div className="badge-secondary badge badge-xs modal-middle border-white bg-white text-black">
                <FlameIcon className="h-8 w-8 fill-[#f25207] text-[#f25207]" />
                <p className="text-sm text-black"> {app.hitCount}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              {app.intro.length > 40
                ? app.intro.substring(0, 40) + '...'
                : app.intro}
            </p>
            <div className="card-actions modal-middle justify-between">
              <div className="flex gap-1">
                <HeartIcon
                  onClick={() => handleUserCollect(app._id, !app.like)}
                  className={`${
                    app.like ? 'fill-[#eb3313]' : 'hover:fill-[#eb3313]'
                  } h-5 w-5 text-[#eb3313]`}
                  aria-hidden="true"
                />
                <p className="text-sm text-black"> {app.favCount}</p>
              </div>
              <div className="flex justify-end gap-1">
                {props.isMy &&
                app.service.modelName == ChatModelNameEnum.VECTOR_GPT ? (
                  <Link
                    href={'/model/edit?modelId=' + `${app._id}`}
                    className="btn-sm btn bg-black text-white"
                  >
                    训练
                  </Link>
                ) : (
                  ''
                )}
                {props.isMy &&
                app.service.modelName != ChatModelNameEnum.VECTOR_GPT ? (
                  <Link
                    href={'/model/edit?modelId=' + `${app._id}`}
                    className="btn-sm btn bg-black text-white"
                  >
                    编辑
                  </Link>
                ) : (
                  ''
                )}
                <Link
                  href={'/model/detail?modelId=' + `${app._id}`}
                  className="btn-sm btn bg-black text-white"
                >
                  {t('run')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}
    </ul>
  )
}

export default AppList
