import { Analytics } from '@vercel/analytics/react'
import { DefaultSeo } from 'next-seo'
import { type AppType } from 'next/app'

import '@/styles/globals.css'
import { DEFAULT_SEO_CONFIG } from '@/utils/seoConfig'
import { toast, Toaster } from 'react-hot-toast'
import { appWithTranslation } from 'next-i18next'
import Layout from '@/components/layout/Layout'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import Script from 'next/script'
import NProgress from 'nprogress' //nprogress module
import 'nprogress/nprogress.css'
import Router from 'next/router'

Router.events.on('routeChangeStart', () => NProgress.start())
Router.events.on('routeChangeComplete', () => NProgress.done())
Router.events.on('routeChangeError', () => NProgress.done())
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      cacheTime: 0,
    },
  },
})
const MyApp: AppType = ({ Component, pageProps: { ...pageProps } }) => {
  return (
    <>
      <Analytics />
      <DefaultSeo {...DEFAULT_SEO_CONFIG} />
      <QueryClientProvider client={queryClient}>
        <Layout>
          <Script src="/js/qrcode.min.js" strategy="afterInteractive"></Script>
          <Script src="/js/pdf.js" strategy="afterInteractive"></Script>
          <Component {...pageProps} />
        </Layout>
      </QueryClientProvider>

      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{ duration: 2000 }}
      />
    </>
  )
}

export default appWithTranslation(MyApp)
