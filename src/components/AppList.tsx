import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'next-i18next'
import { FlameIcon, HeartIcon } from 'lucide-react'
import { ModelPopulate, ModelSchema } from '@/types/mongoSchema'
import { useUserStore } from '@/store/user'
import { useCallback } from 'react'
import { postCreateModel, userCollect } from '@/api/model'

interface AppListProps {
  list: Array<ModelPopulate>
}
const AppList = (props: AppListProps) => {
  // @ts-ignore
  const { t } = useTranslation('common')

  const { getAllModels } = useUserStore()

  const handleUserCollect = useCallback(
    async (modelId: string, like: boolean) => {
      try {
        await userCollect({ modelId, like })
        toast(like ? '收藏成功' : '取消收藏成功', { icon: '✅' })
        getAllModels()
      } catch (err: any) {
        toast(typeof err === 'string' ? err : err.message || '出现了意外', {
          icon: '🔴',
        })
      }
    },
    [getAllModels]
  )
  return (
    <ul
      role="list"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3"
    >
      {props.list.map((app) => (
        <div key={app._id} className="card w-auto bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="mx-auto flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-3xl">
              {app.avatar}
            </div>
            <div className="card-title justify-between">
              {app.name}
              <div
                className="badge-secondary badge badge-xs modal-middle border-white bg-white text-black"
                // hidden={hit < 100}
              >
                <FlameIcon className="h-8 w-8 fill-[#f25207] text-[#f25207]" />
                <p className="text-sm text-black"> {app.hitCount}</p>
              </div>
              {/*<div className="badge-secondary badge">NEW</div>*/}
            </div>
            <p className="text-sm text-gray-500">
              {app.intro.length > 40
                ? app.intro.substring(0, 40) + '...'
                : app.intro}
            </p>
            <div className="card-actions modal-middle justify-between">
              <div>
                <HeartIcon
                  onClick={() => handleUserCollect(app._id, !app.like)}
                  className={`${
                    app.like ? 'fill-[#eb3313]' : 'hover:fill-[#eb3313]'
                  } h-5 w-5 text-[#eb3313]`}
                  aria-hidden="true"
                />
              </div>
              <Link
                href={'/model/detail?modelId=' + `${app._id}`}
                className="btn-sm btn bg-black text-white"
              >
                {t('run')}
              </Link>
            </div>
          </div>
        </div>
      ))}
    </ul>
  )
}

export default AppList
