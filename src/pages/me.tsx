import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { useUserStore } from '@/store/user'
import UserComponent from '@/components/User'
import { useGlobalStore } from '@/store/global'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/router'

const Me = () => {
  const router = useRouter()

  const { userInfo, initUserInfo } = useUserStore()
  const { setLoading } = useGlobalStore()
  useQuery(
    [userInfo],
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
        router.push('/')
        toast('请先登录', { icon: `🔴` })
      },
      onSettled() {
        setLoading(false)
      },
    }
  )
  if (userInfo == null) return null
  return <UserComponent user={userInfo} />
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale!, ['common'])),
    },
  }
}

export default Me
