import { DefaultSeoProps } from 'next-seo'

export const SITE_DESC =
  '立即使用海量的 Prompt 应用，或在几秒钟内创建属于自己的应用。'
export const DEFAULT_SEO_CONFIG: DefaultSeoProps = {
  title: 'ChatDogge - Create Prompt Application in seconds',
  titleTemplate: '%s | ChatDogge',
  defaultTitle: 'ChatDogge - Create Prompt Application in seconds',
  description: SITE_DESC,
  openGraph: {
    images: [
      {
        url: 'https://www.chatdogge.xyz/og-image.png',
        alt: 'Og Image Alt',
      },
    ],
    type: 'website',
    locale: 'en_IE',
    url: 'https://www.chatdogge.xyz/',
    siteName: 'ChatDogge',
  },
  additionalLinkTags: [
    {
      rel: 'icon',
      href: '/favicon.png',
    },
  ],
}
