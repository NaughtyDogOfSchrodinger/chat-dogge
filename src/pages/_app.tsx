import { Analytics } from '@vercel/analytics/react'
import { type Session } from 'next-auth'
import { DefaultSeo } from 'next-seo'
import { type AppType } from 'next/app'

import { api } from '@/utils/api'

import '@/styles/globals.css'
import { DEFAULT_SEO_CONFIG } from '@/utils/seoConfig'
import { toast, Toaster } from 'react-hot-toast'
import { appWithTranslation } from 'next-i18next'
import { SessionProvider } from 'next-auth/react'
import Layout from '@/components/layout/Layout'
import { useRouter } from 'next/router'
import { useSignInModal } from '@/components/layout/sign-in-modal'
import { useUserStore } from '@/store/user'
import { useGlobalStore } from '@/store/global'
import { useQuery } from '@tanstack/react-query'

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
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
        if (router.pathname == '/app/new') {
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
      <Analytics />
      <DefaultSeo {...DEFAULT_SEO_CONFIG} />
      <SessionProvider session={session}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </SessionProvider>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{ duration: 2000 }}
      />
    </>
  )
}

export default api.withTRPC(appWithTranslation(MyApp))
