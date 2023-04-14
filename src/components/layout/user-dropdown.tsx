import { Dispatch, SetStateAction, useState } from 'react'
import { Dog, LogOut, UnlinkIcon } from 'lucide-react'
import Popover from '@/components/share/popover'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { FADE_IN_ANIMATION_SETTINGS } from '@/utils/constants'
import { useUserStore } from '@/store/user'
import Link from 'next/link'
import { clearToken } from '@/utils/user'

export default function UserDropdown() {
  const { userInfo, clearUserInfo, clearMyModels } = useUserStore()
  const { email, balance } = userInfo || {}
  const [openPopover, setOpenPopover] = useState(false)
  const { getAllModels } = useUserStore()
  if (!userInfo) return null

  return (
    <motion.div
      className="relative inline-block text-left"
      {...FADE_IN_ANIMATION_SETTINGS}
    >
      <Popover
        content={
          <div className="w-full rounded-md bg-white p-2 sm:w-56">
            <button
              className="relative flex w-full cursor-not-allowed items-center justify-start space-x-2 rounded-md p-2 text-left text-sm transition-all duration-75 hover:bg-gray-100"
              disabled
            >
              <Dog className="h-4 w-4" />
              <p className="text-sm">余额 {balance} 元</p>
            </button>
            <button
              className="relative flex w-full items-center justify-start space-x-2 rounded-md p-2 text-left text-sm transition-all duration-75 hover:bg-gray-100"
              onClick={() => {
                clearUserInfo()
                clearMyModels()
                clearToken()
                getAllModels()
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
        >
          <Image
            alt={`${email} | ''`}
            src={`https://avatars.dicebear.com/api/micah/${email}.svg`}
            width={40}
            height={40}
          />
        </button>
      </Popover>
    </motion.div>
  )
}
