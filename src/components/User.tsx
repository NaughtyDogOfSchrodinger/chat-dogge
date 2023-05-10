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
import { UserBillType, UserType } from '@/types/user'
import { getUserBills } from '@/api/user'
import { BillTypeMap } from '@/constants/user'
import dayjs from 'dayjs'
import Link from 'next/link'
import { getMyFavModels, getMyModels } from '@/api/model'
import { NextSeo } from 'next-seo'
import Image from 'next/image'
import { Footer } from '@/components/layout/Footer'
import { formatPrice } from '@/utils/user'
import { toast } from 'react-hot-toast'

export enum SideNav {
  Home,
  UserInfo,
  Created,
  Favorite,
}
const UserComponent = ({ user }: { user: UserType }) => {
  const [nav, setNav] = useState<SideNav>(SideNav.UserInfo)
  // @ts-ignore
  const { t } = useTranslation('common')
  const {
    isLoading: MyModelLoading,
    data: myModels,
    refetch: refetchMyModels,
  } = useQuery(['myModels'], () => getMyModels(user._id))
  const {
    isLoading: MyFavModelLoading,
    data: myFavModels,
    refetch: refetchMyFavModels,
  } = useQuery(['myFavModels'], () => getMyFavModels(user._id))
  const { userInfo } = useUserStore()
  const { email, balance, createTime } = user

  const {
    data: bills,
    isLoading,
    Pagination,
  } = usePagination<UserBillType>({
    api: getUserBills,
  })

  const [isOpen, setIsOpen] = useState(false)

  function toggleOpen() {
    setIsOpen(true)
  }

  return (
    <>
      <NextSeo
        title={'个人主页'}
        description={`${createAvatar(micah, {
          size: 40,
          seed: email,
        }).toDataUriSync()}个人主页`}
        additionalLinkTags={[
          {
            rel: 'icon',
            href: `${createAvatar(micah, {
              size: 40,
              seed: email,
            }).toDataUriSync()}`,
          },
        ]}
      />

      <div>
        <div className="navbar">
          <div className="navbar-start">
            <div className="dropdown">
              <label
                tabIndex={0}
                className="btn-ghost btn-circle btn"
                onClick={toggleOpen}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h7"
                  />
                </svg>
              </label>
              <ul
                tabIndex={0}
                className={`${
                  isOpen ? '' : 'hidden'
                } dropdown-content menu rounded-box menu-compact mt-3 w-52 bg-base-100 p-2 shadow`}
              >
                <li>
                  <button
                    className={`${
                      nav == SideNav.UserInfo ? 'bg-[#e5e7eb]' : ''
                    } active:bg-[#e5e7eb] active:text-black`}
                    onClick={() => {
                      setIsOpen(false)
                      setNav(SideNav.UserInfo)
                    }}
                  >
                    基本信息
                  </button>
                </li>
                <li>
                  <button
                    className={`${
                      nav == SideNav.Created ? 'bg-[#e5e7eb]' : ''
                    } active:bg-[#e5e7eb] active:text-black`}
                    onClick={() => {
                      setIsOpen(false)
                      setNav(SideNav.Created)
                    }}
                  >
                    {t('🐚️  创建')}
                  </button>
                </li>
                <li>
                  <button
                    className={`${
                      nav == SideNav.Favorite ? 'bg-[#e5e7eb]' : ''
                    } active:bg-[#e5e7eb] active:text-black`}
                    onClick={() => {
                      setIsOpen(false)
                      setNav(SideNav.Favorite)
                    }}
                  >
                    {t('❤️  收藏')}
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="navbar-center">
            <Link href="/" aria-label="Home">
              {/*<Logo className="h-10 w-auto" />*/}
              <Image src="/favicon.svg" alt="Logo" width={40} height={40} />
            </Link>
          </div>
          <div className="navbar-end">
            <button
              className="btn-ghost btn-circle btn"
              onClick={() => toast('努力开发中', { icon: '👨‍💻' })}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
            <button
              className="btn-ghost btn-circle btn"
              onClick={() => toast('努力开发中', { icon: '👨‍💻' })}
            >
              <div className="indicator">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {/*<span className="badge badge-xs badge-primary indicator-item"></span>*/}
              </div>
            </button>
          </div>
        </div>
        {nav == SideNav.UserInfo ? (
          <div className="w-full bg-slate-50 pb-20 pt-10">
            <div className="h-100 card rounded-box grid flex-grow place-items-center pb-20 pt-10">
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
                {user._id == userInfo?._id ? (
                  <div>
                    <label className="label">
                      <span className="label-text">余额</span>
                    </label>
                    <input
                      type="text"
                      placeholder="余额"
                      className="input-bordered input w-full max-w-xs"
                      value={formatPrice(balance)}
                      disabled={true}
                    />
                  </div>
                ) : (
                  <></>
                )}

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
            {user._id == userInfo?._id ? (
              <>
                <div className="divider"></div>
                <div
                  className={` card rounded-box grid w-full flex-grow overflow-x-auto  py-5 px-5`}
                >
                  <div className="overflow-x-auto">
                    <table className=" table-responsive table-compact table w-full table-auto">
                      {/* head */}
                      <thead>
                        <tr>
                          {/*<th></th>*/}
                          <th className="px-4 py-2 text-center">时间</th>
                          <th className="px-4 py-2 text-center">类型</th>
                          <th className="px-4 py-2 text-center">内容长度</th>
                          <th className="px-4 py-2 text-center">Tokens 长度</th>
                          <th className="px-4 py-2 text-center">金额</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!isLoading ? (
                          bills.map((item) => (
                            <tr key={item.id}>
                              <td className="h-8 border px-1 text-center text-sm">
                                {item.time}
                              </td>
                              <td className="h-8 border px-1 text-center text-sm">
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
              </>
            ) : (
              <></>
            )}
          </div>
        ) : nav == SideNav.Created ? (
          <div className="w-full bg-slate-50 pb-20 pt-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {MyModelLoading || !myModels ? (
                <AppListLoading />
              ) : (
                <AppList
                  filterArgs={defaultFilterArgs}
                  list={myModels}
                  models={refetchMyModels}
                  isMy={user._id == userInfo?._id}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="w-full bg-slate-50 pb-20 pt-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {MyFavModelLoading || !myFavModels ? (
                <AppListLoading />
              ) : (
                <AppList
                  filterArgs={defaultFilterArgs}
                  list={myFavModels}
                  models={refetchMyFavModels}
                  isMy={true}
                />
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}

export default UserComponent
