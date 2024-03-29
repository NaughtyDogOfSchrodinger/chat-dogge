import { Popover, Transition } from '@headlessui/react'

import clsx from 'clsx'
import Link from 'next/link'
import { Fragment, useCallback, useMemo } from 'react'
import { Container } from '@/components/Container'
import { NavLink } from '@/components/layout/NavLink'
import { useTranslation } from 'next-i18next'
import { useSignInModal } from '@/components/layout/sign-in-modal'
import { AnimatePresence, motion } from 'framer-motion'
import UserDropdown from '@/components/layout/user-dropdown'
import { FADE_IN_ANIMATION_SETTINGS } from '@/utils/constants'
import { useUserStore } from '@/store/user'
import { clearToken } from '@/utils/user'
import { ResLogin } from '@/api/response/user'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { defaultFilterArgs } from '@/pages'

function MobileNavLink({
  href,
  target,
  children,
}: {
  href: string
  target?: string
  children: React.ReactNode
}) {
  return (
    <Popover.Button
      as={Link}
      href={href}
      target={target || '_self'}
      className="block w-full p-2"
    >
      {children}
    </Popover.Button>
  )
}

function MobileNavIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5 overflow-visible stroke-slate-700"
      fill="none"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <path
        d="M0 1H14M0 7H14M0 13H14"
        className={clsx(
          'origin-center transition',
          open && 'scale-90 opacity-0'
        )}
      />
      <path
        d="M2 2L12 12M12 2L2 12"
        className={clsx(
          'origin-center transition',
          !open && 'scale-90 opacity-0'
        )}
      />
    </svg>
  )
}

const useHeaders = () => {
  // @ts-ignore
  const { t } = useTranslation('common')

  const HEADER_LINKS: Array<{ href: string; label: string; target?: string }> =
    useMemo(
      () => [
        {
          href: '/image',
          label: t('🎨 画图'),
        },
        {
          href: '/usage',
          label: t('💰️ 定价'),
        },
        {
          href: '/model/detail?modelId=6445f34ef691e2c63acac089',
          label: t('💁 客服'),
        },
      ],
      [t]
    )
  return HEADER_LINKS
}

function MobileNavigation() {
  const HEADER_LINKS = useHeaders()
  return (
    <Popover>
      <Popover.Button
        className="relative z-10 flex h-8 w-8 items-center justify-center [&:not(:focus-visible)]:focus:outline-none"
        aria-label="Toggle Navigation"
      >
        {({ open }) => <MobileNavIcon open={open} />}
      </Popover.Button>
      <Transition.Root>
        <Transition.Child
          as={Fragment}
          enter="duration-150 ease-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="duration-150 ease-in"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Popover.Overlay className="fixed inset-0 bg-slate-300/50" />
        </Transition.Child>
        <Transition.Child
          as={Fragment}
          enter="duration-150 ease-out"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="duration-100 ease-in"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Popover.Panel
            as="div"
            className="absolute inset-x-0 top-full mt-4 flex origin-top flex-col rounded-2xl bg-white p-4 text-lg tracking-tight text-slate-900 shadow-xl ring-1 ring-slate-900/5"
          >
            {HEADER_LINKS.map(({ href, label, target }) => (
              <MobileNavLink key={label} href={href} target={target}>
                {label}
              </MobileNavLink>
            ))}
            <hr className="m-2 border-slate-300/40" />
            {/* <MobileNavLink href="/login">Sign in</MobileNavLink> */}
          </Popover.Panel>
        </Transition.Child>
      </Transition.Root>
    </Popover>
  )
}

export function Header() {
  const { SignInModal, setShowSignInModal } = useSignInModal()

  const { userInfo, clearUserInfo, clearMyModels } = useUserStore()
  const router = useRouter()
  const { getAllModels } = useUserStore()
  const loginOut = useCallback(
    (res: ResLogin) => {
      clearUserInfo()
      clearMyModels()
      getAllModels(defaultFilterArgs)
      clearToken()
      router.push('/')
    },
    [clearMyModels, clearUserInfo, getAllModels, router]
  )
  // @ts-ignore
  const HEADER_LINKS = useHeaders()

  return (
    <header className="py-10">
      <Container>
        <nav className="relative z-50 flex justify-between">
          <div className="flex items-center md:gap-x-12">
            <Link href="/" aria-label="Home">
              {/*<Logo className="h-10 w-auto" />*/}
              <Image src="/favicon.svg" alt="Logo" width={40} height={40} />
            </Link>
            <div className="hidden md:flex md:gap-x-6">
              {HEADER_LINKS.map(({ href, label, target }) => (
                <NavLink key={label} href={href} target={target}>
                  {label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-x-5 md:gap-x-8">
            {/*<LanguageSelector />*/}
            <div>
              <AnimatePresence>
                {!userInfo ? (
                  <motion.button
                    className="rounded-full border border-black bg-black p-1.5 px-4 text-sm text-white transition-all hover:bg-white hover:text-black"
                    onClick={() => setShowSignInModal(true)}
                    {...FADE_IN_ANIMATION_SETTINGS}
                  >
                    登录
                  </motion.button>
                ) : (
                  <UserDropdown callback={loginOut} />
                )}
              </AnimatePresence>
            </div>
            <div className="-mr-1 md:hidden">
              <MobileNavigation />
            </div>
            <SignInModal />
          </div>
        </nav>
      </Container>
    </header>
  )
}
