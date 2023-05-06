import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React, { useState } from 'react'
import { useTranslation } from 'next-i18next'
import AppList from '@/components/AppList'
import { defaultFilterArgs } from '@/pages/index'
import { useUserStore } from '@/store/user'
import { useQuery } from '@tanstack/react-query'
import AppListLoading from '@/components/AppListLoading'
import { createAvatar } from '@dicebear/core'
import { micah } from '@dicebear/collection'
import { usePagination } from '@/hooks/usePagination'
import { UserBillType } from '@/types/user'
import { getUserBills } from '@/api/user'
import { BillTypeMap } from '@/constants/user'
import dayjs from 'dayjs'

export enum SideNav {
  UserInfo,
  Created,
  Favorite,
}
const Me = () => {
  const [nav, setNav] = useState<SideNav>(SideNav.UserInfo)
  // @ts-ignore
  const { t } = useTranslation('common')
  const { myModels, getMyModels } = useUserStore()

  const { myFavModels, getMyFavModels } = useUserStore()
  const { isLoading: MyModelLoading } = useQuery(['myModels'], getMyModels)
  const { isLoading: MyFavModelLoading } = useQuery(
    ['myFavModels'],
    getMyFavModels
  )
  const { userInfo } = useUserStore()
  const { email, balance, createTime } = userInfo || {}

  const {
    data: bills,
    isLoading,
    Pagination,
  } = usePagination<UserBillType>({
    api: getUserBills,
  })
  return (
    <div className="flex flex-row items-start">
      <ul className="menu rounded-box w-56 bg-base-100 p-2">
        <li className="menu-title">
          <span>个人信息</span>
        </li>
        <li>
          <button
            className={`${
              nav == SideNav.UserInfo ? 'bg-[#e5e7eb]' : ''
            } active:bg-[#e5e7eb] active:text-black`}
            onClick={() => setNav(SideNav.UserInfo)}
          >
            基本信息
          </button>
        </li>
        <li className="menu-title">
          <span>应用</span>
        </li>
        <li>
          <button
            className={`${
              nav == SideNav.Created ? 'bg-[#e5e7eb]' : ''
            } active:bg-[#e5e7eb] active:text-black`}
            onClick={() => {
              setNav(SideNav.Created)
            }}
          >
            {t('🐚️  我创建的')}
          </button>
        </li>
        <li>
          <button
            className={`${
              nav == SideNav.Favorite ? 'bg-[#e5e7eb]' : ''
            } active:bg-[#e5e7eb] active:text-black`}
            onClick={() => {
              setNav(SideNav.Favorite)
            }}
          >
            {t('❤️  我收藏的')}
          </button>
        </li>
      </ul>
      <div className="divider lg:divider-horizontal"></div>

      {nav == SideNav.UserInfo ? (
        <div className="container mx-auto overflow-x-auto">
          <div className="h-100 card rounded-box grid flex-grow place-items-center bg-white pb-20 pt-10">
            <div className="form-control w-full max-w-xs gap-4">
              <div className="flex gap-2">
                <div
                  className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-gray-300 transition-all duration-75 focus:outline-none active:scale-95 sm:h-20 sm:w-20"
                  dangerouslySetInnerHTML={{
                    __html: `${createAvatar(micah, {
                      size: 80,
                      seed: email,
                    })}`,
                  }}
                ></div>
              </div>
              <div>
                <label className="label">
                  <span className="label-text">邮箱</span>
                </label>
                <input
                  type="text"
                  placeholder="邮箱"
                  className="input-bordered input w-full max-w-xs"
                  value={email}
                  disabled={true}
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">余额</span>
                </label>
                <input
                  type="text"
                  placeholder="余额"
                  className="input-bordered input w-full max-w-xs"
                  value={balance}
                  disabled={true}
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">创建时间</span>
                </label>
                <input
                  type="text"
                  placeholder="创建时间"
                  className="input-bordered input w-full max-w-xs"
                  value={dayjs(createTime).format('YYYY/MM/DD HH:mm:ss')}
                  disabled={true}
                />
              </div>
            </div>
          </div>
          <div className="divider"></div>
          <div className="card rounded-box grid w-full flex-grow overflow-x-auto bg-white py-5 px-5">
            <div className="h-1/2">
              <table className="table-compact table w-full">
                {/* head */}
                <thead>
                  <tr>
                    {/*<th></th>*/}
                    <th className="w-1/3 px-4 py-2">时间</th>
                    <th className="w-1/3 px-4 py-2">类型</th>
                    <th className="w-1/9 px-4 py-2 text-center">内容长度</th>
                    <th className="w-1/9 px-4 py-2 text-center">Tokens 长度</th>
                    <th className="w-1/9 px-4 py-2 text-center">金额</th>
                  </tr>
                </thead>
                <tbody>
                  {!isLoading ? (
                    bills.map((item) => (
                      <tr key={item.id}>
                        <td className="h-8 border px-3 text-sm">{item.time}</td>
                        <td className="h-8 whitespace-pre-wrap border px-3 text-sm">
                          {BillTypeMap[item.type]}
                        </td>
                        <td className="h-8 border px-1 text-center text-sm">
                          {item.textLen}
                        </td>
                        <th className="h-8 border px-1 text-center text-sm">
                          {item.tokenLen}
                        </th>
                        <th className="h-8 border px-1 text-center text-sm">
                          {item.price}元
                        </th>
                      </tr>
                    ))
                  ) : (
                    <></>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination />
          </div>
        </div>
      ) : nav == SideNav.Created ? (
        <div className="w-full bg-slate-50 pb-20 pt-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {MyModelLoading ? (
              <AppListLoading />
            ) : (
              <AppList
                filterArgs={defaultFilterArgs}
                list={myModels}
                models={getMyModels}
                isMy={true}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="w-full bg-slate-50 pb-20 pt-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {MyFavModelLoading ? (
              <AppListLoading />
            ) : (
              <AppList
                filterArgs={defaultFilterArgs}
                list={myFavModels}
                models={getMyFavModels}
                isMy={true}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale!, ['common'])),
    },
  }
}

export default Me
