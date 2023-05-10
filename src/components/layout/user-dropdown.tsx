import { useState } from 'react'
import { Dog, LogOut } from 'lucide-react'
import Popover from '@/components/share/popover'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FADE_IN_ANIMATION_SETTINGS } from '@/utils/constants'
import { useUserStore } from '@/store/user'
import { createAvatar } from '@dicebear/core'
import { micah } from '@dicebear/collection'

export default function UserDropdown({ callback }: { callback: any }) {
  const { userInfo } = useUserStore()
  const { email } = userInfo || {}
  const [openPopover, setOpenPopover] = useState(false)
  if (!userInfo) return null

  return (
    <motion.div
      className="relative inline-block text-left"
      {...FADE_IN_ANIMATION_SETTINGS}
    >
      <Popover
        content={
          <div className="w-full rounded-md bg-white p-2 sm:w-56">
            <Link
              href={'/me'}
              onClick={() => setOpenPopover(false)}
              className="relative flex w-full cursor-not-allowed items-center justify-start space-x-2 rounded-md p-2 text-left text-sm transition-all duration-75 hover:bg-gray-100"
            >
              <Dog className="h-4 w-4" />
              <p className="text-sm">我的</p>
            </Link>
            <button
              className="relative flex w-full items-center justify-start space-x-2 rounded-md p-2 text-left text-sm transition-all duration-75 hover:bg-gray-100"
              onClick={() => {
                callback()
              }}
            >
              <LogOut className="h-4 w-4" />
              <p className="text-sm">退出登录</p>
            </button>
          </div>
        }
        align="end"
        openPopover={openPopover}
        setOpenPopover={setOpenPopover}
      >
        <button
          onClick={() => setOpenPopover(!openPopover)}
          className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-gray-300 transition-all duration-75 focus:outline-none active:scale-95 sm:h-9 sm:w-9"
          dangerouslySetInnerHTML={{
            __html: `${createAvatar(micah, {
              size: 40,
              seed: email,
            })}`,
          }}
        ></button>
      </Popover>
    </motion.div>
  )
}
