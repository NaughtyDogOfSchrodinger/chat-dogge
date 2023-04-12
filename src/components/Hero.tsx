import { Container } from '@/components/Container'
import { useTranslation } from 'next-i18next'

import Balancer from 'react-wrap-balancer'
import { motion } from 'framer-motion'
import { FADE_DOWN_ANIMATION_VARIANTS } from '@/utils/constants'
import Link from 'next/link'
import Image from 'next/image'
export function Hero() {
  // @ts-ignore
  const { t } = useTranslation('common')

  return (
    <Container className="flex w-full flex-col items-center justify-center py-32">
      <motion.div
        className="max-w-xl px-5 xl:px-0"
        initial="hidden"
        whileInView="show"
        animate="show"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.15,
            },
          },
        }}
      >
        <motion.h1
          className="font-display bg-gradient-to-br from-black to-stone-500 bg-clip-text text-center text-4xl font-bold tracking-[-0.02em] text-transparent drop-shadow-sm md:text-7xl md:leading-[5rem]"
          variants={FADE_DOWN_ANIMATION_VARIANTS}
        >
          <Balancer>{t('slogan_title')}</Balancer>
        </motion.h1>
        <motion.p
          className="mt-6 text-center text-gray-500 md:text-xl"
          variants={FADE_DOWN_ANIMATION_VARIANTS}
        >
          <Balancer>{t('site_desc')}</Balancer>
        </motion.p>
        <motion.div
          className="mx-auto mt-6 flex items-center justify-center space-x-5"
          variants={FADE_DOWN_ANIMATION_VARIANTS}
        >
          <Link
            className="group flex max-w-fit items-center justify-center space-x-2 rounded-full border border-black bg-black px-5 py-2 text-sm text-white transition-colors hover:bg-white hover:text-black"
            href="/app/new"
            // rel="noopener noreferrer"
          >
            {/*<svg*/}
            {/*  className="h-4 w-4 group-hover:text-black"*/}
            {/*  viewBox="0 0 24 24"*/}
            {/*  fill="currentColor"*/}
            {/*  xmlns="http://www.w3.org/2000/svg"*/}
            {/*>*/}
            {/*  <path*/}
            {/*    d="M12 4L20 20H4L12 4Z"*/}
            {/*    stroke="currentColor"*/}
            {/*    strokeWidth="2"*/}
            {/*    strokeLinecap="round"*/}
            {/*    strokeLinejoin="round"*/}
            {/*  />*/}
            {/*</svg>*/}
            <Image src="/favicon.svg" alt="Logo" width={20} height={20} />
            <p>{t('create_app')}</p>
          </Link>
        </motion.div>
      </motion.div>
    </Container>
  )
}
