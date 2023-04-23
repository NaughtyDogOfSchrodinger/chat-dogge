import { DefaultSeoProps } from 'next-seo'

export const SITE_DESC = '定制自己的的 GPT 应用。'
export const DEFAULT_SEO_CONFIG: DefaultSeoProps = {
  title: 'ChatDogge - 定制自己的 GPT 应用',
  titleTemplate: '%s | ChatDogge',
  defaultTitle: 'ChatDogge - Customize your own GPT Application',
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
