import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import React from 'react'
import { useRouter } from 'next/router'
import { useUserStore } from '@/store/user'
import { useGlobalStore } from '@/store/global'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
const authPage: { [key: string]: boolean } = {
  '/model/create': true,
  '/myApp': true,
}
const Layout = (props: { children?: JSX.Element | JSX.Element[] }) => {
  const router = useRouter()

  const { userInfo, initUserInfo } = useUserStore()
  const { setLoading } = useGlobalStore()
  useQuery(
    [router.pathname, userInfo],
    () => {
      if (userInfo) {
        return setLoading(false)
      } else {
        setLoading(true)
        return initUserInfo()
      }
    },
    {
      retry: 0,
      onError(error) {
        if (authPage[router.pathname]) {
          router.push('/')
          toast('请先登录', { icon: `🔴` })
        }
      },
      onSettled() {
        setLoading(false)
      },
    }
  )
  return (
    <>
      <Header />
      <main>
        <div className="w-full bg-slate-50 pb-20">
          <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
            {props.children}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default Layout
